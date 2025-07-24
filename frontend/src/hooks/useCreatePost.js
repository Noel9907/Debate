import { toast } from "react-toastify";
import { useState } from "react";

const useCreatePost = () => {
  const [loading, setLoading] = useState(false);

  const createPost = async (formDataObj) => {
    const { username, text, categories, title } = formDataObj;

    const isValid = handleInputErrors(username, text, categories, title);
    if (!isValid) return;

    setLoading(true);
    try {
      const formData = new FormData();
      for (const key in formDataObj) {
        if (formDataObj[key] !== null) {
          formData.append(key, formDataObj[key]);
        }
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/create/post`,
        {
          method: "POST",
          credentials: "include",
          body: formData, // no JSON.stringify
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      toast.success("Post created successfully!");
      return await res.json();
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
