import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "debate post", // Assuming 'User' is the model for your users
      required: true,
    },
    likes: {
      type: Array,
      default: [],
    },
    dislikes: {
      type: Array,
      default: [],
    },
    title: {
      required: true,
      type: String,
      maxlength: 70, // Corrected the length constraint
    },
    text: {
      type: String,
      required: true,
    },
    categories: {
      type: Array,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Posts = mongoose.model("debate", postSchema);

export default Posts;
