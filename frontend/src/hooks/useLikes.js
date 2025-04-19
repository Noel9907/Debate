import { useState } from "react";
import { toast } from "react-toastify";

export const useLikes = () => {
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = async ({ postid, user, stance }) => {
    // Validate required fields
    if (!postid || !user || !stance) {
      toast.error("Missing required fields for like operation");
      return;
    }
    console.log(postid);
    // Validate stance value
    if (stance !== "like" && stance !== "dislike") {
      toast.error("Invalid stance. Must be 'like' or 'dislike'");
      return;
    }

    setLikeLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/create/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postid,
            user,
            stance,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to process like operation");
      }

      const data = await res.json();

      // Show appropriate toast message based on response

      return data;
    } catch (error) {
      toast.error(error.message || "Something went wrong with like operation");
      return null;
    } finally {
      setLikeLoading(false);
    }
  };

  return { handleLike, likeLoading };
};

export default useLikes;
