import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCreatePost from "../../hooks/useCreatePost.js";
import Footernav from "../../../components/Footernav.jsx";

export default function CreatePost() {
  const name = JSON.parse(localStorage.getItem("duser")).username;
  const id = JSON.parse(localStorage.getItem("duser"))._id;

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: name,
    text: "",
    author_id: id,
    categories: "",
    title: "",
    isPublic: true,
    image: null,
    video: null,
  });

  const { createPost, Loading } = useCreatePost();
  const [charCount, setCharCount] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "text") {
      setCharCount(value.length);
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createPost(formData);
    if (!Loading) {
      navigate("/");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Create a New Debate
                  </h1>
                  <p className="text-gray-400 mt-1">
                    Share your perspective and invite others to discuss
                  </p>
                </div>
                <div className="px-3 py-1 bg-gray-700 text-gray-300 border border-gray-600 rounded-full text-sm">
                  Posting as {name}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-300"
                >
                  Debate Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a compelling title for your debate"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="text"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Debate Text <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-400">
                    {charCount} characters
                  </span>
                </div>
                <textarea
                  id="text"
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  placeholder="Present your argument clearly and provide supporting evidence..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  rows={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="categories"
                  className="block text-sm font-medium text-gray-300"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="categories"
                  name="categories"
                  value={formData.categories}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="politics">Politics</option>
                  <option value="technology">Technology</option>
                  <option value="science">Science</option>
                  <option value="philosophy">Philosophy</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Upload Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      image: e.target.files[0],
                    }))
                  }
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
      file:rounded-md file:border-0
      file:text-sm file:font-semibold
      file:bg-red-500 file:text-white
      hover:file:bg-red-600"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Upload Video (optional)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      video: e.target.files[0],
                    }))
                  }
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
      file:rounded-md file:border-0
      file:text-sm file:font-semibold
      file:bg-red-500 file:text-white
      hover:file:bg-red-600"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50"
                  disabled={Loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={Loading}
                >
                  {Loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Post...
                    </>
                  ) : (
                    "Create Debate"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footernav color={"post"} />
    </>
  );
}
