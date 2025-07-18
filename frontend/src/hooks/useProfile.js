import { toast } from "react-toastify";
import { useState, useCallback, useRef } from "react";
export const useProfileStats = () => {
  const [loading, setLoading] = useState(false);
  const [profileStats, setProfileStats] = useState(null);
  const abortControllerRef = useRef(null);

  const getProfileStats = useCallback(async (username) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/get/profile/getuserstats/${username}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal,
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      console.log(data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.success) {
        throw new Error("Failed to fetch profile stats");
      }

      setProfileStats(data.data);
      return data.data;
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error(error.message || "Failed to fetch profile stats");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getProfileStats, profileStats, loading };
};

export const usePostStats = () => {
  const [loading, setLoading] = useState(false);
  const [postStats, setPostStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const abortControllerRef = useRef(null);

  const getPostStats = useCallback(async (username, page = 1, limit = 5) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/get/profile/getpoststats/${username}?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal,
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.success) {
        throw new Error("Failed to fetch post stats");
      }

      // If it's the first page, replace the posts, otherwise append
      if (page === 1) {
        setPosts(data.data.posts || []);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...(data.data.posts || [])]);
      }

      // Update hasMore based on returned posts length
      setHasMore((data.data.posts || []).length === limit);

      // Set the overall stats (excluding posts array for cleaner state)
      const { posts: _, ...statsWithoutPosts } = data.data;
      setPostStats(statsWithoutPosts);

      return data.data;
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error(error.message || "Failed to fetch post stats");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMorePosts = useCallback(
    async (username, currentPage, limit = 5) => {
      return await getPostStats(username, currentPage + 1, limit);
    },
    [getPostStats]
  );

  const refreshPosts = useCallback(
    async (username, limit = 5) => {
      setPosts([]);
      setHasMore(true);
      return await getPostStats(username, 1, limit);
    },
    [getPostStats]
  );

  return {
    getPostStats,
    loadMorePosts,
    refreshPosts,
    postStats,
    posts,
    hasMore,
    loading,
  };
};

export const useEditProfile = () => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const abortControllerRef = useRef(null);

  const editProfile = useCallback(async (profileUpdates) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/edit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileUpdates),
        signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log(data);

      if (data.error) {
        throw new Error(data.error);
      }

      setProfileData(data);
      toast.success("Profile updated successfully");
      return data;
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error(error.message || "Failed to update profile");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { editProfile, profileData, loading };
};
