import Follow from "../models/follow.model.js";
import User from "../models/user.model.js";

export const followUser = async (req, res) => {
  try {
    const { userToTrackId } = req.params;
    const followerId = req.user._id;

    if (!userToTrackId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Check if user exists
    const userToFollow = await User.findById(userToTrackId);
    if (!userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent self-following
    if (followerId.toString() === userToTrackId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userToTrackId,
    });

    if (existingFollow) {
      return res.status(400).json({ error: "Already following this user" });
    }

    // Create follow relationship
    const follow = new Follow({
      follower: followerId,
      following: userToTrackId,
    });
    await follow.save();

    // Update counts
    await User.findByIdAndUpdate(followerId, {
      $inc: { following_count: 1 },
    });
    await User.findByIdAndUpdate(userToTrackId, {
      $inc: { followers_count: 1 },
    });

    return res.status(200).json({
      message: "User followed successfully",
      following: {
        _id: userToFollow._id,
        username: userToFollow.username,
        profilepic: userToFollow.profilepic,
      },
    });
  } catch (error) {
    console.log("error in followUser controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;

    // Validate input
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Check if user exists
    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find and remove follow relationship
    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: userId,
    });

    if (!follow) {
      return res.status(400).json({ error: "Not following this user" });
    }

    // Update counts
    await User.findByIdAndUpdate(followerId, {
      $inc: { following_count: -1 },
    });
    await User.findByIdAndUpdate(userId, {
      $inc: { followers_count: -1 },
    });

    return res.status(200).json({
      message: "User unfollowed successfully",
      unfollowed: {
        _id: userToUnfollow._id,
        username: userToUnfollow.username,
        profilepic: userToUnfollow.profilepic,
      },
    });
  } catch (error) {
    console.log("error in unfollowUser controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const isFollowing = await Follow.exists({
      follower: currentUserId,
      following: userId,
    });

    return res.status(200).json({
      isFollowing: !!isFollowing,
    });
  } catch (error) {
    console.log("error in getFollowStatus controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
