import React from "react";
import { toast } from "react-toastify";
import { useState } from "react";

const useCreatePost = () => {
  const [Loading, setLoading] = useState(false);

  const createPost = async ({
    username,
    text,
    author_id,
    catogories,
    title,
  }) => {
    const sucsess = handleInputerrors(username, text, author_id, catogories);

    if (!sucsess) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/create/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, text, author_id, catogories, title }),
      });
    } catch (error) {
      toast(error.message);
    } finally {
      setLoading(false);
    }
  };
  return { createPost, Loading };
};

export default useCreatePost;

function handleInputerrors(username, text, author_id, catogories) {
  // if (!username || !text || !catogories) {
  //   toast.error("Fill all the feilds");
  //   return false;
  // } else {
  //   return true;
  // }

  return true;
}
