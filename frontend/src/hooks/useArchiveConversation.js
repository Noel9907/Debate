import { useState } from "react";

export const useArchiveConversation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const archiveConversation = async (conversationId, archive = true) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/chat/conversations/${conversationId}/archive`,
        {
          method: "PATCH",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ archive }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to archive conversation");
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { archiveConversation, loading, error };
};
