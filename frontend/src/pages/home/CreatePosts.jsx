"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, Globe, ImageIcon, Video, FileText } from "lucide-react";
import useCreatePost from "../../hooks/useCreatePost.js";

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
  const [mediaFiles, setMediaFiles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "text") {
      setCharCount(value.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Handle multiple files - for now just use the first image/video
    const firstImage = mediaFiles.find((file) =>
      file.type.startsWith("image/")
    );
    const firstVideo = mediaFiles.find((file) =>
      file.type.startsWith("video/")
    );

    const submitData = {
      ...formData,
      image: firstImage?.file || null,
      video: firstVideo?.file || null,
    };

    try {
      const result = await createPost(submitData);
      // Only redirect if the post was created successfully
      if (result && !Loading) {
        navigate("/");
      }
    } catch (error) {
      // Handle error - stay on the page
      console.error("Failed to create post:", error);
    }
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const newMediaFiles = files.map((file) => ({
      file,
      type: file.type,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setMediaFiles((prev) => [...prev, ...newMediaFiles]);
  };

  const removeMedia = (id) => {
    setMediaFiles((prev) => prev.filter((media) => media.id !== id));
  };

  const canPost =
    formData.text.trim().length > 0 &&
    formData.title.trim().length > 0 &&
    formData.categories;

  const categories = [
    { value: "politics", label: "Politics", icon: "🏛️" },
    { value: "technology", label: "Technology", icon: "💻" },
    { value: "science", label: "Science", icon: "🔬" },
    { value: "philosophy", label: "Philosophy", icon: "🤔" },
    { value: "other", label: "Other", icon: "💭" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          disabled={Loading}
        >
          <X className="w-5 h-5" />
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canPost || Loading}
          className="px-6 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white rounded-full font-medium transition-colors"
        >
          {Loading ? "Posting..." : "Post"}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-4 max-w-2xl mx-auto pb-24 sm:px-6"
      >
        {/* Title and Text Area with Avatar */}
        <div className="flex gap-3 items-start mb-6">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-medium">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Writing Area */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Debate title..."
              className="w-full bg-transparent text-xl font-medium placeholder-gray-500 border-none outline-none mb-3 text-white leading-tight"
              required
            />

            {/* Main Text */}
            <textarea
              name="text"
              value={formData.text}
              onChange={handleInputChange}
              placeholder="What's your take on this debate?"
              className="w-full bg-transparent text-lg placeholder-gray-500 border-none outline-none resize-none min-h-[200px] md:min-h-[300px] text-white leading-relaxed"
              required
            />
          </div>
        </div>

        {/* Category Selection - Full Width, Centered */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-3 text-center">
            Choose a category:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    categories: category.value,
                  }))
                }
                className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${
                  formData.categories === category.value
                    ? "bg-red-500 border-red-500 text-white"
                    : "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                }`}
              >
                <span>{category.icon}</span>
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Media Upload Section - Full Width, Centered */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <ImageIcon className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-400">Add media to your debate</p>
          </div>

          {/* Upload Area */}
          <div className="relative mb-4">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="media-upload"
            />
            <label
              htmlFor="media-upload"
              className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-600 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-300">
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {mediaFiles.length > 0
                    ? "Add more files"
                    : "Click to add photos or videos"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supports multiple files
              </p>
            </label>
          </div>

          {/* Multiple Media Preview */}
          {mediaFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {mediaFiles.length} file{mediaFiles.length !== 1 ? "s" : ""}{" "}
                  selected
                </span>
              </div>

              {mediaFiles.map((media) => (
                <div key={media.id} className="relative">
                  <button
                    type="button"
                    onClick={() => removeMedia(media.id)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/80 hover:bg-black rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {media.type.startsWith("image/") && (
                    <div className="relative">
                      <div className="absolute top-2 left-2 bg-black/80 rounded-full p-1">
                        <ImageIcon className="w-3 h-3 text-white" />
                      </div>
                      <img
                        src={media.url || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full max-h-80 object-cover rounded-xl border border-gray-700"
                      />
                    </div>
                  )}

                  {media.type.startsWith("video/") && (
                    <div className="relative">
                      <div className="absolute top-2 left-2 bg-black/80 rounded-full p-1">
                        <Video className="w-3 h-3 text-white" />
                      </div>
                      <video
                        controls
                        className="w-full max-h-80 rounded-xl border border-gray-700"
                        src={media.url}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </form>

      {/* Bottom Toolbar - Simplified */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 border-t border-gray-800 bg-gradient-to-br from-gray-900 to-black">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            {charCount > 0 && (
              <span className="text-sm text-gray-400">
                {charCount} characters
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
