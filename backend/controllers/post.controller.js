import mongoose from "mongoose";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import {
  generateFileName,
  getObjectSignedUrl,
  uploadFile,
} from "../services/uploadPhotos.js";
import sharp from "sharp";
export const createPost = async (req, res) => {
  try {
    const { username, text, categories, title } = req.body;
    const author_id = req.user;
    const imageFile = req.files?.image?.[0] || null;
    const videoFile = req.files?.video?.[0] || null;
    console.log(username, text, author_id, categories, title);
    if (!allThere({ username, text, author_id, categories, title })) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (text.length < 10) {
      return res
        .status(400)
        .json({ error: "Text must be at least 10 characters long" });
    }

    if (title.length > 70) {
      return res
        .status(400)
        .json({ error: "Title must be under 70 characters" });
    }

    let categoryArray;
    if (typeof categories === "string") {
      categoryArray = [categories];
    } else if (Array.isArray(categories)) {
      categoryArray = categories;
    } else {
      return res.status(400).json({ error: "Invalid categories format" });
    }

    if (categoryArray.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one category is required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = new Post({
      username,
      text,
      title,
      author_id,
      categories: categoryArray,
      image: !!imageFile,
      video: !!videoFile,
    });

    await post.save();

    if (imageFile) {
      const imageBuffer = await sharp(imageFile.buffer)
        .resize({ height: 1920, width: 1080, fit: "contain" })
        .toBuffer();

      const imageName = generateFileName("post-image", post.id, author_id);
      await uploadFile(imageBuffer, imageName, imageFile.mimetype);
    }

    if (videoFile) {
      const videoName = generateFileName("post-video", post.id, author_id);
      await uploadFile(videoFile.buffer, videoName, videoFile.mimetype);
    }

    res.status(201).json({
      id: post.id,
      username: post.username,
      title: post.title,
      text: post.text,
      author_id: post.author_id,
      categories: post.categories,
      hasImage: !!imageFile,
      hasVideo: !!videoFile,
    });
  } catch (error) {
    console.error("Error in createPost controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const post = async (req, res) => {
  try {
    const { postid } = req.query;
    userId = req.user._id;
    if (!postid) {
      throw new Error("no Post id");
    }

    const post = await Post.findById(postid).lean();
    if (!post) {
      throw new Error("no posts");
    }
    if (post.image) {
      post.imageUrl = await getObjectSignedUrl(
        `post-${post._id}-${post.author_id}`
      );
    }
    res.status(200).json([post]);
  } catch (error) {
    res.status(400).json("error in getting post controller");
  }
};

export const getPosts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Cap at 100
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;
    const userId = req.user?._id?.toString(); // Ensure string format

    // Fetch posts with required fields
    const posts = await Post.find(
      {},
      {
        _id: 1,
        username: 1,
        title: 1,
        text: 1,
        image: 1,
        video: 1,
        author_id: 1,
        likes: 1,
        dislikes: 1,
        likes_count: 1,
        dislikes_count: 1,
        comments_count: 1,
        engagement_score: 1,
        categories: 1,
        createdAt: 1,
      }
    )
      .sort({ engagement_score: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const batchSize = 10;
    const postsWithUrls = [];

    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (post) => {
          const postId = post._id.toString();
          const authorId = post.author_id.toString();

          const urlPromises = [];

          if (post.image) {
            urlPromises.push(
              getObjectSignedUrl(`post-image-${postId}-${authorId}`)
                .then((url) => ({ type: "image", url }))
                .catch(() => ({ type: "image", url: null }))
            );
          }

          if (post.video) {
            urlPromises.push(
              getObjectSignedUrl(`post-video-${postId}-${authorId}`)
                .then((url) => ({ type: "video", url }))
                .catch(() => ({ type: "video", url: null }))
            );
          }

          const urls = await Promise.all(urlPromises);

          const result = { ...post };

          // Set signed URLs
          result.imageUrl = post.image
            ? urls.find((u) => u.type === "image")?.url || null
            : null;
          result.videoUrl = post.video
            ? urls.find((u) => u.type === "video")?.url || null
            : null;

          // Check like/dislike status
          if (userId) {
            const userKey = userId.toString();

            result.isLiked =
              post.likes &&
              Object.hasOwn(post.likes, userKey) &&
              post.likes[userKey] === true;

            result.isDisliked =
              post.dislikes &&
              Object.hasOwn(post.dislikes, userKey) &&
              post.dislikes[userKey] === true;
          } else {
            result.isLiked = false;
            result.isDisliked = false;
          }

          // Clean up maps from response
          delete result.likes;
          delete result.dislikes;

          return result;
        })
      );

      postsWithUrls.push(...batchResults);
    }

    res.status(200).json({
      data: postsWithUrls,
      pagination: {
        page,
        limit,
        hasNext: posts.length === limit,
      },
    });
  } catch (error) {
    console.log("error in getPosts controller", error);
    res.status(500).json({ error: "internal server error" });
  }
};
export const getTrendingPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const timeFilter = req.query.timeFilter || "7d"; // 7d, 30d, all

    // Calculate date threshold based on time filter
    let dateThreshold = null;
    if (timeFilter !== "all") {
      const days = timeFilter === "7d" ? 7 : 30;
      dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);
    }

    // Build match conditions
    const matchConditions = {};
    if (dateThreshold) {
      matchConditions.createdAt = { $gte: dateThreshold };
    }
    if (category) {
      matchConditions.categories = { $in: [category] };
    }

    // Aggregation pipeline for trending posts
    const posts = await Post.aggregate([
      {
        $match: matchConditions,
      },
      {
        $addFields: {
          engagementScore: {
            $add: [
              { $multiply: ["$likes_count", 2] },
              { $multiply: ["$dislikes_count", 1] },
              { $multiply: ["$comments_count", 3] },
              // Time decay factor - newer posts get slight boost
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: [new Date(), "$createdAt"] },
                      1000 * 60 * 60 * 24, // Convert to days
                    ],
                  },
                  -0.1, // Slight negative weight for age (newer = higher score)
                ],
              },
            ],
          },
        },
      },
      {
        $sort: {
          engagementScore: -1,
          createdAt: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    const postsWithUrls = await Promise.all(
      posts.map(async (post) => {
        const base = { ...post };
        if (post.image) {
          base.imageUrl = await getObjectSignedUrl(
            `post-${post._id}-${post.author_id}`
          );
        }
        return base;
      })
    );

    res.status(200).json({ data: postsWithUrls });
  } catch (error) {
    console.log("error in getTrendingPosts controller", error);
    res.status(500).json({ error: "internal server error" });
  }
};
export const like = async (req, res) => {
  try {
    const { postid, stance } = req.body;
    const userId = req.user._id.toString();

    console.log("=== LIKE CONTROLLER DEBUG ===");
    console.log("User ID:", userId);
    console.log("Post ID:", postid);
    console.log("Stance:", stance);

    if (!postid || !userId || !stance) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["like", "dislike"].includes(stance)) {
      return res
        .status(400)
        .json({ error: "Stance must be 'like' or 'dislike'" });
    }

    // Fetch current post (lean for performance)
    const post = await Post.findById(postid, {
      likes: 1,
      dislikes: 1,
      likes_count: 1,
      dislikes_count: 1,
      comments_count: 1,
      author_id: 1,
    }).lean();

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    console.log("Current post likes:", post.likes);
    console.log("Current post dislikes:", post.dislikes);
    console.log("Current likes_count:", post.likes_count);
    console.log("Current dislikes_count:", post.dislikes_count);

    // Convert stored plain objects to Maps
    const currentLikes = new Map(Object.entries(post.likes || {}));
    const currentDislikes = new Map(Object.entries(post.dislikes || {}));
    const wasLiked = currentLikes.has(userId);
    const wasDisliked = currentDislikes.has(userId);

    console.log("User previously liked:", wasLiked);
    console.log("User previously disliked:", wasDisliked);
    console.log("Action being performed:", stance);

    // New Maps for updates
    const newLikes = new Map(currentLikes);
    const newDislikes = new Map(currentDislikes);

    let likesCountDelta = 0;
    let dislikesCountDelta = 0;
    let pointsDelta = 0;

    if (stance === "like") {
      if (wasLiked) {
        // User is removing their like
        newLikes.delete(userId);
        likesCountDelta = -1;
        pointsDelta = -0.1;
        console.log("Action: Removing like");
      } else {
        // User is adding like
        newLikes.set(userId, true);
        likesCountDelta = 1;
        pointsDelta = 0.1;
        console.log("Action: Adding like");
        if (wasDisliked) {
          // Also remove dislike
          newDislikes.delete(userId);
          dislikesCountDelta = -1;
          pointsDelta = 0.2;
          console.log("Action: Also removing existing dislike");
        }
      }
    } else {
      // Dislike case
      if (wasDisliked) {
        // User is removing their dislike
        newDislikes.delete(userId);
        dislikesCountDelta = -1;
        pointsDelta = 0.1;
        console.log("Action: Removing dislike");
      } else {
        // User is adding dislike
        newDislikes.set(userId, true);
        dislikesCountDelta = 1;
        pointsDelta = -0.1;
        console.log("Action: Adding dislike");
        if (wasLiked) {
          // Also remove like
          newLikes.delete(userId);
          likesCountDelta = -1;
          pointsDelta = -0.2;
          console.log("Action: Also removing existing like");
        }
      }
    }

    // Recalculate
    const updatedLikesCount = post.likes_count + likesCountDelta;
    const updatedDislikesCount = post.dislikes_count + dislikesCountDelta;
    const updatedEngagementScore =
      updatedLikesCount * 1.5 +
      post.comments_count * 2 -
      updatedDislikesCount * 0.5;

    console.log(
      "Deltas - Likes:",
      likesCountDelta,
      "Dislikes:",
      dislikesCountDelta
    );
    console.log(
      "New counts - Likes:",
      updatedLikesCount,
      "Dislikes:",
      updatedDislikesCount
    );

    // Update in DB
    const update = await Post.findByIdAndUpdate(
      postid,
      {
        $set: {
          likes: Object.fromEntries(newLikes),
          dislikes: Object.fromEntries(newDislikes),
          likes_count: updatedLikesCount,
          dislikes_count: updatedDislikesCount,
          engagement_score: updatedEngagementScore,
        },
      },
      {
        new: true,
        select: "likes dislikes likes_count dislikes_count author_id",
      }
    );

    if (!update) {
      return res.status(404).json({ error: "Post not found after update" });
    }

    // Async user point update
    if (pointsDelta !== 0) {
      User.updateOne(
        { _id: post.author_id },
        { $inc: { total_debate_points: pointsDelta } }
      ).catch((err) => console.error("Error updating user points:", err));
    }

    const isLiked = !!update.likes?.[userId];
    const isDisliked = !!update.dislikes?.[userId];

    console.log("Final state - isLiked:", isLiked, "isDisliked:", isDisliked);

    const message =
      stance === "like"
        ? isLiked
          ? "Post liked"
          : "Post unliked"
        : isDisliked
        ? "Post disliked"
        : "Dislike removed";

    console.log("Response message:", message);
    console.log("=== END DEBUG ===");

    return res.status(200).json({
      message,
      likes_count: update.likes_count,
      dislikes_count: update.dislikes_count,
      isLiked,
      isDisliked,
    });
  } catch (error) {
    console.error("Error in like controller:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// New function to handle debate outcomes
export const recordDebateOutcome = async (req, res) => {
  try {
    const { winnerId, loserId, category, postId } = req.body;

    if (!winnerId || !loserId || !category) {
      return res.status(400).json({
        error: "Missing required fields: winnerId, loserId, category",
      });
    }

    // Update post if provided
    if (postId) {
      await Post.findByIdAndUpdate(postId, {
        debate_resolved: true,
        debate_winner: winnerId,
        resolved_at: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Debate outcome recorded successfully",
    });
  } catch (error) {
    console.error("Error recording debate outcome:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to mark helpful content
export const markHelpful = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    if (!postId || !userId) {
      return res.status(400).json({
        error: "Missing required fields: postId, userId",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Update post with helpful vote
    await Post.findByIdAndUpdate(postId, {
      $inc: { helpful_votes: 1 },
    });

    res.status(200).json({
      success: true,
      message: "Helpful vote recorded successfully",
    });
  } catch (error) {
    console.error("Error marking helpful:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to report content
export const reportContent = async (req, res) => {
  try {
    const { postId, reporterId, reason } = req.body;

    if (!postId || !reporterId || !reason) {
      return res.status(400).json({
        error: "Missing required fields: postId, reporterId, reason",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Update post with report
    await Post.findByIdAndUpdate(postId, {
      $inc: { report_count: 1 },
      $push: {
        reports: {
          reporter: reporterId,
          reason: reason,
          timestamp: new Date(),
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Content reported successfully",
    });
  } catch (error) {
    console.error("Error reporting content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

function allThere({ username, text, author_id, categories, title }) {
  return !!(username && text && author_id && categories && title);
}
