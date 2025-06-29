import { useState } from "react";
import { toast } from "react-toastify";
import { useAuthContext } from "../context/AuthContext";

const useFollow = () => {
  const [loading, setLoading] = useState(false);
  const { authUser } = useAuthContext();
  const followUser = async (userToFollowId) => {
    if (!userToFollowId) return toast.error("User ID is required");

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/track/${userToFollowId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to follow user");

      toast.success("Followed successfully");
      return data.following; // Optional: return user info
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const unfollowUser = async (userToUnfollowId) => {
    if (!userToUnfollowId) return toast.error("User ID is required");

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/untrack/${userToUnfollowId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // Add any additional headers if needed
          },
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to unfollow user");

      toast.success("Unfollowed successfully");
      return data.unfollowed;
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async (targetUserId) => {
    if (!targetUserId) return false;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/status/${targetUserId}`,
        {
          headers: {
            Authorization: `Bearer ${authUser?.token}`,
          },

          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to check status");

      return data.isFollowing;
    } catch (err) {
      console.error("Follow status error:", err.message);
      return false;
    }
  };

  return { loading, followUser, unfollowUser, checkFollowStatus };
};

export default useFollow;
