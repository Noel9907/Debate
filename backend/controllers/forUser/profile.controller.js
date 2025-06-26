import Post from "../../models/post.model.js";
import mongoose from "mongoose";
import Comment from "../../models/comment.model.js"; // Assuming you have a Comment model

export const getPostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Extract pagination and sorting parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "newest"; // newest, oldest, mostLikes, mostDislikes, winRate

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100",
      });
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Define sorting options
    let sortOptions = {};
    switch (sortBy) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "mostLikes":
        sortOptions = { likes_count: -1, createdAt: -1 };
        break;
      case "mostDislikes":
        sortOptions = { dislikes_count: -1, createdAt: -1 };
        break;
      case "winRate":
        // For win rate, we'll use aggregation pipeline
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    let posts;
    let totalPosts;

    if (sortBy === "winRate") {
      // Use aggregation pipeline for win rate calculation and sorting
      const aggregationPipeline = [
        { $match: { author_id: new mongoose.Types.ObjectId(userId) } },
        {
          $addFields: {
            winRate: {
              $cond: {
                if: { $eq: [{ $add: ["$likes_count", "$dislikes_count"] }, 0] },
                then: 0,
                else: {
                  $multiply: [
                    {
                      $divide: [
                        { $subtract: ["$likes_count", "$dislikes_count"] },
                        { $add: ["$likes_count", "$dislikes_count"] },
                      ],
                    },
                    100,
                  ],
                },
              },
            },
          },
        },
        { $sort: { winRate: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "author_id",
            foreignField: "_id",
            as: "author_id",
            pipeline: [{ $project: { username: 1, profilepic: 1 } }],
          },
        },
        {
          $unwind: "$author_id",
        },
      ];

      posts = await Post.aggregate(aggregationPipeline);

      // Get total count for pagination
      const countPipeline = [
        { $match: { author_id: new mongoose.Types.ObjectId(userId) } },
        { $count: "total" },
      ];
      const countResult = await Post.aggregate(countPipeline);
      totalPosts = countResult[0]?.total || 0;
    } else {
      // Regular query with standard sorting
      posts = await Post.find({ author_id: userId })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("author_id", "username profilepic")
        .lean();

      // Add win rate calculation for display
      posts = posts.map((post) => {
        const totalVotes = post.likes_count + post.dislikes_count;
        const winRate =
          totalVotes === 0
            ? 0
            : ((post.likes_count - post.dislikes_count) / totalVotes) * 100;

        return {
          ...post,
          winRate: Math.round(winRate * 100) / 100, // Round to 2 decimal places
        };
      });

      // Get total count for pagination
      totalPosts = await Post.countDocuments({ author_id: userId });
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalPosts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        postsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
      sortBy,
    });
  } catch (error) {
    console.error("Error fetching posts by user ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUserDebateStats = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Convert userId to ObjectId for aggregation
    const userObjectId = new mongoose.Types.ObjectId(userId);

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
        debatesJoined, // Unique debates commented on
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

export const getPostsByUserIdWithStats = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const posts = await Post.find({ author_id: userId })
      .sort({ createdAt: -1 })
      .populate("author_id", "username profilepic")
      .select(
        "title text categories likes_count dislikes_count comments_count createdAt"
      )
      .lean();

    // Calculate total engagement
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
