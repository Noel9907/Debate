import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender_username: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    message_type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    // For image/file messages
    media_url: {
      type: String,
    },
    file_name: {
      type: String,
    },
    file_size: {
      type: Number,
    },
    // Message status
    is_read: {
      type: Boolean,
      default: false,
    },
    read_by: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        read_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // For message editing/deletion
    is_edited: {
      type: Boolean,
      default: false,
    },
    edited_at: {
      type: Date,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
    },
    // Reply functionality
    reply_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
messageSchema.index({ conversation_id: 1, createdAt: -1 });
messageSchema.index({ sender_id: 1, createdAt: -1 });
messageSchema.index({ conversation_id: 1, is_deleted: 1, createdAt: -1 });

// Pre-save middleware to update conversation
messageSchema.pre("save", async function (next) {
  if (this.isNew && !this.is_deleted) {
    // Update conversation's last message and timestamp
    await mongoose
      .model("Conversation")
      .findByIdAndUpdate(this.conversation_id, {
        last_message: this._id,
        last_message_at: this.createdAt,
      });

    // Update unread counts for other participants
    const conversation = await mongoose
      .model("Conversation")
      .findById(this.conversation_id);
    if (conversation) {
      conversation.incrementUnreadCount(this.sender_id);
      await conversation.save();
    }
  }
  next();
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
