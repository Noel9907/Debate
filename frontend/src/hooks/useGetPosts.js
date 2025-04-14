import { toast } from "react-toastify";
import { useState, useCallback, useRef } from "react";

const useGetAllPosts = () => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const abortControllerRef = useRef(null);

  const getPosts = useCallback(async () => {
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
        `${import.meta.env.VITE_API_URL}/api/get/getPosts`,
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

      setPosts(data.data);
      return data.data;
    } catch (error) {
      // Only show toast for errors that aren't aborts
      if (error.name !== "AbortError") {
        toast.error(error.message || "Failed to fetch posts");
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { getPosts, posts, loading };
};

// Post detail hook with improved error handling and caching
export const useGetPost = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState({});
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const postCacheRef = useRef({}); // Simple in-memory cache

  const getPost = async (postId) => {
    if (!postId) return null;

    // Check cache first
    if (postCacheRef.current[postId]) {
      setPost(postCacheRef.current[postId]);
      return postCacheRef.current[postId];
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/get/post?postid=${encodeURIComponent(postId)}`,
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

      const postData = data[0] || {};

      // Update cache
      postCacheRef.current[postId] = postData;

      setPost(postData);
      return postData;
    } catch (error) {
      // Only show toast for errors that aren't aborts
      if (error.name !== "AbortError") {
        setError(error.message || "Error getting post");
        toast.error(error.message || "Error getting post");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { post, getPost, isLoading, error };
};

export default useGetAllPosts;
