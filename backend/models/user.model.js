import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // Store lowercase for case-insensitive queries
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't include password in query results by default
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual references
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

const User = mongoose.model("User", userSchema);
export default User;
