import { toast } from "react-toastify";
import { useState } from "react";

const useCreateComment = () => {
  const [LoadingComment, setLoadingComment] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  const createComment = async (comment) => {
    const { postid, username, text, position, author_id } = comment;
    const success = handleInputErrors(
      postid,
      username,
      text,
      position,
      author_id
    );
    if (!success) return Promise.reject(new Error("Invalid input"));

    setLoadingComment(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/create/createComment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postid, username, text, position, author_id }),
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create comment");
      }

      setCommentSubmitted(true);
      return res.json();
    } catch (error) {
      toast.error(error.message || "Error creating comment");
      throw error;
    } finally {
      setLoadingComment(false);
    }
  };

  return { createComment, LoadingComment, commentSubmitted };
};

export default useCreateComment;

function handleInputErrors(postid, username, text, position, author_id) {
  console.log("first", postid, username, text, position, author_id);
  if (
    !postid ||
    !username ||
    !text ||
    typeof position !== "boolean" ||
    !author_id
  ) {
    toast.error("Please fill all fields!");
    return false;
  } else {
    return true;
  }
}
