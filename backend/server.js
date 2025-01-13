import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import createRoutes from "./routes/create.routes.js";
// import userRoutes from "./routes/user.routes.js";

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

app.use("/api/auth", authRoutes);
app.use("/api/create", createRoutes);
// app.use("/api/users", userRoutes);

// app.get("/",(req,res)=> {
//     //root rout http://localhost:5000/
//     res.send("hellow mad am");
// });

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`server running at port ${PORT}`);
});
