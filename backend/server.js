import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoutes from "./routes/users/user.routes.js";
import createRoutes from "./routes/create.routes.js";
import getRoutes from "./routes/get.routes.js";

import connectToMongoDB from "./db/connectToMongoDB.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRoutes);
app.use("/api/create", createRoutes);
app.use("/api/get", getRoutes);

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`server running at port ${PORT}`);
});
