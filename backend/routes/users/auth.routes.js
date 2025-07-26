import express from "express";
import {
  login,
  logout,
  signup,
  googleAuth,
} from "../../controllers/user/auth/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google-auth", googleAuth);
router.post("/logout", logout);

export default router;
