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
    // Profile information
    bio: {
      type: String,
      default: "",
      maxlength: 160, // Instagram-like bio limit
    },
    // email: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   lowercase: true,
    //   trim: true,
    // },
    location: {
      type: String,
      default: "",
    },
    interested_categories: {
      type: [String],
      default: [],
    },
    posts_count: {
      type: Number,
      default: 0,
    },
    comments_count: {
      type: Number,
      default: 0,
    },
    // Follower/following counts (your "trackers/tracking")
    followers_count: {
      type: Number,
      default: 0,
    },
    following_count: {
      type: Number,
      default: 0,
    },
    // Global ranking system
    global_rank: {
      type: Number,
      default: null,
    },
    // Points/score for ranking calculation
    debate_points: {
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

// Virtual for getting followers
userSchema.virtual("followers", {
  ref: "Follow",
  localField: "_id",
  foreignField: "following",
});

// Virtual for getting following
userSchema.virtual("following", {
  ref: "Follow",
  localField: "_id",
  foreignField: "follower",
});

// Existing virtuals
userSchema.virtual("posts", {
  ref: "DebatePost",
  localField: "_id",
  foreignField: "author_id",
});

userSchema.virtual("comments", {
  ref: "Comment",
  localField: "username",
  foreignField: "username",
});

userSchema.index({ username: "text", interested_categories: "text" });

const User = mongoose.model("User", userSchema);

export default User;
