import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      minlength: 6,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    profilepic: {
      type: String,
      default: "",
    },
    // insterested_categories: {
    //   type: String,
    //   required: false,
    // },
    //created at ,updated at => Member since <CreatedAt>
  },
  { timestamps: true }
);
const User = mongoose.model("debate post", userSchema);

export default User;
