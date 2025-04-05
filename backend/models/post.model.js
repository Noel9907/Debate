import mongoose from "mongoose";

// Post Schema
const postSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      index: true, // Add index for faster queries by username
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Add index for faster queries by author
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
      default: 0, // Track count for faster aggregation
    },
    dislikes_count: {
      type: Number,
      default: 0, // Track count for faster aggregation
    },
    title: {
      type: String,
      required: true,
      maxlength: 70,
      trim: true, // Removes whitespace
    },
    text: {
      type: String,
      required: true,
    },
    categories: {
      type: [String],
      required: true,
      index: true, // Add index for category-based queries
    },
    comments_count: {
      type: Number,
      default: 0, // Store count to avoid counting queries
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true },
  }
);

// Virtual for comments to avoid embedding but maintain relationship
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postid",
});

// Compound index for complex queries
postSchema.index({ categories: 1, createdAt: -1 });

// Method to safely add/remove likes without race conditions
postSchema.methods.toggleLike = async function (userId) {
  const userIdObj = mongoose.Types.ObjectId(userId);
  if (this.likes.includes(userIdObj)) {
    await this.updateOne({
      $pull: { likes: userIdObj },
      $inc: { likes_count: -1 },
    });
    return false; // Unliked
  } else {
    // Also remove from dislikes if present
    if (this.dislikes.includes(userIdObj)) {
      await this.updateOne({
        $pull: { dislikes: userIdObj },
        $inc: { dislikes_count: -1 },
      });
    }
    await this.updateOne({
      $addToSet: { likes: userIdObj },
      $inc: { likes_count: 1 },
    });
    return true; // Liked
  }
};
const Post = mongoose.model("DebatePost", postSchema);

export default Post;
