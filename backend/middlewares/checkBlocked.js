import Block from "../models/block.model.js";
import mongoose from "mongoose";
export const checkBlocked = async (req, res, next) => {
  try {
    const { recipientId, recipientUsername } = req.body;
    const userId = req.user._id;

    let targetUserId = recipientId;

    // If username is provided instead of ID, find the user
    if (recipientUsername && !recipientId) {
      const User = mongoose.model("User");
      const user = await User.findOne({ username: recipientUsername });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      targetUserId = user._id;
    }

    // Check if users are blocked
    const isBlocked = await Block.areUsersBlocked(userId, targetUserId);
    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Cannot perform this action with blocked user",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking block status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
