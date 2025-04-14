import express from "express";
import { getPostComment } from "../controllers/comment.controller.js";
import { getPosts, post } from "../controllers/post.controller.js";

const router = express.Router();
router.post("/getPostComments", getPostComment);
router.get("/getPosts", getPosts);
router.get("/post", post);
export default router;
