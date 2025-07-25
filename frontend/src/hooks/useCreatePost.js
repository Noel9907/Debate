import { toast } from "react-toastify";
import { useState } from "react";

const useCreatePost = () => {
  const [loading, setLoading] = useState(false);

  const createPost = async (formDataObj) => {
    const { username, text, categories, title } = formDataObj;

    const isValid = handleInputErrors(username, text, categories, title);
    if (!isValid) return;

    setLoading(true);
    const toastId = toast.loading("Creating the debate..");

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
        console.log(errorData.error);
        throw new Error(errorData.error || "Failed to create post");
      }

      toast.update(toastId, {
        render: "Debate created successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      return await res.json();
    } catch (error) {
      console.log(error.message);
      toast.update(toastId, {
        render: error.message || "Something went wrong",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
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
