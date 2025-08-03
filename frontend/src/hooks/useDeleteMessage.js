import { useState } from "react";

export const useDeleteMessage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteMessage = async (messageId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/messages/${messageId}`,
        {
          method: "DELETE",
          credentials: "include",

          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to delete message");
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteMessage, loading, error };
};
