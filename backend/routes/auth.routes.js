import express from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";
// import User from "../models/user.model.js";
// import bcrypt from "bcryptjs";
// import generateTockenAndSetCookie from "../utils/generateTocken.js";
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;
