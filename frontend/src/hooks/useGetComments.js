import { useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";

export const useGetComments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const lastFetchTimeRef = useRef(0);
  const pendingRequestRef = useRef(null);
  const abortControllerRef = useRef(null);
  const THROTTLE_TIME = 2000; // 2 seconds between requests

  const getComments = useCallback(async (postId) => {
    if (!postId) {
      return Promise.resolve([]);
    }

    // Cancel any ongoing requests when called again
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Throttle requests
    const now = Date.now();
    if (now - lastFetchTimeRef.current < THROTTLE_TIME) {
      console.log("Throttling comment fetch request");

      // Cancel previous pending throttled request if exists
      if (pendingRequestRef.current) {
        clearTimeout(pendingRequestRef.current);
      }

      // Return a promise that will resolve after the throttle time
      return new Promise((resolve) => {
        pendingRequestRef.current = setTimeout(() => {
          pendingRequestRef.current = null;
          getComments(postId).then(resolve);
        }, THROTTLE_TIME - (now - lastFetchTimeRef.current));
      });
    }

    lastFetchTimeRef.current = now;

    try {
      setIsLoading(true);
      setError(null);

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const timeout = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, 10000); // 10s timeout

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/get/getPostComments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postid: postId }),
          signal,
        }
      );

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setComments(data || []);
      return data;
    } catch (error) {
      // Only show toast for errors that aren't aborts
      if (error.name !== "AbortError") {
        setError(error.message || "Error getting comments");
        toast.error("Failed to fetch comments. Please try again later.");
      }
      return [];
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  // For manual control of comment state (useful for optimistic updates)
  const updateComments = useCallback((newComments) => {
    setComments(newComments);
  }, []);

  return {
    getComments,
    isLoading,
    comments,
    error,
    updateComments,
  };
};
