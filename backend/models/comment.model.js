import mongoose from "mongoose";

// Comment Schema
const commentSchema = new mongoose.Schema(
  {
    postid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DebatePost",
      required: true,
      index: true, // Index for faster queries by post
    },
    username: {
      type: String,
      required: true,
      index: true, // Index for faster queries by user
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    position: {
      // Renamed from "position" for clarity
      type: String,
      required: true,
      enum: ["true", "false"], // More explicit than boolean
      index: true, // For filtering by stance
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likes_count: {
      type: Number,
      default: 0,
    },
    dislikes_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index for querying comments by post and stance
commentSchema.index({ postid: 1, stance: 1, createdAt: -1 });

// Pre-save middleware to increment the post's comment count
commentSchema.pre("save", async function (next) {
  if (this.isNew) {
    await mongoose
      .model("DebatePost")
      .updateOne({ _id: this.postid }, { $inc: { comments_count: 1 } });

    await mongoose
      .model("User")
      .updateOne({ username: this.username }, { $inc: { comments_count: 1 } });
  }
  next();
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
