import Reply from "../models/comment.model.js";
import Posts from "../models/post.model.js";

export const getPostComment = async (req, res) => {
  try {
    const { postid } = req.body;
    if (!postid) {
      throw new Error("no POst id");
    }
    const isthere = await Reply.findOne({ postid: postid });
    if (isthere) {
      Reply.find({ postid: postid }).then((data) => {
        res.status(201).json(data);
      });
    } else {
      res.status(203).json({ message: "no comments" });
    }
  } catch (error) {
    console.log("error in createPost controller", error);
    res.status(500).json({ error: "internal server error" });
  }
};

export const createComment = async (req, res) => {
  try {
    const { username, postid, text, position, author_id } = req.body;
    console.log("auth id " + author_id);
    const isthere = await Posts.findOne({ _id: postid });
    if (isthere) {
      const comment = new Reply({
        username,
        text,
        postid,
        author_id,
        position,
      });
      await comment.save();
      res.status(201).json({
        username: comment.username,
        postid: comment.postid,
        text: comment.text,
        author_id: comment.author_id,
        position: comment.position, // postedBy: post.postedBy,
      });
    } else {
      throw new Error("no post with this is");
    }
  } catch (error) {
    console.log("error in createPost controller", error);
    res.status(500).json({ error: "internal server error" });
  }
};
