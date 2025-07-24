import { toast } from "react-toastify";
import { useState, useCallback, useRef } from "react";
import { UserSearch } from "lucide-react";

const useSearchUsers = () => {
  const [loading, setLoading] = useState(false);
  const [User, setUser] = useState([]);
  const abortControllerRef = useRef(null);

  const searchUsers = async (query, limit) => {
    console.log(query + "efwe");
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
        }/api/user/search?q=${query}&offset=${limit}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal,
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setUser(data);
      return data;
    } catch (error) {
      if (error.name !== "AbortError" && error.users == "none") {
        toast.error(error.message || "Failed to fetch posts");
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { searchUsers, User, loading };
};

export default useSearchUsers;
