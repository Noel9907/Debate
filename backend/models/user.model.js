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
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // Allows multiple null values for non-Google users
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.isGoogleUser; // Password not required for Google users
      },
      minlength: 6,
    },
    gender: {
      type: String,
      required: function () {
        return !this.isGoogleUser; // Gender not required for Google users
      },
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
    // Google OAuth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    fullname: {
      type: String,
      required: false, // For Google users, we get their display name
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
