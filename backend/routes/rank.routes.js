import express from "express";
import {
  awardDebatePoints,
  awardEngagementPoints,
  getCategoryLeaderboard,
  getGlobalLeaderboard,
  getUserRank,
  getUserStats,
  updateGlobalRankings,
} from "../controllers/user/ranking.controller.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// Public routes
router.get("/leaderboard/global", getGlobalLeaderboard);
router.get("/leaderboard/category/:category", getCategoryLeaderboard);
router.get("/user/:userId/rank", getUserRank);
router.get("/user/:userId/stats", getUserStats);

// router.use(protectRoute);
router.post("/debate/award-points", awardDebatePoints);
router.post("/engagement/award-points", awardEngagementPoints);

// Admin routes (require admin authentication)
router.post("/admin/update-rankings", updateGlobalRankings);

export default router;
