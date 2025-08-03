import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { setupSocket } from "./socket/socketSetup.js";
import http from "http";
import userRoutes from "./routes/users/user.routes.js";
import createRoutes from "./routes/create.routes.js";
import getRoutes from "./routes/get.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import connectToMongoDB from "./db/connectToMongoDB.js";
import multer from "multer";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = setupSocket(server);
const PORT = process.env.PORT;

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5501",
      `http://${process.env.DOMAIN}:5501`,
      "http://localhost:8000",
    ],
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Make io available in routes
app.set("io", io);

// Routes
app.use("/api/user", userRoutes);
app.use("/api/create", createRoutes);
app.use("/api/get", getRoutes);
app.use("/api/chat", chatRoutes);

// Use server.listen() instead of app.listen() for Socket.IO
server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`server running at port ${PORT}`);
});
