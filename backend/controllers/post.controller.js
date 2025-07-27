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
    const userId = req.user._id;
    if (!postid) {
      throw new Error("no Post id");
    }

    const post = await Post.findById(postid).lean();
    if (!post) {
      throw new Error("no posts");
    }
    if (post.image) {
      post.imageUrl = await getObjectSignedUrl(
        `post-image-${post._id}-${post.author_id}`
      );
    }
    if (post.video) {
      post.videoUrl = await getObjectSignedUrl(
        `post-video-${post._id}-${post.author_id}`
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
    const userId = req.user?._id?.toString();
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

    // Input validation
    if (!postid || !userId || !stance) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["like", "dislike"].includes(stance)) {
      return res
        .status(400)
        .json({ error: "Stance must be 'like' or 'dislike'" });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(postid)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }

    // Use findOneAndUpdate with optimistic concurrency control
    const post = await Post.findById(postid, {
      likes: 1,
      dislikes: 1,
      likes_count: 1,
      dislikes_count: 1,
      comments_count: 1,
      author_id: 1,
      __v: 1, // Version key for optimistic locking
    }).lean();

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Convert to Maps for efficient operations
    const currentLikes = new Map(Object.entries(post.likes || {}));
    const currentDislikes = new Map(Object.entries(post.dislikes || {}));

    const wasLiked = currentLikes.has(userId);
    const wasDisliked = currentDislikes.has(userId);

    // Calculate updates
    const updates = calculateUpdates(
      stance,
      wasLiked,
      wasDisliked,
      userId,
      currentLikes,
      currentDislikes
    );

    if (updates.noChange) {
      // No actual change needed, return current state
      const message = stance === "like" ? "Post unliked" : "Dislike removed";
      return res.status(200).json({
        message,
        likes_count: post.likes_count,
        dislikes_count: post.dislikes_count,
        isLiked: wasLiked,
        isDisliked: wasDisliked,
      });
    }

    // Calculate new values
    const newLikesCount = post.likes_count + updates.likesCountDelta;
    const newDislikesCount = post.dislikes_count + updates.dislikesCountDelta;
    const newEngagementScore =
      newLikesCount * 1.5 + post.comments_count * 2 - newDislikesCount * 0.5;

    // Convert Maps back to objects for database storage
    const likesObject = Object.fromEntries(updates.newLikes);
    const dislikesObject = Object.fromEntries(updates.newDislikes);

    // Atomic update with optimistic locking to prevent race conditions
    const updatedPost = await Post.findOneAndUpdate(
      {
        _id: postid,
        __v: post.__v, // Optimistic locking - only update if version matches
      },
      {
        $set: {
          likes: likesObject,
          dislikes: dislikesObject,
          likes_count: newLikesCount,
          dislikes_count: newDislikesCount,
          engagement_score: newEngagementScore,
        },
        $inc: { __v: 1 }, // Increment version
      },
      {
        new: true,
        select: "likes_count dislikes_count author_id __v",
      }
    );

    if (!updatedPost) {
      // Document was modified by another request, retry logic could be added here
      return res.status(409).json({
        error: "Post was modified by another request, please try again",
      });
    }

    // Async user point update (non-blocking)
    if (updates.pointsDelta !== 0) {
      setImmediate(() => {
        User.updateOne(
          { _id: post.author_id },
          { $inc: { total_debate_points: updates.pointsDelta } }
        ).catch((err) => {
          console.error("Error updating user points:", {
            error: err.message,
            userId: post.author_id,
            pointsDelta: updates.pointsDelta,
            postId: postid,
            timestamp: new Date().toISOString(),
          });
        });
      });
    }

    // Determine final state
    const isLiked = updates.newLikes.has(userId);
    const isDisliked = updates.newDislikes.has(userId);

    const message =
      stance === "like"
        ? isLiked
          ? "Post liked"
          : "Post unliked"
        : isDisliked
        ? "Post disliked"
        : "Dislike removed";

    return res.status(200).json({
      message,
      likes_count: updatedPost.likes_count,
      dislikes_count: updatedPost.dislikes_count,
      isLiked,
      isDisliked,
    });
  } catch (error) {
    // Log error for monitoring (use structured logging in production)
    console.error("Error in like controller:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      postId: req.body?.postid,
      stance: req.body?.stance,
      timestamp: new Date().toISOString(),
    });

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
const calculateUpdates = (
  stance,
  wasLiked,
  wasDisliked,
  userId,
  currentLikes,
  currentDislikes
) => {
  const newLikes = new Map(currentLikes);
  const newDislikes = new Map(currentDislikes);
  let likesCountDelta = 0;
  let dislikesCountDelta = 0;
  let pointsDelta = 0;

  if (stance === "like") {
    if (wasLiked) {
      // Remove like
      newLikes.delete(userId);
      likesCountDelta = -1;
      pointsDelta = -0.1;
    } else {
      // Add like
      newLikes.set(userId, true);
      likesCountDelta = 1;
      pointsDelta = 0.1;
      if (wasDisliked) {
        // Also remove dislike
        newDislikes.delete(userId);
        dislikesCountDelta = -1;
        pointsDelta = 0.2;
      }
    }
  } else {
    // Dislike case
    if (wasDisliked) {
      // Remove dislike
      newDislikes.delete(userId);
      dislikesCountDelta = -1;
      pointsDelta = 0.1;
    } else {
      // Add dislike
      newDislikes.set(userId, true);
      dislikesCountDelta = 1;
      pointsDelta = -0.1;
      if (wasLiked) {
        // Also remove like
        newLikes.delete(userId);
        likesCountDelta = -1;
        pointsDelta = -0.2;
      }
    }
  }

  return {
    newLikes,
    newDislikes,
    likesCountDelta,
    dislikesCountDelta,
    pointsDelta,
    noChange: likesCountDelta === 0 && dislikesCountDelta === 0,
  };
};
