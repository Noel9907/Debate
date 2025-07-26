import express from "express";
import { getPostComment } from "../controllers/comment.controller.js";
import {
  getPosts,
  getTrendingPosts,
  post,
} from "../controllers/post.controller.js";
import profileRoutes from "./profile.routes.js";
import protectRoute from "../middlewares/protectRoute.js";
const router = express.Router();
router.use(protectRoute);
router.post("/getPostComments", getPostComment);
router.get("/getPosts", getPosts);
router.get("/gettrending", getTrendingPosts);
router.get("/post", post);
router.use("/profile", profileRoutes);

export default router;
