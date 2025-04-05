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

export const getPosts = async (req, res) => {
  try {
    // const posts = Post.find().pretty();
    Post.find({}).then((data) => {
      res.status(200).json({ data: data });
      // console.log(data);
    });
    // const data = Post.find({});
  } catch (error) {
    console.log("error in createPost controller", error);
    res.status(500).json({ error: "internal server error" });
  }
};

export const like = async (req, res) => {
  try {
    const { postid } = req.body;
    const isthere = Post.findOne({ _id: postid });
    if (isthere) {
      const likes = Post.findOne({ _id: postid }, { likes: 1 });
      console.log(Post.findOne({ _id: postid }, { likes: 1 }));
      console.log("dfsd" + likes);
      res.status(200);
    }
  } catch (error) {
    console.error("Error in like controller", error);
    res.status(500).json({ error: "internal server error" });
  }
};
