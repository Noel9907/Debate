import { toast } from "react-toastify";
import { useState } from "react";

const useCreatePost = () => {
  const [loading, setLoading] = useState(false);
  const createPost = async ({
    username,
    text,
    author_id,
    categories,
    title,
  }) => {
    const isValid = handleInputErrors(username, text, categories, title);

    if (!isValid) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/create/post`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            text,
            author_id,
            categories,
            title,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      toast.success("Post created successfully!");
      return await res.json(); // Optionally return response data
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { createPost, loading };
};

export default useCreatePost;

function handleInputErrors(username, text, categories, title) {
  if (!username || !text || !categories || !title) {
    toast.error("All fields are required");
    return false;
  }
  if (text.length < 10) {
    toast.error("Text must be at least 10 characters long");
    return false;
  }
  return true;
}
