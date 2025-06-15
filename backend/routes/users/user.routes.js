import express from "express";
import authRoutes from "./auth.routes.js";
import { searchUsers } from "../../controllers/user/auth/user.search.controller.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.get("/search", searchUsers);

export default router;
