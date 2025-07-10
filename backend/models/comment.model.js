import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    postid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DebatePost",
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      index: true,
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
      type: String,
      required: true,
      enum: ["true", "false"],
      index: true,
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

// Compound index
commentSchema.index({ postid: 1, position: 1, createdAt: -1 });

// Pre-save middleware to update counts and debate points
commentSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Update post comment count
    await mongoose
      .model("DebatePost")
      .updateOne({ _id: this.postid }, { $inc: { comments_count: 1 } });

    // Update user comment count
    await mongoose
      .model("User")
      .updateOne({ username: this.username }, { $inc: { comments_count: 1 } });

    // Update debate points for the post author
    const post = await mongoose.model("DebatePost").findById(this.postid);
    if (post) {
      const User = mongoose.model("User");
      const author = await User.findById(post.author_id);
      if (author) {
        await author.updateDebatePoints(this.postid);
      }
    }
  }
  next();
});

// Pre-remove middleware to update counts and debate points
commentSchema.pre("remove", async function (next) {
  // Update post comment count
  await mongoose
    .model("DebatePost")
    .updateOne({ _id: this.postid }, { $inc: { comments_count: -1 } });

  // Update user comment count
  await mongoose
    .model("User")
    .updateOne({ username: this.username }, { $inc: { comments_count: -1 } });

  // Update debate points for the post author
  const post = await mongoose.model("DebatePost").findById(this.postid);
  if (post) {
    const User = mongoose.model("User");
    const author = await User.findById(post.author_id);
    if (author) {
      await author.updateDebatePoints(this.postid);
    }
  }

  next();
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
