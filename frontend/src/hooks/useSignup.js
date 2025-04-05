import { useState } from "react";
import { toast } from "react-toastify";
import { useAuthContext } from "../context/AuthContext";
const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const signup = async ({ username, password, confirmpassword, gender }) => {
    const sucsess = handleInputErrors({
      username,
      password,
      confirmpassword,
      gender,
    });
    if (!sucsess) return;

    setLoading(true);
    try {
      console.log("Signing up with:", {
        username,
        password,
        confirmpassword,
        gender,
      });
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        {
          // mode: "no-cors",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            password,
            confirmpassword,
            gender,
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
  return { loading, signup };
};

export default useSignup;

function handleInputErrors({
  timePeriod,
  username,
  password,
  confirmpassword,
  gender,
}) {
  if (!username || !password || !confirmpassword || !gender) {
    toast.error("Fill all the required feilds");
    return false;
  }

  if (password !== confirmpassword) {
    toast.error("password and confirm passwords should match");
    return false;
  }
  if (password.length < 6) {
    toast.error("the minimum password length is 6 characters");
    return false;
  }

  return true;
}
