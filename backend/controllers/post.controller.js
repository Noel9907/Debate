import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const createPost = async (req, res) => {
  try {
    const { username, text, author_id, catogories, title } = req.body;
    const isthere = await User.findOne({ username: username });
    console.log(title);
    if (isthere) {
      const post = new Post({
        username,
        text,
        title,
        author_id,
        catogories,
        // postedBy: req.user._id,
      });
      await post.save();
      res.status(201).json({
        username: post.username,
        title: post.title,
        text: post.text,
        author_id: post.author_id,
        catogories: post.catogories,
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

export const getPosts = async (req, res) => {
  try {
    // const posts = Post.find().pretty();
    Post.find({}).then((data) => {
      res.status(200).json({ data: data });
    });
    // const data = Post.find({});
    // console.log(data);
  } catch (error) {
    console.log("error in createPost controller", error);
    res.status(500).json({ error: "internal server error" });
  }
};
