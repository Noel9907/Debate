import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Block from "../models/block.model.js";

// Socket.IO event handlers for real-time chat
export const setupChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join user to their personal room
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    // Join conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User joined conversation: ${conversationId}`);
    });

    // Leave conversation room
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`User left conversation: ${conversationId}`);
    });

    // Handle sending message via socket
    socket.on("send_message", async (data) => {
      try {
        const {
          conversationId,
          content,
          senderId,
          messageType = "text",
        } = data;

        // Validate conversation and participants
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(senderId)) {
          socket.emit("error", { message: "Invalid conversation" });
          return;
        }

        // Check for blocks
        const otherParticipant = conversation.participants.find(
          (p) => p.toString() !== senderId.toString()
        );
        const isBlocked = await Block.areUsersBlocked(
          senderId,
          otherParticipant
        );
        if (isBlocked) {
          socket.emit("error", {
            message: "Cannot send message to blocked user",
          });
          return;
        }

        // Create and save message
        const message = new Message({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          message_type: messageType,
        });
        await message.save();

        // Emit to conversation room
        io.to(conversationId).emit("new_message", {
          message,
          conversationId,
        });

        // Send push notification to offline users (implement as needed)
        // await sendPushNotification(otherParticipant, message);
      } catch (error) {
        console.error("Socket message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing_start", (data) => {
      const { conversationId, userId, username } = data;
      socket.to(conversationId).emit("user_typing", { userId, username });
    });

    socket.on("typing_stop", (data) => {
      const { conversationId, userId } = data;
      socket.to(conversationId).emit("user_stop_typing", { userId });
    });

    // Handle message read receipts
    socket.on("mark_as_read", async (data) => {
      try {
        const { conversationId, userId } = data;

        // Mark messages as read
        await Message.updateMany(
          {
            conversation_id: conversationId,
            sender_id: { $ne: userId },
            is_read: false,
          },
          { is_read: true }
        );

        // Update conversation unread count
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.resetUnreadCount(userId);
          await conversation.save();
        }

        // Notify other participants
        socket
          .to(conversationId)
          .emit("messages_read", { userId, conversationId });
      } catch (error) {
        console.error("Mark as read error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

// Utility function to get user's total unread messages count
export const getTotalUnreadCount = async (userId) => {
  try {
    const conversations = await Conversation.find({
      participants: userId,
    });

    let totalUnread = 0;
    conversations.forEach((conv) => {
      totalUnread += conv.getUnreadCount(userId);
    });

    return totalUnread;
  } catch (error) {
    console.error("Error getting total unread count:", error);
    return 0;
  }
};

// Utility function to search users for chat (excluding blocked users)
export const searchUsersForChat = async (query, currentUserId, limit = 10) => {
  try {
    // Get list of blocked user IDs
    const blockedUsers = await Block.find({
      $or: [
        { blocker: currentUserId, is_active: true },
        { blocked: currentUserId, is_active: true },
      ],
    }).select("blocker blocked");

    const blockedUserIds = new Set();
    blockedUsers.forEach((block) => {
      if (block.blocker.toString() === currentUserId.toString()) {
        blockedUserIds.add(block.blocked.toString());
      } else {
        blockedUserIds.add(block.blocker.toString());
      }
    });

    // Search users excluding blocked ones and current user
    const excludeIds = Array.from(blockedUserIds);
    excludeIds.push(currentUserId);

    const users = await mongoose
      .model("User")
      .find({
        _id: { $nin: excludeIds },
        $or: [
          { username: { $regex: query, $options: "i" } },
          { fullname: { $regex: query, $options: "i" } },
        ],
      })
      .select("username fullname profilepic")
      .limit(limit);
    return users;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};

// Utility function to clean up old messages (optional - for data management)
export const cleanupOldMessages = async (daysToKeep = 365) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await Message.deleteMany({
      createdAt: { $lt: cutoffDate },
      is_deleted: true,
    });

    console.log(`Cleaned up ${result.deletedCount} old deleted messages`);
    return result.deletedCount;
  } catch (error) {
    console.error("Error cleaning up old messages:", error);
    return 0;
  }
};

// Utility function to get conversation analytics (optional)
export const getConversationStats = async (conversationId) => {
  try {
    const stats = await Message.aggregate([
      {
        $match: {
          conversation_id: new mongoose.Types.ObjectId(conversationId),
        },
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          totalDeleted: {
            $sum: { $cond: [{ $eq: ["$is_deleted", true] }, 1, 0] },
          },
          messagesByType: {
            $push: "$message_type",
          },
          participantMessageCounts: {
            $push: "$sender_id",
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        totalMessages: 0,
        totalDeleted: 0,
        messagesByType: {},
        participantMessageCounts: {},
      };
    }

    const result = stats[0];

    // Count messages by type
    const messageTypeCount = {};
    result.messagesByType.forEach((type) => {
      messageTypeCount[type] = (messageTypeCount[type] || 0) + 1;
    });

    // Count messages by participant
    const participantCount = {};
    result.participantMessageCounts.forEach((senderId) => {
      const id = senderId.toString();
      participantCount[id] = (participantCount[id] || 0) + 1;
    });

    return {
      totalMessages: result.totalMessages,
      totalDeleted: result.totalDeleted,
      messagesByType: messageTypeCount,
      participantMessageCounts: participantCount,
    };
  } catch (error) {
    console.error("Error getting conversation stats:", error);
    return null;
  }
};

// Additional controller functions for extended features
// Add these to your chat.controller.js

// Search users for starting new conversations
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;
    console.log(userId, query);
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const users = await searchUsersForChat(query.trim(), userId);
    console.log(users);
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
    const totalUnread = await getTotalUnreadCount(userId);

    res.status(200).json({
      success: true,
      unread_count: totalUnread,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

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
