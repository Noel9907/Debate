import express from "express";
import {
  getPostsByUsernameWithStats,
  getUserDebateStats,
} from "../controllers/forUser/profile.controller.js";
const router = express.Router();
router.get("/getuserdetails/:username");
router.get("/getpoststats/:username", getPostsByUsernameWithStats);
router.get("/getuserstats/:username", getUserDebateStats);

export default router;
