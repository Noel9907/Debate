import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../../../models/user.model.js";
import generateTockenAndSetCookie from "../../../utils/generateTocken.js";
import { configDotenv } from "dotenv";
configDotenv();
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export const signup = async (req, res) => {
  try {
    const { username, password, confirmpassword, gender } = req.body;

    if (password !== confirmpassword) {
      return res.status(400).json({ error: "passwords dont match" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "password less than 6 letters" });
    }

    const user = await User.findOne({ username });

    if (user) {
      return res.status(400).json({ error: "username already exists" });
    }
    //hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = new User({
      username,
      password: hashedPassword,
      gender,
      profilepic: gender === "male" ? boyProfilePic : girlProfilePic,
    });

    await newUser.save();

    if (newUser) {
      //generate JWT tocken here
      generateTockenAndSetCookie(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        gender: newUser.gender,
        profilepic: newUser.profilepic,
        bio: newUser.bio,
        location: newUser.location,
        interested_categories: newUser.interested_categories,
        posts_count: newUser.posts_count,
        comments_count: newUser.comments_count,
        followers_count: newUser.followers_count,
        following_count: newUser.following_count,
        total_debate_points: newUser.total_debate_points,
        isGoogleUser: newUser.isGoogleUser,
      });
    } else {
      res.status(400).json({ error: "invalid user data" });
    }
  } catch (error) {
    console.log("error in signup controller", error);
    res.status(500).json({ error: "internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "no user with this username" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password || ""
    );
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "invalid user name or password" });
    }

    generateTockenAndSetCookie(user._id, res);
    return res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      profilepic: user.profilepic,
      bio: user.bio,
      location: user.location,
      interested_categories: user.interested_categories,
      posts_count: user.posts_count,
      comments_count: user.comments_count,
      followers_count: user.followers_count,
      following_count: user.following_count,
      total_debate_points: user.total_debate_points,
      isGoogleUser: user.isGoogleUser,
    });
  } catch (error) {
    console.log("error in login controller", error);
    res.status(500).json({ error: "internal server error" });
  }
};

// Google OAuth authentication (handles both login and signup)
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Google credential is required" });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId });
    let isNewUser = false;

    if (!user) {
      // Check if user exists with this email (traditional signup)
      user = await User.findOne({ email });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.profilepic = picture || user.profilepic;
        if (!user.fullname && name) user.fullname = name;
        await user.save();
        console.log(`Linked Google account to existing user: ${user.username}`);
      } else {
        // Create new user (Google Signup)
        let baseUsername = email.split("@")[0];
        let username = baseUsername;
        let counter = 1;

        // Ensure unique username
        while (await User.findOne({ username })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        user = new User({
          username,
          email,
          fullname: name,
          googleId,
          profilepic:
            picture ||
            `https://avatar.iran.liara.run/public/boy?username=${username}`,
          isGoogleUser: true,
        });
        await user.save();
        isNewUser = true;
        console.log(`Created new user via Google: ${user.username}`);
      }
    }

    // Generate JWT token and set cookie
    generateTockenAndSetCookie(user._id, res);

    return res.status(isNewUser ? 201 : 200).json({
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      profilepic: user.profilepic,
      bio: user.bio,
      location: user.location,
      interested_categories: user.interested_categories,
      posts_count: user.posts_count,
      comments_count: user.comments_count,
      followers_count: user.followers_count,
      following_count: user.following_count,
      total_debate_points: user.total_debate_points,
      isGoogleUser: user.isGoogleUser,
      isNewUser, // Let frontend know if this was a signup or login
    });
  } catch (error) {
    console.log("Error in Google auth controller", error);
    if (error.message.includes("Invalid token")) {
      return res.status(400).json({ error: "Invalid Google token" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    console.log("logged out");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
