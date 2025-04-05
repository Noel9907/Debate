import { toast } from "react-toastify";
import { useState } from "react";
import { use } from "react";
const useCreateComment = () => {
  const [LoadingComment, setLoadingComment] = useState(false);
  const createComment = async (comment) => {
    const { postid, username, text, position, author_id } = comment;
    const sucsess = handleInputerrors(
      postid,
      username,
      text,
      position,
      author_id
    );
    if (!sucsess) return;
    setLoadingComment(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/create/createComment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postid, username, text, position, author_id }),
        }
      );
    } catch (error) {
      toast(error.message);
    } finally {
      setLoadingComment(false);
    }
  };
  return { createComment, LoadingComment };
};
export default useCreateComment;

function handleInputerrors(postid, username, text, position, author_id) {
  if (
    !postid ||
    !username ||
    !text ||
    typeof position !== "boolean" ||
    !author_id
  ) {
    toast.error("fill all fields ! ");
    return false;
  } else {
    return true;
  }
}
