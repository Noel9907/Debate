import mongoose from "mongoose";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const createPost = async (req, res) => {
  try {
    const { username, text, author_id, categories, title } = req.body;
    const isthere = await User.findOne({ username: username });
    console.log(title);
    if (isthere) {
      const post = new Post({
        username,
        text,
        title,
        author_id,
        categories,
      });
      await post.save();
      res.status(201).json({
        id: post.id,
        username: post.username,
        title: post.title,
        text: post.text,
        author_id: post.author_id,
        categories: post.categories,
        // postedBy: post.postedBy,
      });
    } else {
      throw "no existing user";
    }
  } catch (error) {
    console.log("error in createPost controller", error);
    res.status(500).json({ error: "internal server error" });
  }
};
export const post = async (req, res) => {
  try {
    const { postid } = req.query;
    if (!postid) {
      throw new Error("no POst id");
    }

    const post = await Post.find({ _id: postid }).then((data) => {
      res.status(201).json(data);
    });
  } catch (error) {
    res.status(400).json("error in getting post controller");
  }
};
export const getPosts = async (req, res) => {
  try {
    // const posts = Post.find().pretty();
    Post.find({}).then((data) => {
      res.status(200).json({ data: data });
    });
    // const data = Post.find({});
  } catch (error) {
    console.log("error in createPost controller", error);
    res.status(500).json({ error: "internal server error" });
  }
};

export const like = async (req, res) => {
  try {
    const { postid, user, stance } = req.body;

    console.log(postid + user + stance);
    const isThere = allThere(postid, user, stance);
    if (isThere) {
      // Find the post first to make sure it exists
      const post = await Post.findById(postid);

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      const userId = user; // Assuming user is the user ID

      const userObjectId = new mongoose.Types.ObjectId(userId);

      // Check if stance is valid
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
      return res.status(404).json({ error: "not all feilds" });
    }
  } catch (error) {
    console.error("Error in like controller", error);
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
