import { useState } from "react";
import { User, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import useLogin from "../../hooks/useLogin.js";
import GoogleSignInButton from "../../../components/GoogleSignInButton.jsx";

export default function Login() {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });
  const { loading, login } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(inputs);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-semibold text-center text-gray-900 mb-6">
            Sign In
          </h2>

          {/* Google Sign In Button */}
          <div className="mb-6">
            <GoogleSignInButton text="signin_with" disabled={loading} />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with username
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div className="space-y-1">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={inputs.username}
                  onChange={(e) =>
                    setInputs({ ...inputs, username: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors text-gray-900"
                  placeholder="Username"
                  required
                  disabled={loading}
                />
                <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={inputs.password}
                  onChange={(e) =>
                    setInputs({ ...inputs, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors text-gray-900"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="px-8 py-4 bg-gray-100 border-t border-gray-200">
          <p className="text-sm text-center text-gray-600">
            Don&apos;t have an account?
            <Link
              to="/signup"
              className="font-medium text-red-600 hover:text-red-500 transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
