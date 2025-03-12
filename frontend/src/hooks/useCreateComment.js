import { toast } from "react-toastify";

const useCreateComment = () => {
  const [LoadingComment, setLoadingComment] = useState(false);
  const createComment = async (postid, username, text, position) => {
    const sucsess = handleInputerrors(postid, username, text, position);
    if (!sucsess) return;
    setLoadingComment(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/create/createComment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postid, username, text, position }),
        }
      );
    } catch (error) {
      toast(error.message);
    } finally {
      setLoadingComment(false);
    }
  };
  return { createComment, LoadingComment };
};
export default useCreateComment;

function handleInputerrors(postid, username, text, position) {
  if (!postid || !username || !text || !position) {
    toast.error("fill all fields !");
    return false;
  } else {
    return true;
  }
}
