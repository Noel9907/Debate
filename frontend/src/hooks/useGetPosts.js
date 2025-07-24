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
      console.log(data.data);
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
export const useGetTrending = () => {
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
      console.log(data.data);
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
export const useGetPost = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState({});
  const [error, setError] = useState(null);

  const getPost = async (postId) => {
    if (!postId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/get/post?postid=${encodeURIComponent(postId)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const postData = data[0] || {};
      console.log(postData);
      setPost(postData);
      return postData;
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error(error.message || "Error getting post");
        setError(error.message || "Error getting post");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { post, getPost, isLoading, error };
};
export default useGetAllPosts;
