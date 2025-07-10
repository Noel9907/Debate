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
    // Debate scoring
    total_debate_points: {
      type: Number,
      default: 0,
    },
    debates_won: {
      type: Number,
      default: 0,
    },
    debates_lost: {
      type: Number,
      default: 0,
    },
    global_rank: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for win rate
userSchema.virtual("win_rate").get(function () {
  const total = this.debates_won + this.debates_lost;
  if (total === 0) return 0;
  return ((this.debates_won / total) * 100).toFixed(2);
});

// Virtual for rank tier
userSchema.virtual("rank_tier").get(function () {
  const score = this.total_debate_points;
  if (score >= 1000) return "Champion";
  if (score >= 500) return "Expert";
  if (score >= 250) return "Advanced";
  if (score >= 100) return "Intermediate";
  return "Beginner";
});

// Method to recalculate debate points for a specific post
userSchema.methods.updateDebatePoints = async function (postId) {
  const Post = mongoose.model("DebatePost");
  const Comment = mongoose.model("Comment");

  // Get the post
  const post = await Post.findById(postId);
  if (!post || post.author_id.toString() !== this._id.toString()) {
    return;
  }

  // Get comments for this post
  const proComments = await Comment.countDocuments({
    postid: postId,
    position: "true",
  });
  const conComments = await Comment.countDocuments({
    postid: postId,
    position: "false",
  });

  // Calculate points for this post
  const commentPoints = (proComments - conComments) * 2;
  const votePoints = (post.likes_count - post.dislikes_count) * 1;
  const postPoints = commentPoints + votePoints;

  // Store current post points to calculate difference
  const currentPostPoints = post.debate_points || 0;
  const pointsDifference = postPoints - currentPostPoints;

  // Update post points
  await Post.updateOne(
    { _id: postId },
    { $set: { debate_points: postPoints } }
  );

  // Update user's total points
  this.total_debate_points += pointsDifference;

  // Update win/loss status
  if (postPoints > 0 && currentPostPoints <= 0) {
    this.debates_won += 1;
    if (currentPostPoints < 0) this.debates_lost -= 1;
  } else if (postPoints < 0 && currentPostPoints >= 0) {
    this.debates_lost += 1;
    if (currentPostPoints > 0) this.debates_won -= 1;
  }

  await this.save();
};

// Static method for leaderboard
userSchema.statics.getLeaderboard = async function (limit = 50) {
  return await this.find({})
    .select("-password")
    .sort({ total_debate_points: -1, createdAt: 1 })
    .limit(limit);
};

// Indexes
userSchema.index({ total_debate_points: -1 });
userSchema.index({ global_rank: 1 });

const User = mongoose.model("User", userSchema);
export default User;
