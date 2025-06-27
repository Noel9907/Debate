import Post from "../../models/post.model.js";
import Comment from "../../models/comment.model.js";
import User from "../../models/user.model.js";

export const getUserDebateStats = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    // First, find the user by username to get their ObjectId
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userObjectId = user._id;

    // Get debates joined (unique posts the user has commented on)
    const debatesJoinedStats = await Comment.aggregate([
      { $match: { author_id: userObjectId } }, // Adjust field name based on your Comment model
      {
        $group: {
          _id: "$postid", // Group by post ID to get unique debates
        },
      },
      {
        $group: {
          _id: null,
          uniqueDebates: { $sum: 1 }, // Count unique debates
        },
      },
    ]);

    // Get arguments made (total comments by user)
    const argumentsStats = await Comment.aggregate([
      { $match: { author_id: userObjectId } },
      {
        $group: {
          _id: null,
          totalComments: { $sum: 1 },
        },
      },
    ]);

    // Get win rate from user's own posts (debates they created)
    const postWinRateStats = await Post.aggregate([
      { $match: { author_id: userObjectId } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: "$likes_count" },
          totalDislikes: { $sum: "$dislikes_count" },
        },
      },
      {
        $addFields: {
          totalVotes: { $add: ["$totalLikes", "$totalDislikes"] },
          winRate: {
            $cond: {
              if: { $eq: [{ $add: ["$totalLikes", "$totalDislikes"] }, 0] },
              then: 0,
              else: {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: ["$totalLikes", "$totalDislikes"] },
                          { $add: ["$totalLikes", "$totalDislikes"] },
                        ],
                      },
                      100,
                    ],
                  },
                  2,
                ],
              },
            },
          },
        },
      },
    ]);

    // Extract results with defaults
    const debatesJoined = debatesJoinedStats[0]?.uniqueDebates || 0;
    const argumentsMade = argumentsStats[0]?.totalComments || 0;
    const postStats = postWinRateStats[0] || {
      totalPosts: 0,
      totalLikes: 0,
      totalDislikes: 0,
      totalVotes: 0,
      winRate: 0,
    };

    return res.status(200).json({
      success: true,
      data: {
        username: user.username,
        debatesJoined, // Unique debates commented on
        profilepic: user.profilepic,
        winRate: postStats.winRate, // Win rate of their own posts
        argumentsMade, // Total comments made
        breakdown: {
          debatesCreated: postStats.totalPosts,
          createdDebatesStats: {
            totalLikes: postStats.totalLikes,
            totalDislikes: postStats.totalDislikes,
            totalVotes: postStats.totalVotes,
            winRate: postStats.winRate,
          },
          participationStats: {
            debatesJoined,
            argumentsMade,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user debate stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getPostsByUsernameWithStats = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const posts = await Post.find({ author_id: user._id })
      .sort({ createdAt: -1 })
      .populate("author_id", "username profilepic")
      .select(
        "title text categories likes_count dislikes_count comments_count createdAt"
      )
      .lean();

    const totalLikes = posts.reduce((sum, post) => sum + post.likes_count, 0);
    const totalDislikes = posts.reduce(
      (sum, post) => sum + post.dislikes_count,
      0
    );
    const totalComments = posts.reduce(
      (sum, post) => sum + post.comments_count,
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        username: user.username,
        posts,
        stats: {
          totalPosts: posts.length,
          totalLikes,
          totalDislikes,
          totalComments,
          totalEngagement: totalLikes + totalDislikes + totalComments,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching posts with stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
