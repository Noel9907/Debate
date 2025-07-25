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
    // Validate stance value
    if (stance !== "like" && stance !== "dislike") {
      toast.error("Invalid stance. Must be 'like' or 'dislike'");
      return;
    }

    setLikeLoading(true);
    console.log(import.meta.env.VITE_API_URL);
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
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to process like operation");
      }

      const data = await res.json();

      // Show appropriate toast message based on response
      // toast.success(data.message);

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
