import { useState } from "react";
import { User, Lock } from "lucide-react";
import useSignup from "../../hooks/useSignup";
import { Link } from "react-router-dom";
import GoogleSignInButton from "../../../components/GoogleSignInButton.jsx";

export default function SignUp() {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
    confirmpassword: "",
    gender: "",
  });

  const { loading, signup } = useSignup();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInputs = {
      username: inputs.username.trim(),
      password: inputs.password.trim(),
      confirmpassword: inputs.confirmpassword.trim(),
      gender: inputs.gender.trim(),
    };
    await signup(trimmedInputs);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-semibold text-center text-gray-900 mb-6">
            Create an Account
          </h2>

          {/* Google Sign Up Button */}
          <div className="mb-6">
            <GoogleSignInButton text="signup_with" disabled={loading} />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="name"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  value={inputs.username}
                  onChange={(e) =>
                    setInputs({ ...inputs, username: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors text-gray-900"
                  placeholder="Name"
                  required
                  disabled={loading}
                />
                <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="password"
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

            {/* Confirm Password Input */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  value={inputs.confirmpassword}
                  onChange={(e) =>
                    setInputs({ ...inputs, confirmpassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors text-gray-900"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Gender Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={inputs.gender === "male"}
                    onChange={(e) =>
                      setInputs({ ...inputs, gender: e.target.value })
                    }
                    className="mr-2"
                    disabled={loading}
                  />
                  Male
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={inputs.gender === "female"}
                    onChange={(e) =>
                      setInputs({ ...inputs, gender: e.target.value })
                    }
                    className="mr-2"
                    disabled={loading}
                  />
                  Female
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        </div>

        <div className="px-8 py-4 bg-gray-100 border-t border-gray-200">
          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-red-600 hover:text-red-500 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
