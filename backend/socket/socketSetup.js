import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { setupChatSocket } from "../utils/chatUtils.js";
import cookie from "cookie";

export const setupSocket = (server) => {
  console.log(process.env.CLIENT);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = cookie.parse(socket.handshake.headers.cookie).jwt;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  // Online users tracking
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`User ${socket.username} connected:`, socket.id);

    // Add user to online users
    onlineUsers.set(socket.userId, {
      socketId: socket.id,
      username: socket.username,
      lastSeen: new Date(),
    });

    // Join user to their personal room
    socket.join(socket.userId);

    // Emit updated online users to all clients
    io.emit("users_online", Array.from(onlineUsers.values()));

    // Handle joining conversation rooms
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`${socket.username} joined conversation: ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`${socket.username} left conversation: ${conversationId}`);
    });

    // Handle typing indicators
    socket.on("typing_start", (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit("user_typing", {
        userId: socket.userId,
        username: socket.username,
      });
    });

    socket.on("typing_stop", (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit("user_stop_typing", {
        userId: socket.userId,
      });
    });

    // Handle real-time message sending
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, content, messageType = "text", replyTo } = data;

        // Import here to avoid circular dependency
        const Conversation = (await import("../models/conversation.model.js"))
          .default;
        const Message = (await import("../models/message.model.js")).default;
        const Block = (await import("../models/block.model.js")).default;

        // Validate conversation
        const conversation = await Conversation.findById(conversationId);
        if (
          !conversation ||
          !conversation.participants.includes(socket.userId)
        ) {
          socket.emit("message_error", { message: "Invalid conversation" });
          return;
        }

        // Check for blocks
        const otherParticipant = conversation.participants.find(
          (p) => p.toString() !== socket.userId
        );
        const isBlocked = await Block.areUsersBlocked(
          socket.userId,
          otherParticipant
        );
        if (isBlocked) {
          socket.emit("message_error", {
            message: "Cannot send message to blocked user",
          });
          return;
        }

        // Create message
        const message = new Message({
          conversation_id: conversationId,
          sender_id: socket.userId,
          sender_username: socket.username,
          content,
          message_type: messageType,
          reply_to: replyTo || null,
        });

        await message.save();

        // Populate reply if exists
        if (replyTo) {
          await message.populate({
            path: "reply_to",
            select: "content sender_username createdAt",
          });
        }

        // Emit to conversation participants
        io.to(conversationId).emit("new_message", {
          message,
          conversationId,
        });

        // Send notification to offline participants
        const offlineParticipants = conversation.participants.filter(
          (participantId) =>
            participantId.toString() !== socket.userId &&
            !onlineUsers.has(participantId.toString())
        );

        // Here you can implement push notifications for offline users
        // await sendPushNotifications(offlineParticipants, message);
      } catch (error) {
        console.error("Socket message error:", error);
        socket.emit("message_error", { message: "Failed to send message" });
      }
    });

    // Handle message read receipts
    socket.on("mark_messages_read", async (data) => {
      try {
        const { conversationId } = data;

        const Message = (await import("../models/message.model.js")).default;
        const Conversation = (await import("../models/conversation.model.js"))
          .default;

        // Mark messages as read
        await Message.updateMany(
          {
            conversation_id: conversationId,
            sender_id: { $ne: socket.userId },
            is_read: false,
          },
          { is_read: true }
        );

        // Update conversation unread count
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.resetUnreadCount(socket.userId);
          await conversation.save();
        }

        // Notify other participants about read receipts
        socket.to(conversationId).emit("messages_read", {
          userId: socket.userId,
          conversationId,
        });
      } catch (error) {
        console.error("Mark as read error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.username} disconnected:`, socket.id);

      // Remove from online users
      onlineUsers.delete(socket.userId);

      // Emit updated online users
      io.emit("users_online", Array.from(onlineUsers.values()));
    });
  });

  return io;
};
