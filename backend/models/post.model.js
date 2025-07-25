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
    video: { type: Boolean, required: true },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Replace arrays with Maps for O(1) lookups and automatic deduplication
    likes: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
    dislikes: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
    likes_count: {
      type: Number,
      default: 0,
      index: true, // For sorting by popularity
    },
    dislikes_count: {
      type: Number,
      default: 0,
    },
    // Denormalized engagement score for efficient sorting
    engagement_score: {
      type: Number,
      default: 0,
      index: true,
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
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Convert Maps to arrays for JSON response compatibility
        if (ret.likes instanceof Map) {
          ret.likes = Array.from(ret.likes.keys()).map(
            (id) => new mongoose.Types.ObjectId(id)
          );
        }
        if (ret.dislikes instanceof Map) {
          ret.dislikes = Array.from(ret.dislikes.keys()).map(
            (id) => new mongoose.Types.ObjectId(id)
          );
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        // Convert Maps to arrays for object compatibility
        if (ret.likes instanceof Map) {
          ret.likes = Array.from(ret.likes.keys()).map(
            (id) => new mongoose.Types.ObjectId(id)
          );
        }
        if (ret.dislikes instanceof Map) {
          ret.dislikes = Array.from(ret.dislikes.keys()).map(
            (id) => new mongoose.Types.ObjectId(id)
          );
        }
        return ret;
      },
    },
  }
);

// Optimized compound indexes for common queries
postSchema.index({ categories: 1, engagement_score: -1 });
postSchema.index({ author_id: 1, createdAt: -1 });
postSchema.index({ likes_count: -1, createdAt: -1 });
postSchema.index({ engagement_score: -1, createdAt: -1 });

// Virtual for comments (unchanged)
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postid",
});

// Helper method to calculate engagement score
postSchema.methods.calculateEngagementScore = function () {
  return (
    this.likes_count * 1.5 + this.comments_count * 2 - this.dislikes_count * 0.5
  );
};

// Helper method to check if user liked the post
postSchema.methods.isLikedBy = function (userId) {
  return this.likes.get(userId.toString()) === true;
};

// Helper method to check if user disliked the post
postSchema.methods.isDislikedBy = function (userId) {
  return this.dislikes.get(userId.toString()) === true;
};

// Static method for efficient bulk operations
postSchema.statics.updateEngagementScores = async function (postIds) {
  return this.updateMany({ _id: { $in: postIds } }, [
    {
      $set: {
        engagement_score: {
          $add: [
            { $multiply: ["$likes_count", 1.5] },
            { $multiply: ["$comments_count", 2] },
            { $multiply: ["$dislikes_count", -0.5] },
          ],
        },
      },
    },
  ]);
};

const Post = mongoose.model("DebatePost", postSchema);
export default Post;
