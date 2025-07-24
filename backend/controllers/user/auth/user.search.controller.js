import User from "../../../models/user.model.js";

export const searchUsers = async (req, res) => {
  const { q, gender } = req.query;
  console.log("first");
  console.log(q);
  if (!q) {
    return res.json();
  }
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  console.log(req.query.offset);
  if (req.query.offset > 5) {
    return res.json();
  }
  const filter = {};

  if (q) {
    const regex = new RegExp(q, "i");
    filter.username = regex;
  }

  if (gender && ["male", "female"].includes(gender)) {
    filter.gender = gender;
  }

  try {
    const users = await User.find(filter)
      .select("username  profilepic interested_categories  ")
      .limit(limit)
      .skip(offset);
    if (!users[0]) {
      return res.status(400).json({ users: "none" });
    }
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Search failed" });
  }
};
