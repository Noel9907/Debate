import User from "../models/user.model.js";
import cron from "node-cron";

export class RankingService {
  // Point values configuration
  static POINT_VALUES = {
    DEBATE_WIN: 20,
    DEBATE_LOSS: -5,
    POST_CREATION: 5,
    COMMENT_CREATION: 2,
    LIKE_RECEIVED: 1,
    HELPFUL_VOTE: 5,
    REPORT_PENALTY: -10,
    STREAK_BONUS: 2,
    ACHIEVEMENT_BONUS: 50,
  };

  static async awardDebatePoints(userId, result, category, opponentId = null) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      if (result === "win") {
        await user.addDebateWin(category, this.POINT_VALUES.DEBATE_WIN);

        // Award opponent loss points
        if (opponentId) {
          const opponent = await User.findById(opponentId);
          if (opponent) {
            await opponent.addDebateLoss(
              category,
              this.POINT_VALUES.DEBATE_LOSS
            );
          }
        }
      } else if (result === "loss") {
        await user.addDebateLoss(category, this.POINT_VALUES.DEBATE_LOSS);
      }

      // Check for achievements
      await this.checkAchievements(user);

      return user;
    } catch (error) {
      console.error("Error awarding debate points:", error);
      throw error;
    }
  }

  // Award engagement points
  static async awardEngagementPoints(userId, action, amount = 1) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      switch (action) {
        case "post":
          user.debate_points += this.POINT_VALUES.POST_CREATION;
          user.posts_count += 1;
          break;
        case "comment":
          user.debate_points += this.POINT_VALUES.COMMENT_CREATION;
          user.comments_count += 1;
          break;
        case "like_received":
          user.debate_points += this.POINT_VALUES.LIKE_RECEIVED * amount;
          user.likes_received += amount;
          break;
        case "helpful_vote":
          user.debate_points += this.POINT_VALUES.HELPFUL_VOTE * amount;
          user.helpful_votes += amount;
          break;
        case "report":
          user.debate_points += this.POINT_VALUES.REPORT_PENALTY * amount;
          user.reported_count += amount;
          break;
      }

      await user.updateActivity();
      await user.save();

      return user;
    } catch (error) {
      console.error("Error awarding engagement points:", error);
      throw error;
    }
  }

  // Check and award achievements
  static async checkAchievements(user) {
    const newAchievements = [];

    // First Win Achievement
    if (user.debates_won === 1 && !user.achievements.includes("first_win")) {
      newAchievements.push("first_win");
    }

    // Streak Master (7+ day streak)
    if (
      user.current_streak >= 7 &&
      !user.achievements.includes("streak_master")
    ) {
      newAchievements.push("streak_master");
    }

    // Debate Champion (50+ wins)
    if (
      user.debates_won >= 50 &&
      !user.achievements.includes("debate_champion")
    ) {
      newAchievements.push("debate_champion");
    }

    // Popular Voice (500+ likes)
    if (
      user.likes_received >= 500 &&
      !user.achievements.includes("popular_voice")
    ) {
      newAchievements.push("popular_voice");
    }

    // Helpful Contributor (100+ helpful votes)
    if (
      user.helpful_votes >= 100 &&
      !user.achievements.includes("helpful_contributor")
    ) {
      newAchievements.push("helpful_contributor");
    }

    // Category Expert (20+ wins in single category)
    if (!user.achievements.includes("category_expert")) {
      for (const [category, stats] of user.category_expertise) {
        if (stats.wins >= 20) {
          newAchievements.push("category_expert");
          break;
        }
      }
    }

    if (newAchievements.length > 0) {
      user.achievements.push(...newAchievements);
      user.debate_points +=
        newAchievements.length * this.POINT_VALUES.ACHIEVEMENT_BONUS;
      await user.save();
    }

    return newAchievements;
  }

  // Get global leaderboard - prioritizing debate win rate
  static async getGlobalLeaderboard(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    // Only include users who have participated in at least one debate
    const users = await User.find({
      debates_participated: { $gt: 0 }, // Must have participated in at least 1 debate
    })
      .select("-password")
      .sort({
        win_rate: -1, // PRIMARY: Highest win rate first
        debates_won: -1, // SECONDARY: Most wins (for ties in win rate)
        debates_participated: -1, // TERTIARY: Most debates participated (shows experience)
        total_score: -1, // QUATERNARY: Highest total score
        createdAt: -1, // FINAL: Newest account first (tie-breaker)
      })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({
      debates_participated: { $gt: 0 },
    });

    return {
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    };
  }

  // Get qualified debaters leaderboard (minimum debate threshold)
  static async getQualifiedLeaderboard(page = 1, limit = 50, minDebates = 5) {
    const skip = (page - 1) * limit;

    // Only include users who have participated in minimum number of debates
    const users = await User.find({
      debates_participated: { $gte: minDebates },
    })
      .select("-password")
      .sort({
        win_rate: -1, // PRIMARY: Highest win rate first
        debates_won: -1, // SECONDARY: Most wins
        debates_participated: -1, // TERTIARY: Most debates participated
        total_score: -1, // QUATERNARY: Highest total score
        createdAt: -1, // FINAL: Newest account first
      })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({
      debates_participated: { $gte: minDebates },
    });

    return {
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      minDebates,
    };
  }

  // Updated category leaderboard to handle both category-specific and global leaderboards
  static async getCategoryLeaderboard(category = null, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    try {
      // If no category specified, return global leaderboard
      if (!category) {
        return await this.getGlobalLeaderboard(page, limit);
      }

      const leaderboard = await User.aggregate([
        {
          $lookup: {
            from: "debateposts", // Your posts collection name
            localField: "_id",
            foreignField: "author_id",
            as: "posts",
          },
        },
        {
          $addFields: {
            categoryPosts: {
              $filter: {
                input: "$posts",
                as: "post",
                cond: {
                  $and: [
                    { $isArray: "$post.categories" },
                    { $in: [category, "$post.categories"] },
                  ],
                },
              },
            },
            allPosts: "$posts", // Keep all posts for fallback
          },
        },
        {
          $addFields: {
            totalEngagement: {
              $sum: {
                $map: {
                  input: "$categoryPosts",
                  as: "post",
                  in: {
                    $add: [
                      { $ifNull: ["$post.likes_count", 0] },
                      { $ifNull: ["$post.dislikes_count", 0] },
                      { $ifNull: ["$post.comments_count", 0] },
                    ],
                  },
                },
              },
            },
            totalPosts: { $size: "$categoryPosts" },
          },
        },
        {
          $match: {
            totalPosts: { $gt: 0 }, // Only users with posts in this category
          },
        },
        {
          $sort: {
            totalEngagement: -1,
            totalPosts: -1,
            createdAt: -1,
          },
        },
        {
          $facet: {
            users: [
              {
                $group: {
                  _id: null,
                  users: { $push: "$ROOT" },
                },
              },
              {
                $unwind: {
                  path: "$users",
                  includeArrayIndex: "rank",
                },
              },
              {
                $addFields: {
                  "users.rank": { $add: ["$rank", 1] },
                },
              },
              {
                $replaceRoot: { newRoot: "$users" },
              },
              {
                $skip: skip,
              },
              {
                $limit: limit,
              },
              {
                $project: {
                  username: 1,
                  profilePicture: 1,
                  rank: 1,
                  totalEngagement: 1,
                  totalPosts: 1,
                  createdAt: 1,
                },
              },
            ],
            totalCount: [{ $count: "total" }],
          },
        },
      ]);

      const users = leaderboard[0].users || [];
      const totalUsers = leaderboard[0].totalCount[0]?.total || 0;

      return {
        users,
        category,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
      };
    } catch (error) {
      console.error("Error in getCategoryLeaderboard:", error);
      throw error;
    }
  }

  // Get user's rank and nearby users - using win rate focused ranking
  static async getUserRankContext(userId, range = 5) {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new Error("User not found");

    // Get users ranked higher (using win rate as primary criteria)
    const higherRanked = await User.find({
      debates_participated: { $gt: 0 }, // Only users with debate experience
      $or: [
        { win_rate: { $gt: user.win_rate } },
        {
          win_rate: user.win_rate,
          debates_won: { $gt: user.debates_won },
        },
        {
          win_rate: user.win_rate,
          debates_won: user.debates_won,
          debates_participated: { $gt: user.debates_participated },
        },
        {
          win_rate: user.win_rate,
          debates_won: user.debates_won,
          debates_participated: user.debates_participated,
          total_score: { $gt: user.total_score },
        },
      ],
    })
      .select("-password")
      .sort({
        win_rate: -1,
        debates_won: -1,
        debates_participated: -1,
        total_score: -1,
        createdAt: -1,
      })
      .limit(range);

    // Get users ranked lower
    const lowerRanked = await User.find({
      debates_participated: { $gt: 0 }, // Only users with debate experience
      $or: [
        { win_rate: { $lt: user.win_rate } },
        {
          win_rate: user.win_rate,
          debates_won: { $lt: user.debates_won },
        },
        {
          win_rate: user.win_rate,
          debates_won: user.debates_won,
          debates_participated: { $lt: user.debates_participated },
        },
        {
          win_rate: user.win_rate,
          debates_won: user.debates_won,
          debates_participated: user.debates_participated,
          total_score: { $lt: user.total_score },
        },
      ],
    })
      .select("-password")
      .sort({
        win_rate: -1,
        debates_won: -1,
        debates_participated: -1,
        total_score: -1,
        createdAt: -1,
      })
      .limit(range);

    const userRank = higherRanked.length + 1;

    return {
      user,
      rank: userRank,
      above: higherRanked.reverse(),
      below: lowerRanked,
    };
  }

  // Update global rankings (run periodically)
  static async updateGlobalRankings() {
    try {
      console.log("Updating global rankings...");
      await User.updateGlobalRanking();
      console.log("Global rankings updated successfully");
    } catch (error) {
      console.error("Error updating global rankings:", error);
    }
  }

  // Get user statistics
  static async getUserStats(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new Error("User not found");

    // Calculate additional stats
    const totalDebates = user.debates_participated;
    const winRate =
      totalDebates > 0
        ? ((user.debates_won / totalDebates) * 100).toFixed(2)
        : 0;

    // Get category performance
    const categoryStats = Array.from(user.category_expertise.entries())
      .map(([category, stats]) => ({
        category,
        wins: stats.wins,
        losses: stats.losses,
        points: stats.points,
        winRate:
          stats.wins + stats.losses > 0
            ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(2)
            : 0,
      }))
      .sort((a, b) => b.points - a.points);

    return {
      user,
      stats: {
        totalDebates,
        winRate,
        totalScore: user.total_score,
        rankTier: user.rank_tier,
        categoryStats,
        recentAchievements: user.achievements.slice(-5),
      },
    };
  }
}

// Schedule global ranking updates (every hour)
cron.schedule("0 * * * *", () => {
  RankingService.updateGlobalRankings();
});

// Schedule daily streak updates (at midnight)
cron.schedule("0 0 * * *", async () => {
  try {
    const users = await User.find({});
    for (const user of users) {
      await user.updateActivity();
    }
    console.log("Daily streak updates completed");
  } catch (error) {
    console.error("Error updating daily streaks:", error);
  }
});

export default RankingService;
