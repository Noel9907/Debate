import { useState } from "react";

export const useStartConversation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startConversation = async (recipientUsername) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/conversations`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            recipientUsername,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to start conversation");
      }

      return data.conversation;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { startConversation, loading, error };
};
