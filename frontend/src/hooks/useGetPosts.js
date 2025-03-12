import { toast } from "react-toastify";
import { useState, useCallback } from "react";

const useGetAllPosts = () => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  const getPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/get/getPosts`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setPosts(data.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { getPosts, posts, loading };
};
// const useGet
export default useGetAllPosts;
