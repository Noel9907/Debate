import express from "express";
import { getPostComment } from "../controllers/comment.controller.js";
import { getPosts } from "../controllers/post.controller.js";

const router = express.Router();
router.get("/getPostComments", getPostComment);
router.get("/getPosts", getPosts);
export default router;
