import express from "express";
import { createPost, like } from "../controllers/post.controller.js";
import { createComment } from "../controllers/comment.controller.js";
import multer from "multer";
import protectRoute from "../middlewares/protectRoute.js";
import { RateLimit } from "../middlewares/rateLimiter.js";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const router = express.Router();

router.use(protectRoute);

router.use(RateLimit);
router.post(
  "/post",
  upload.fields([
    { name: "image", maxCount: 3 },
    { name: "video", maxCount: 1 },
  ]),
  createPost
);

router.post("/createComment", createComment);

router.post("/like", like);

export default router;
