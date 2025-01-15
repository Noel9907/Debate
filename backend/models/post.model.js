import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  position: {
    type: Boolean, //tru for for-comment
  },
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  text: {
    required: true,
    type: String,
  },
  likes: {
    type: Array,
    default: [],
  },
  dislikes: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Reply = mongoose.model("Replies", commentSchema);

const postSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming 'User' is the model for your users
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

export default { Posts, Reply };
