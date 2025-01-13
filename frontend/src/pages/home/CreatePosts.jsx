import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCreatePost from "../../hooks/useCreatePost.js";

export default function CreatePost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    text: "",
    catogories: "",
    title: "",
    isPublic: true,
  });
  const { createPost, Loading } = useCreatePost();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <Link
        to={"/"}
        className="inline-block mb-4 text-white hover:text-red-400 transition-colors"
      >
        &larr; Back
      </Link>
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Create a New Debate</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white rounded p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="title" className="block mb-1">
              Debate Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white rounded p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="text" className="block mb-1">
              Debate Text
            </label>
            <textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white rounded p-2"
              rows={5}
              required
            />
          </div>
          <div>
            <label htmlFor="category" className="block mb-1">
              Category
            </label>
            <select
              id="catogories"
              name="catogories"
              value={formData.catogories}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white rounded p-2"
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
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleCheckboxChange}
              className="hidden"
            />
            <label
              htmlFor="isPublic"
              className="relative inline-block w-12 h-6 cursor-pointer"
            >
              <span
                className={`absolute block w-6 h-6  rounded-full transition-all ${
                  formData.isPublic ? "translate-x-6 bg-white" : "bg-gray-300"
                }`}
              ></span>
              <span className="absolute left-0 right-0 top-0 bottom-0 bg-transparent rounded-full border-2 border-gray-500"></span>
            </label>
            <span className="text-gray-400">Make debate public</span>
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            {Loading ? "Creating Post..." : "Create Debate"}{" "}
          </button>
        </form>
      </div>
    </div>
  );
}
