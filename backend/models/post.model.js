import mongoose from "mongoose";

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
    // Store calculated debate points for this post
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

// Virtual for comments
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postid",
});

// Compound index
postSchema.index({ categories: 1, createdAt: -1 });

// Method to toggle like and update points
postSchema.methods.toggleLike = async function (userId) {
  const userIdObj = new mongoose.Types.ObjectId(userId);
  let isLiked = false;

  if (this.likes.includes(userIdObj)) {
    await this.updateOne({
      $pull: { likes: userIdObj },
      $inc: { likes_count: -1 },
    });
    isLiked = false;
  } else {
    // Remove from dislikes if present
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
    isLiked = true;
  }

  // Update debate points for the post author
  const User = mongoose.model("User");
  const author = await User.findById(this.author_id);
  if (author) {
    await author.updateDebatePoints(this._id);
  }

  return isLiked;
};

// Method to toggle dislike and update points
postSchema.methods.toggleDislike = async function (userId) {
  const userIdObj = new mongoose.Types.ObjectId(userId);
  let isDisliked = false;

  if (this.dislikes.includes(userIdObj)) {
    await this.updateOne({
      $pull: { dislikes: userIdObj },
      $inc: { dislikes_count: -1 },
    });
    isDisliked = false;
  } else {
    // Remove from likes if present
    if (this.likes.includes(userIdObj)) {
      await this.updateOne({
        $pull: { likes: userIdObj },
        $inc: { likes_count: -1 },
      });
    }
    await this.updateOne({
      $addToSet: { dislikes: userIdObj },
      $inc: { dislikes_count: 1 },
    });
    isDisliked = true;
  }

  // Update debate points for the post author
  const User = mongoose.model("User");
  const author = await User.findById(this.author_id);
  if (author) {
    await author.updateDebatePoints(this._id);
  }

  return isDisliked;
};

const Post = mongoose.model("DebatePost", postSchema);
export default Post;
