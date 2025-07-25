import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    console.log(token);
    if (!token) {
      return res
        .status(401)
        .json({ error: "unauthorized - no tocken provided" });
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      return res
        .status(401)
        .json({ error: "unauthorized - invalid tocken provided" });
    }

    const user = await User.findById(decode.userId).select("-password");

    if (!user) {
      res.status(401).json({ error: "user not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("error in protective middleware: ", error.message);
    res.status(500).json({ error: "internal server error" });
  }
};
export default protectRoute;
