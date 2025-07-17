import express from "express";
import authRoutes from "./auth.routes.js";
import { searchUsers } from "../../controllers/user/auth/user.search.controller.js";
import protectRoute from "../../middlewares/protectRoute.js";
import {
  followUser,
  getFollowStatus,
  unfollowUser,
} from "../../controllers/follow.controller.js";
import { editProfile } from "../../controllers/forUser/profile.controller.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.get("/search", searchUsers);
router.patch("/edit", editProfile);
router.post("/track/:userToTrackId", protectRoute, followUser);
router.delete("/untrack/:userId", protectRoute, unfollowUser);
router.get("/status/:userId", protectRoute, getFollowStatus);

export default router;
