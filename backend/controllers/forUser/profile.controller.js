import Post from "../../models/post.model.js";
import Comment from "../../models/comment.model.js";
import User from "../../models/user.model.js";

export const editProfile = async (req, res) => {
  try {
    const { gender, bio, location, interestedCategories } = req.body;
    const userId = req.user._id;

    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return res.status(400).json({ error: "bio must be a string" });
      }
      if (bio.length > 500) {
        return res
          .status(400)
          .json({ error: "bio cannot exceed 500 characters" });
      }
    }

    if (location !== undefined) {
      if (typeof location !== "string") {
        return res.status(400).json({ error: "location must be a string" });
      }
      if (location.length > 100) {
        return res
          .status(400)
          .json({ error: "location cannot exceed 100 characters" });
      }
    }

    if (interestedCategories !== undefined) {
      if (!Array.isArray(interestedCategories)) {
        return res
          .status(400)
          .json({ error: "interested categories must be an array" });
      }
      if (interestedCategories.length > 10) {
        return res
          .status(400)
          .json({ error: "cannot select more than 10 interested categories" });
      }

      for (let i = 0; i < interestedCategories.length; i++) {
        if (typeof interestedCategories[i] !== "string") {
          return res
            .status(400)
            .json({ error: "all interested categories must be strings" });
        }
      }
    }

    if (gender !== undefined) {
      if (typeof gender !== "string") {
        return res.status(400).json({ error: "gender must be a string" });
      }
      if (!["male", "female", "other"].includes(gender)) {
        return res.status(400).json({ error: "invalid gender selection" });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    let profilePic = user.profilepic;
    if (gender && gender !== user.gender) {
      const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${user.username}`;
      const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${user.username}`;
      profilePic = gender === "male" ? boyProfilePic : girlProfilePic;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(gender && { gender }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(interestedCategories && { interestedCategories }),
        ...(profilePic !== user.profilepic && { profilepic: profilePic }),
      },
      { new: true, runValidators: true }
    );

    if (updatedUser) {
      res.status(200).json({
        _id: updatedUser._id,
        username: updatedUser.username,
        gender: updatedUser.gender,
        bio: updatedUser.bio,
        location: updatedUser.location,
        interestedCategories: updatedUser.interestedCategories,
        profilepic: updatedUser.profilepic,
      });
    } else {
      res.status(400).json({ error: "failed to update profile" });
    }
  } catch (error) {
    console.log("error in edit profile controller", error);
    res.status(500).json({ error: "internal server error" });
  }
};
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

    const postWinRateStats = await Post.aggregate([
      { $match: { author_id: userObjectId } },
      {
        $project: {
          likes_count: 1,
          dislikes_count: 1,
          isWin: {
            $cond: {
              if: { $gt: ["$likes_count", "$dislikes_count"] },
              then: 1,
              else: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          wins: { $sum: "$isWin" },
          totalLikes: { $sum: "$likes_count" },
          totalDislikes: { $sum: "$dislikes_count" },
        },
      },
      {
        $addFields: {
          totalVotes: { $add: ["$totalLikes", "$totalDislikes"] },
          winRate: {
            $cond: {
              if: { $eq: ["$totalPosts", 0] },
              then: 0,
              else: {
                $round: [
                  { $multiply: [{ $divide: ["$wins", "$totalPosts"] }, 100] },
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
        _id: user._id,
        username: user.username,
        bio: user.bio,
        location: user.location,
        interestedCategories: user.interested_categories,
        trackers: user.followers_count,
        tracking: user.following_count,
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
