import Post from "../../models/post.model";
//rough
export const getPostById = async (req, res) => {
  const { userId } = req.body;
  const posts = await Post.find({ author_id: userId });
  return posts;
};
