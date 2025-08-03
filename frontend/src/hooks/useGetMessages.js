import { useState, useEffect } from "react";

export const useGetMessages = (conversationId, page = 1, limit = 50) => {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch messages");
      }

      setMessages(data.messages);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId, page, limit]);

  return {
    messages,
    pagination,
    loading,
    error,
    refetch: fetchMessages,
    setMessages,
  };
};
