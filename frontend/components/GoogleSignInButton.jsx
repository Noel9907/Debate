import { useEffect, useRef } from "react";
import useGoogleAuth from "../src/hooks/useGoogleAuth.js";

const GoogleSignInButton = ({
  text = "signin_with", // Can be "signin_with" or "signup_with"
  disabled = false,
}) => {
  const googleButtonRef = useRef(null);
  const { loading, googleAuth } = useGoogleAuth();

  useEffect(() => {
    // Load Google Sign-In script
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: text,
          shape: "rectangular",
        });
      }
    };

    const handleGoogleResponse = (response) => {
      googleAuth(response.credential);
    };

    if (!disabled) {
      loadGoogleScript();
    }

    // Cleanup function
    return () => {
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";
      }
    };
  }, [disabled, text, googleAuth]);

  if (disabled || loading) {
    return (
      <div className="w-full p-3 border border-gray-300 rounded-md text-center text-gray-400 bg-gray-50">
        {loading ? "Authenticating with Google..." : "Google Sign-In"}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={googleButtonRef} className="w-full"></div>
    </div>
  );
};

export default GoogleSignInButton;
