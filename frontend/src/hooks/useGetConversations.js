import { useState, useEffect } from "react";

export const useGetConversations = (page = 1, limit = 20) => {
  const [conversations, setConversations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/chat/conversations?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch conversations");
      }

      setConversations(data.conversations);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [page, limit]);

  return {
    conversations,
    pagination,
    loading,
    error,
    refetch: fetchConversations,
    setConversations,
  };
};
