import Conversation from "../../models/conversation.model.js";
import Message from "../../models/message.model.js";
import Block from "../../models/block.model.js";
import User from "../../models/user.model.js";
import mongoose from "mongoose";

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      participants: userId,
      archived_by: { $ne: userId },
    })
      .populate({
        path: "participants",
        select: "username profilepic fullname",
        match: { _id: { $ne: userId } },
      })
      .populate({
        path: "last_message",
        select: "content message_type createdAt sender_username",
      })
      .sort({ last_message_at: -1 })
      .skip(skip)
      .limit(limit);

    // Add unread count for each conversation
    const conversationsWithUnread = conversations.map((conv) => {
      const convObj = conv.toJSON();
      convObj.unread_count = conv.getUnreadCount(userId);
      return convObj;
    });

    res.status(200).json({
      success: true,
      conversations: conversationsWithUnread,
      pagination: {
        page,
        limit,
        hasMore: conversations.length === limit,
      },
    });
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Start a new conversation or get existing one
export const startConversation = async (req, res) => {
  try {
    const { recipientUsername } = req.body;
    const senderId = req.user._id;
    const senderUsername = req.user.username;

    // Find recipient user
    const recipient = await User.findOne({ username: recipientUsername });
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const recipientId = recipient._id;

    // Check if users are blocked
    const isBlocked = await Block.areUsersBlocked(senderId, recipientId);
    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Cannot start conversation with this user",
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findBetweenUsers(
      senderId,
      recipientId
    );

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [senderId, recipientId],
        participant_usernames: [senderUsername, recipientUsername],
      });
      await conversation.save();
    }

    // Populate participants
    await conversation.populate({
      path: "participants",
      select: "username profilepic fullname",
    });

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType = "text", replyTo } = req.body;
    const senderId = req.user._id;
    const senderUsername = req.user.username;

    // Validate conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (!conversation.participants.includes(senderId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    // Check if users are blocked
    const otherParticipant = conversation.participants.find(
      (p) => p.toString() !== senderId.toString()
    );
    const isBlocked = await Block.areUsersBlocked(senderId, otherParticipant);
    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Cannot send message to this user",
      });
    }

    // Create message
    const message = new Message({
      conversation_id: conversationId,
      sender_id: senderId,
      sender_username: senderUsername,
      content,
      message_type: messageType,
      reply_to: replyTo || null,
    });

    await message.save();

    // Populate reply_to if exists
    if (replyTo) {
      await message.populate({
        path: "reply_to",
        select: "content sender_username createdAt",
      });
    }

    // Get Socket.IO instance and emit real-time message
    const io = req.app.get("io");
    if (io) {
      io.to(conversationId).emit("new_message", {
        message,
        conversationId,
      });

      // Notify the recipient if they're online but not in the conversation room
      io.to(otherParticipant.toString()).emit("new_message_notification", {
        message,
        conversationId,
        sender: {
          username: senderUsername,
          _id: senderId,
        },
      });
    }

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Validate conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    // Get messages
    const messages = await Message.find({
      conversation_id: conversationId,
      is_deleted: false,
    })
      .populate({
        path: "reply_to",
        select: "content sender_username createdAt",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark messages as read
    await Message.updateMany(
      {
        conversation_id: conversationId,
        sender_id: { $ne: userId },
        is_read: false,
      },
      { is_read: true }
    );

    // Reset unread count for this user
    conversation.resetUnreadCount(userId);
    await conversation.save();

    // Emit read receipt via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.to(conversationId).emit("messages_read", {
        userId: userId.toString(),
        conversationId,
      });
    }

    res.status(200).json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit,
      },
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only sender can delete their message
    if (message.sender_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    message.is_deleted = true;
    message.deleted_at = new Date();
    message.content = "This message was deleted";
    await message.save();

    // Emit message deletion via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.to(message.conversation_id.toString()).emit("message_deleted", {
        messageId,
        conversationId: message.conversation_id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Search users for starting new conversations
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;
    console.log("req");

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    // Get list of blocked user IDs
    const blockedUsers = await Block.find({
      $or: [
        { blocker: userId, is_active: true },
        { blocked: userId, is_active: true },
      ],
    }).select("blocker blocked");

    const blockedUserIds = new Set();
    blockedUsers.forEach((block) => {
      if (block.blocker.toString() === userId.toString()) {
        blockedUserIds.add(block.blocked.toString());
      } else {
        blockedUserIds.add(block.blocker.toString());
      }
    });

    // Search users excluding blocked ones and current user
    const excludeIds = Array.from(blockedUserIds);
    excludeIds.push(userId);

    const users = await User.find({
      _id: { $nin: excludeIds },
      $or: [
        { username: { $regex: query.trim(), $options: "i" } },
        { fullname: { $regex: query.trim(), $options: "i" } },
      ],
    })
      .select("username fullname profilepic")
      .limit(10);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get total unread messages count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    });

    let totalUnread = 0;
    conversations.forEach((conv) => {
      totalUnread += conv.getUnreadCount(userId);
    });

    res.status(200).json({
      success: true,
      unread_count: totalUnread,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Archive/Unarchive conversation
export const archiveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { archive = true } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    if (archive) {
      if (!conversation.archived_by.includes(userId)) {
        conversation.archived_by.push(userId);
      }
    } else {
      conversation.archived_by = conversation.archived_by.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

    await conversation.save();

    res.status(200).json({
      success: true,
      message: archive ? "Conversation archived" : "Conversation unarchived",
    });
  } catch (error) {
    console.error("Error archiving conversation:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Block user
export const blockUser = async (req, res) => {
  try {
    const { username, reason } = req.body;
    const blockerId = req.user._id;
    const blockerUsername = req.user.username;

    // Find user to block
    const userToBlock = await User.findOne({ username });
    if (!userToBlock) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (userToBlock._id.toString() === blockerId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself",
      });
    }

    // Check if already blocked
    const existingBlock = await Block.findOne({
      blocker: blockerId,
      blocked: userToBlock._id,
    });

    if (existingBlock && existingBlock.is_active) {
      return res.status(400).json({
        success: false,
        message: "User is already blocked",
      });
    }

    if (existingBlock && !existingBlock.is_active) {
      // Reactivate existing block
      existingBlock.is_active = true;
      existingBlock.reason = reason;
      existingBlock.unblocked_at = null;
      await existingBlock.save();
    } else {
      // Create new block
      const block = new Block({
        blocker: blockerId,
        blocked: userToBlock._id,
        blocker_username: blockerUsername,
        blocked_username: username,
        reason,
      });
      await block.save();
    }

    // Notify the blocked user via Socket.IO (optional)
    const io = req.app.get("io");
    if (io) {
      io.to(userToBlock._id.toString()).emit("user_blocked", {
        blockedBy: blockerUsername,
      });
    }

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Unblock a user
export const unblockUser = async (req, res) => {
  try {
    const { username } = req.body;
    const blockerId = req.user._id;

    // Find user to unblock
    const userToUnblock = await User.findOne({ username });
    if (!userToUnblock) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find and update block
    const block = await Block.findOne({
      blocker: blockerId,
      blocked: userToUnblock._id,
      is_active: true,
    });

    if (!block) {
      return res.status(404).json({
        success: false,
        message: "User is not blocked",
      });
    }

    block.is_active = false;
    block.unblocked_at = new Date();
    await block.save();

    res.status(200).json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get blocked users list
export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const blockedUsers = await Block.getBlockedUsers(userId, page, limit);

    res.status(200).json({
      success: true,
      blocked_users: blockedUsers,
      pagination: {
        page,
        limit,
        hasMore: blockedUsers.length === limit,
      },
    });
  } catch (error) {
    console.error("Error getting blocked users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Check if user is blocked
export const checkBlockStatus = async (req, res) => {
  try {
    const { username } = req.params;
    const userId = req.user._id;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isBlocked = await Block.areUsersBlocked(userId, user._id);

    res.status(200).json({
      success: true,
      is_blocked: isBlocked,
    });
  } catch (error) {
    console.error("Error checking block status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
