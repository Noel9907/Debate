import express from "express";
import { createPost, getPosts } from "../controllers/post.controller.js";

const router = express.Router();

router.post("/post", createPost);

router.get("/getPosts", getPosts);

export default router;
