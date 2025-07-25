import { useState } from "react";

const useLikes = () => {
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = async ({ postid, stance }) => {
    // Validate required fields
    if (!postid || !stance) {
      console.error("Missing required fields for like operation");
      return null;
    }

    // Validate stance value
    if (stance !== "like" && stance !== "dislike") {
      console.error("Invalid stance. Must be 'like' or 'dislike'");
      return null;
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
            stance,
          }),
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error(
          "API Error:",
          data.error || "Failed to process like operation"
        );
        return null;
      }

      console.log("Like response:", data); // Debug log
      return data;
    } catch (error) {
      console.error(
        "Network error in handleLike:",
        error.message || "Something went wrong with like operation"
      );
      return null;
    } finally {
      setLikeLoading(false);
    }
  };

  return { handleLike, likeLoading };
};

export default useLikes;
