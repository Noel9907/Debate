// conversation.model.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    // Denormalized data for efficient queries
    participant_usernames: [
      {
        type: String,
        required: true,
      },
    ],
    last_message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    last_message_at: {
      type: Date,
      default: Date.now,
    },
    // Track unread counts for each participant
    unread_counts: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    // Track if conversation is archived by any participant
    archived_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Convert Map to object for JSON response
        if (ret.unread_counts instanceof Map) {
          ret.unread_counts = Object.fromEntries(ret.unread_counts);
        }
        return ret;
      },
    },
  }
);

// Indexes for efficient queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ last_message_at: -1 });
conversationSchema.index({ participants: 1, last_message_at: -1 });

// Method to get unread count for a specific user
conversationSchema.methods.getUnreadCount = function (userId) {
  return this.unread_counts.get(userId.toString()) || 0;
};

// Method to reset unread count for a user
conversationSchema.methods.resetUnreadCount = function (userId) {
  this.unread_counts.set(userId.toString(), 0);
};

// Method to increment unread count for other participants
conversationSchema.methods.incrementUnreadCount = function (senderId) {
  this.participants.forEach((participantId) => {
    if (participantId.toString() !== senderId.toString()) {
      const currentCount =
        this.unread_counts.get(participantId.toString()) || 0;
      this.unread_counts.set(participantId.toString(), currentCount + 1);
    }
  });
};

// Static method to find conversation between two users
conversationSchema.statics.findBetweenUsers = async function (
  userId1,
  userId2
) {
  return await this.findOne({
    participants: { $all: [userId1, userId2], $size: 2 },
  }).populate("last_message");
};

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
