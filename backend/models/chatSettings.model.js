import mongoose from "mongoose";

const chatSettingsSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Privacy settings
    who_can_message: {
      type: String,
      enum: ["everyone", "followers", "following", "mutual_followers"],
      default: "everyone",
    },
    // Notification settings
    notifications_enabled: {
      type: Boolean,
      default: true,
    },
    sound_enabled: {
      type: Boolean,
      default: true,
    },
    // Online status
    show_online_status: {
      type: Boolean,
      default: true,
    },
    last_seen_privacy: {
      type: String,
      enum: ["everyone", "followers", "nobody"],
      default: "everyone",
    },
    // Auto-delete messages (optional feature)
    auto_delete_messages: {
      type: Boolean,
      default: false,
    },
    auto_delete_after_days: {
      type: Number,
      default: 30,
    },
  },
  {
    timestamps: true,
  }
);

const ChatSettings = mongoose.model("ChatSettings", chatSettingsSchema);
export default ChatSettings;
