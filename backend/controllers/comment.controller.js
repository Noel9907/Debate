import Reply from "../models/post.model.js";

export const getPostComment = async (req, res) => {
  try {
    Reply.find({}).then((data) => {
      res.status(200).json({ data: data });
    });
  } catch (error) {
    console.log("error in createPost controller", error);
    res.status(500).json({ error: "internal server error" });
  }
};

export const getCommentReplies = async (req, res) => {
  try {
    Reply.find({}).then((data) => {
      res.status(200).json({ data: data });
    });
  } catch (error) {
    console.log("error in createPost controller", error);
    res.status(500).json({ error: "internal server error" });
  }
};
