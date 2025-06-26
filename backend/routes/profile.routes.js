import express from "express";
import {
  getPostsByUserId,
  getPostsByUserIdWithStats,
  getUserDebateStats,
} from "../controllers/forUser/profile.controller.js";
const router = express.Router();
router.get("/getpostbyid/:userId", getPostsByUserId);
router.get("/getpoststats/:userId", getPostsByUserIdWithStats);
router.get("/getuserstats/:userId", getUserDebateStats);

export default router;
