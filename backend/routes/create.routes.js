import express from "express";
import { createPost, like } from "../controllers/post.controller.js";
import { createComment } from "../controllers/comment.controller.js";
import multer from "multer";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.use(protectRoute);
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post(
  "/post",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  createPost
);

router.post("/createComment", createComment);

router.post("/like", like);

export default router;
