// routes/chat.routes.js
import express from "express";
import {
  getConversations,
  startConversation,
  sendMessage,
  getMessages,
  deleteMessage,
  blockUser,
  unblockUser,
  getBlockedUsers,
  checkBlockStatus,
} from "../controllers/chat/chat.controller.js";
import { checkBlocked } from "../middlewares/checkBlocked.js";
import {
  archiveConversation,
  getUnreadCount,
  searchUsers,
} from "../utils/chatUtils.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// Conversation routes
router.get("/conversations", protectRoute, getConversations);
router.post("/conversations", protectRoute, checkBlocked, startConversation);
router.patch(
  "/conversations/:conversationId/archive",
  protectRoute,
  archiveConversation
);

// Message routes
router.post("/messages", protectRoute, sendMessage);
router.get(
  "/conversations/:conversationId/messages",
  protectRoute,
  getMessages
);
router.delete("/messages/:messageId", protectRoute, deleteMessage);

// User search and unread count
router.get("/search", protectRoute, searchUsers);
router.get("/unread-count", protectRoute, getUnreadCount);

// Block routes
router.post("/block", protectRoute, blockUser);
router.post("/unblock", protectRoute, unblockUser);
router.get("/blocked", protectRoute, getBlockedUsers);
router.get("/block-status/:username", protectRoute, checkBlockStatus);

export default router;

// Add this to your main app.js or server.js file:
// import chatRoutes from './routes/chat.routes.js';
// app.use('/api/chat', chatRoutes);
