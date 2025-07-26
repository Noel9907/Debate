import { useState } from "react";
import { toast } from "react-toastify";
import { useAuthContext } from "../context/AuthContext";

const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const googleAuth = async (credential) => {
    if (!credential) {
      toast.error("Google authentication failed");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/auth/google-auth`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ credential }),
        }
      );

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      localStorage.setItem("duser", JSON.stringify(data));
      setAuthUser(data);

      // Show appropriate success message
      if (data.isNewUser) {
        toast.success(
          `Welcome to our platform, ${
            data.fullname || data.username
          }! Your account has been created.`
        );
      } else {
        toast.success(`Welcome back, ${data.fullname || data.username}!`);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, googleAuth };
};

export default useGoogleAuth;
