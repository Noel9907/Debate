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
    global_rank: {
      type: Number,
      default: null,
    },

    // Enhanced point system
    debate_points: {
      type: Number,
      default: 0,
    },

    // Win/Loss tracking
    debates_won: {
      type: Number,
      default: 0,
    },
    debates_lost: {
      type: Number,
      default: 0,
    },
    debates_participated: {
      type: Number,
      default: 0,
    },

    // Engagement points
    likes_received: {
      type: Number,
      default: 0,
    },
    likes_given: {
      type: Number,
      default: 0,
    },

    // Quality metrics
    helpful_votes: {
      type: Number,
      default: 0,
    },
    reported_count: {
      type: Number,
      default: 0,
    },

    // Activity streaks
    current_streak: {
      type: Number,
      default: 0,
    },
    longest_streak: {
      type: Number,
      default: 0,
    },
    last_activity: {
      type: Date,
      default: Date.now,
    },

    // Achievement system
    achievements: [
      {
        type: String,
        enum: [
          "first_win",
          "streak_master",
          "debate_champion",
          "popular_voice",
          "helpful_contributor",
          "category_expert",
        ],
      },
    ],

    // Category-specific expertise
    category_expertise: {
      type: Map,
      of: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        points: { type: Number, default: 0 },
      },
      default: new Map(),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for win rate calculation
userSchema.virtual("win_rate").get(function () {
  if (this.debates_participated === 0) return 0;
  return ((this.debates_won / this.debates_participated) * 100).toFixed(2);
});

// Virtual for total score calculation
userSchema.virtual("total_score").get(function () {
  const basePoints = this.debate_points;
  const winBonus = this.debates_won * 10;
  const engagementBonus = Math.floor(this.likes_received / 10);
  const qualityBonus = this.helpful_votes * 5;
  const streakBonus = this.current_streak * 2;
  const penaltyPoints = this.reported_count * -5;

  return (
    basePoints +
    winBonus +
    engagementBonus +
    qualityBonus +
    streakBonus +
    penaltyPoints
  );
});

// Virtual for rank tier
userSchema.virtual("rank_tier").get(function () {
  const score = this.total_score;
  if (score >= 1000) return "Champion";
  if (score >= 750) return "Expert";
  if (score >= 500) return "Advanced";
  if (score >= 250) return "Intermediate";
  if (score >= 100) return "Beginner";
  return "Rookie";
});

// Existing virtuals
userSchema.virtual("followers", {
  ref: "Follow",
  localField: "_id",
  foreignField: "following",
});

userSchema.virtual("following", {
  ref: "Follow",
  localField: "_id",
  foreignField: "follower",
});

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

// Instance methods for point management
userSchema.methods.addDebateWin = function (category, points = 20) {
  this.debates_won += 1;
  this.debates_participated += 1;
  this.debate_points += points;

  // Update category expertise
  if (!this.category_expertise.has(category)) {
    this.category_expertise.set(category, { wins: 0, losses: 0, points: 0 });
  }
  const categoryData = this.category_expertise.get(category);
  categoryData.wins += 1;
  categoryData.points += points;
  this.category_expertise.set(category, categoryData);

  return this.save();
};

userSchema.methods.addDebateLoss = function (category, points = -5) {
  this.debates_lost += 1;
  this.debates_participated += 1;
  this.debate_points = Math.max(0, this.debate_points + points); // Prevent negative points

  // Update category expertise
  if (!this.category_expertise.has(category)) {
    this.category_expertise.set(category, { wins: 0, losses: 0, points: 0 });
  }
  const categoryData = this.category_expertise.get(category);
  categoryData.losses += 1;
  categoryData.points += points;
  this.category_expertise.set(category, categoryData);

  return this.save();
};

userSchema.methods.updateActivity = function () {
  const now = new Date();
  const lastActivity = this.last_activity;
  const timeDiff = now - lastActivity;
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  if (daysDiff === 1) {
    // Consecutive day activity
    this.current_streak += 1;
    this.longest_streak = Math.max(this.longest_streak, this.current_streak);
  } else if (daysDiff > 1) {
    // Streak broken
    this.current_streak = 1;
  }

  this.last_activity = now;
  return this.save();
};

// Static methods for ranking
userSchema.statics.updateGlobalRanking = async function () {
  const users = await this.find({}).sort({
    total_score: -1,
    win_rate: -1,
    debates_won: -1,
    createdAt: 1,
  });

  for (let i = 0; i < users.length; i++) {
    users[i].global_rank = i + 1;
    await users[i].save();
  }

  return users;
};

userSchema.statics.getLeaderboard = async function (
  limit = 50,
  category = null
) {
  let query = {};
  let sortCriteria = {
    total_score: -1,
    win_rate: -1,
    debates_won: -1,
    createdAt: 1,
  };

  if (category) {
    query[`category_expertise.${category}`] = { $exists: true };
    sortCriteria = {
      [`category_expertise.${category}.points`]: -1,
      [`category_expertise.${category}.wins`]: -1,
      total_score: -1,
    };
  }

  return await this.find(query)
    .select("-password")
    .sort(sortCriteria)
    .limit(limit);
};

// Pre-save middleware to calculate derived fields
userSchema.pre("save", function (next) {
  // Update last activity timestamp
  this.last_activity = new Date();
  next();
});

// Indexes for efficient querying
userSchema.index({ username: "text", interested_categories: "text" });
userSchema.index({ global_rank: 1 });
userSchema.index({ total_score: -1 });
userSchema.index({ win_rate: -1 });
userSchema.index({ debates_won: -1 });
userSchema.index({ "category_expertise.points": -1 });

const User = mongoose.model("User", userSchema);
export default User;
