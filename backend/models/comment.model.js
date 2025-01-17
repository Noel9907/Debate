import mongoose from "mongoose";
const commentSchema = new mongoose.Schema(
  {
    postid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "debate",
      required: true,
    },
    username: {
      type: String,
      ref: "debate post",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 500, // Set a limit to the comment length
    },
    position: {
      type: Boolean,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Reply = mongoose.model("Comment", commentSchema);

export default Reply;
