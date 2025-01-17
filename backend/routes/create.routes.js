import express from "express";
import { createPost } from "../controllers/post.controller.js";
import { createComment } from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/post", createPost);

router.post("/createComment", createComment);

export default router;
