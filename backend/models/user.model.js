import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    profilepic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 160,
    },
    location: {
      type: String,
      default: "",
    },
    interested_categories: {
      type: [String],
      default: [],
    },
    // Core stats
    posts_count: {
      type: Number,
      default: 0,
    },
    comments_count: {
      type: Number,
      default: 0,
    },
    followers_count: {
      type: Number,
      default: 0,
    },
    following_count: {
      type: Number,
      default: 0,
    },
    // Simplified debate scoring
    total_debate_points: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Static method for leaderboard
userSchema.statics.getLeaderboard = async function (limit = 50) {
  return await this.find({})
    .select("-password")
    .sort({ total_debate_points: -1, createdAt: 1 })
    .limit(limit);
};

// Indexes
userSchema.index({ total_debate_points: -1 });

const User = mongoose.model("User", userSchema);
export default User;
