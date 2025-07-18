import { useState } from "react";
import { toast } from "react-toastify";
import { useAuthContext } from "../context/AuthContext";
const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const login = async ({ username, password }) => {
    const sucsess = handleInputErrors({
      username,
      password,
    });
    if (!sucsess) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      localStorage.setItem("duser", JSON.stringify(data));

      setAuthUser(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  return { loading, login };
};

export default useLogin;

function handleInputErrors({ timePeriod, username, password }) {
  if (!username || !password) {
    toast.error("Fill all the required feilds");
    return false;
  }

  return true;
}
