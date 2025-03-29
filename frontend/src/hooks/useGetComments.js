import { toast } from "react-toastify";
import { useState } from "react";

export const useGetComments = () => {
  const [getCommentLoading, setgetCommentLoading] = useState();
  const [currentComment, setcurrentComment] = useState([]);

  const getComments = async (postid) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/get/getPostComments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postid }),
        }
      );
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setcurrentComment(data);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setgetCommentLoading(false);
    }
  };
  return { getComments, getCommentLoading, currentComment };
};
