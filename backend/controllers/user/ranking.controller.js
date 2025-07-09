import RankingService from "../../services/RankingService.js";
import User from "../../models/user.model.js";

// Get global leaderboard
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const leaderboard = await RankingService.getGlobalLeaderboard(page, limit);

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching global leaderboard",
      error: error.message,
    });
  }
};

// Get category leaderboard
export const getCategoryLeaderboard = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const leaderboard = await RankingService.getCategoryLeaderboard(
      category,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching category leaderboard",
      error: error.message,
    });
  }
};

// Get user's rank and context
export const getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;
    const range = parseInt(req.query.range) || 5;

    const rankContext = await RankingService.getUserRankContext(userId, range);

    res.status(200).json({
      success: true,
      data: rankContext,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user rank",
      error: error.message,
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const userStats = await RankingService.getUserStats(userId);

    res.status(200).json({
      success: true,
      data: userStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message,
    });
  }
};

// Award debate points (admin/system use)
export const awardDebatePoints = async (req, res) => {
  try {
    const { userId, result, category, opponentId } = req.body;

    if (!userId || !result || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, result, category",
      });
    }

    const user = await RankingService.awardDebatePoints(
      userId,
      result,
      category,
      opponentId
    );

    res.status(200).json({
      success: true,
      message: "Points awarded successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          debate_points: user.debate_points,
          debates_won: user.debates_won,
          debates_lost: user.debates_lost,
          win_rate: user.win_rate,
          total_score: user.total_score,
          rank_tier: user.rank_tier,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error awarding points",
      error: error.message,
    });
  }
};

// Award engagement points
export const awardEngagementPoints = async (req, res) => {
  try {
    const { userId, action, amount = 1 } = req.body;

    if (!userId || !action) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, action",
      });
    }

    const user = await RankingService.awardEngagementPoints(
      userId,
      action,
      amount
    );

    res.status(200).json({
      success: true,
      message: "Engagement points awarded successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          debate_points: user.debate_points,
          total_score: user.total_score,
          rank_tier: user.rank_tier,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error awarding engagement points",
      error: error.message,
    });
  }
};

// Force update global rankings (admin use)
export const updateGlobalRankings = async (req, res) => {
  try {
    await RankingService.updateGlobalRankings();

    res.status(200).json({
      success: true,
      message: "Global rankings updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating global rankings",
      error: error.message,
    });
  }
};
