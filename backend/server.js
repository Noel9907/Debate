import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoutes from "./routes/users/user.routes.js";
import createRoutes from "./routes/create.routes.js";
import getRoutes from "./routes/get.routes.js";

import connectToMongoDB from "./db/connectToMongoDB.js";
import multer from "multer";
dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:8000",
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use("/api/user", userRoutes);
app.use("/api/create", upload.single("image"), createRoutes);
app.use("/api/get", getRoutes);

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`server running at port ${PORT}`);
});
