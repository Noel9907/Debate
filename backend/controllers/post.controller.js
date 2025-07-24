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
    const { username, text, author_id, categories, title } = req.body;

    const imageFile = req.files?.image?.[0] || null;
    const videoFile = req.files?.video?.[0] || null;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = new Post({
      username,
      text,
      title,
      author_id,
      categories,
      image: imageFile ? true : false,
      video: videoFile ? true : false,
    });

    await post.save();

    // Handle image upload
    if (imageFile) {
      const imageBuffer = await sharp(imageFile.buffer)
        .resize({ height: 1920, width: 1080, fit: "contain" })
        .toBuffer();

      const imageName = generateFileName("post-image", post.id, author_id);
      await uploadFile(imageBuffer, imageName, imageFile.mimetype);
    }

    // Handle video upload
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
    console.error("error in createPost controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const post = async (req, res) => {
  try {
    const { postid } = req.query;
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
    console.log(post);
    res.status(200).json([post]);
  } catch (error) {
    res.status(400).json("error in getting post controller");
  }
};

export const getPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const posts = await Post.aggregate([
      {
        $addFields: {
          engagementScore: {
            $add: [
              { $multiply: ["$likes_count", 2] },
              { $multiply: ["$dislikes_count", 1] },
              { $multiply: ["$comments_count", 3] },
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
        $limit: limit,
      },
    ]);

    const postsWithUrls = await Promise.all(
      posts.map(async (post) => {
        const postId = post._id?.toString();
        const authorId = post.author_id?.toString();

        let imageUrl = null;
        let videoUrl = null;

        if (post.image) {
          imageUrl = await getObjectSignedUrl(
            `post-image-${postId}-${authorId}`
          );
        }
        if (post.video) {
          videoUrl = await getObjectSignedUrl(
            `post-video-${postId}-${authorId}`
          );
        }

        return {
          ...post,
          imageUrl,
          videoUrl,
        };
      })
    );

    res.status(200).json({ data: postsWithUrls });
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
    const { postid, user, stance } = req.body;

    console.log(postid + user + stance);
    const isThere = allThere(postid, user, stance);
    if (isThere) {
      const post = await Post.findById(postid);

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      const userId = user;

      const userObjectId = new mongoose.Types.ObjectId(userId);

      if (stance !== "like" && stance !== "dislike") {
        return res
          .status(400)
          .json({ error: "Invalid stance. Must be 'like' or 'dislike'" });
      }

      // Check if user already liked the post
      const alreadyLiked = post.likes.includes(userObjectId);
      // Check if user already disliked the post
      const alreadyDisliked = post.dislikes.includes(userObjectId);

      // Handle like stance
      if (stance === "like") {
        if (alreadyLiked) {
          // User already liked, so unlike
          await Post.findByIdAndUpdate(postid, {
            $pull: { likes: userObjectId },
            $inc: { likes_count: -1 },
          });

          // Remove like points from post author
          const postAuthor = await User.findById(post.author_id);

          return res.status(200).json({ message: "Post unliked successfully" });
        } else {
          // Remove from dislikes if present
          if (alreadyDisliked) {
            await Post.findByIdAndUpdate(postid, {
              $pull: { dislikes: userObjectId },
              $inc: { dislikes_count: -1 },
            });
          }

          // Add to likes
          await Post.findByIdAndUpdate(postid, {
            $addToSet: { likes: userObjectId },
            $inc: { likes_count: 1 },
          });

          // Award points to post author for receiving a like
          const postAuthor = await User.findById(post.author_id);

          return res.status(200).json({ message: "Post liked successfully" });
        }
      }

      // Handle dislike stance
      if (stance === "dislike") {
        if (alreadyDisliked) {
          // User already disliked, so remove dislike
          await Post.findByIdAndUpdate(postid, {
            $pull: { dislikes: userObjectId },
            $inc: { dislikes_count: -1 },
          });
          return res
            .status(200)
            .json({ message: "Dislike removed successfully" });
        } else {
          // Remove from likes if present
          if (alreadyLiked) {
            await Post.findByIdAndUpdate(postid, {
              $pull: { likes: userObjectId },
              $inc: { likes_count: -1 },
            });

            // Remove like points from post author
            const postAuthor = await User.findById(post.author_id);
          }

          // Add to dislikes
          await Post.findByIdAndUpdate(postid, {
            $addToSet: { dislikes: userObjectId },
            $inc: { dislikes_count: 1 },
          });
          return res
            .status(200)
            .json({ message: "Post disliked successfully" });
        }
      }
    } else {
      return res.status(404).json({ error: "not all fields" });
    }
  } catch (error) {
    console.error("Error in like controller", error);
    res.status(500).json({ error: "Internal server error" });
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

function allThere(postid, user, stance) {
  if (!postid || !user || !stance) {
    return false;
  } else {
    return true;
  }
}
