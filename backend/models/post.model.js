import mongoose from "mongoose";
import User from "./user.model.js";

const postSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
    },
    image: { type: Boolean, required: true },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    title: {
      type: String,
      required: true,
      maxlength: 70,
      trim: true,
    },
    text: {
      type: String,
      required: true,
    },
    categories: {
      type: [String],
      required: true,
      index: true,
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

// Virtual for comments
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postid",
});

// Compound index
postSchema.index({ categories: 1, createdAt: -1 });
postSchema.methods.toggleLike = async function (userId) {
  const userIdObj = new mongoose.Types.ObjectId(userId);

  // Refetch updated likes/dislikes
  const post = await this.constructor
    .findById(this._id)
    .select("likes dislikes");

  let isLiked = false;

  const alreadyLiked = post.likes.some((id) => id.equals(userIdObj));
  const alreadyDisliked = post.dislikes.some((id) => id.equals(userIdObj));

  if (alreadyLiked) {
    // Remove like
    await this.updateOne({
      $pull: { likes: userIdObj },
      $inc: { likes_count: -1 },
    });

    await User.findByIdAndUpdate(this.author_id, {
      $inc: { total_debate_points: -0.1 },
    });
  } else {
    // Remove dislike if present
    let pointsToAdd = 0.1;
    if (alreadyDisliked) {
      await this.updateOne({
        $pull: { dislikes: userIdObj },
        $inc: { dislikes_count: -1 },
      });
      pointsToAdd = 0.2;
    }

    await this.updateOne({
      $addToSet: { likes: userIdObj },
      $inc: { likes_count: 1 },
    });

    await User.findByIdAndUpdate(this.author_id, {
      $inc: { total_debate_points: pointsToAdd },
    });

    isLiked = true;
  }

  return isLiked;
};

postSchema.methods.toggleDislike = async function (userId) {
  const userIdObj = new mongoose.Types.ObjectId(userId);
  const User = mongoose.model("User");

  // Refetch updated likes/dislikes
  const post = await this.constructor
    .findById(this._id)
    .select("likes dislikes");

  let isDisliked = false;

  const alreadyDisliked = post.dislikes.some((id) => id.equals(userIdObj));
  const alreadyLiked = post.likes.some((id) => id.equals(userIdObj));

  if (alreadyDisliked) {
    // Remove dislike
    await this.updateOne({
      $pull: { dislikes: userIdObj },
      $inc: { dislikes_count: -1 },
    });

    await User.findByIdAndUpdate(this.author_id, {
      $inc: { total_debate_points: 0.1 },
    });
  } else {
    // Remove like if present
    let pointsToRemove = -0.1;
    if (alreadyLiked) {
      await this.updateOne({
        $pull: { likes: userIdObj },
        $inc: { likes_count: -1 },
      });
      pointsToRemove = -0.2;
    }

    await this.updateOne({
      $addToSet: { dislikes: userIdObj },
      $inc: { dislikes_count: 1 },
    });

    await User.findByIdAndUpdate(this.author_id, {
      $inc: { total_debate_points: pointsToRemove },
    });

    isDisliked = true;
  }

  return isDisliked;
};

const Post = mongoose.model("DebatePost", postSchema);
export default Post;
