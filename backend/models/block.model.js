import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
  {
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    blocker_username: {
      type: String,
      required: true,
    },
    blocked_username: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      maxlength: 200,
    },
    // Track if this is an active block or was unblocked
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    unblocked_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });
blockSchema.index({ blocked: 1, is_active: 1 });
blockSchema.index({ blocker: 1, is_active: 1 });

// Static method to check if user A has blocked user B
blockSchema.statics.isBlocked = async function (blockerId, blockedId) {
  const block = await this.findOne({
    blocker: blockerId,
    blocked: blockedId,
    is_active: true,
  });
  return !!block;
};

// Static method to check if either user has blocked the other
blockSchema.statics.areUsersBlocked = async function (userId1, userId2) {
  const blocks = await this.find({
    $or: [
      { blocker: userId1, blocked: userId2, is_active: true },
      { blocker: userId2, blocked: userId1, is_active: true },
    ],
  });
  return blocks.length > 0;
};

// Static method to get all users blocked by a user
blockSchema.statics.getBlockedUsers = async function (
  userId,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;
  return await this.find({ blocker: userId, is_active: true })
    .populate("blocked", "username profilepic fullname")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

const Block = mongoose.model("Block", blockSchema);
export default Block;
