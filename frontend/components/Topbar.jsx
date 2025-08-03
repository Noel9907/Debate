"use client";

import { useState } from "react";
import { Bell, MessageCircle, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Topbar = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  let username = "user";
  try {
    const user = JSON.parse(localStorage.getItem("duser"));
    if (user?.username) {
      username = user.username;
    }
  } catch (err) {
    console.warn("Failed to parse duser from localStorage");
  }

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/user/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        console.log("Logging out...");
        localStorage.removeItem("duser");
        window.location.href = "#/login";
      } else {
        const data = await res.json();
        alert(data?.error || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Something went wrong during logout");
    }
  };

  return (
    <>
      <header className="bg-gray-900 bg-opacity-80 backdrop-blur-md py-4 px-4 sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-500">SpeakUp</h1>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-300 hover:text-white transition rounded-md hover:bg-gray-800">
              <Bell size={20} />
            </button>
            <button className="p-2 text-gray-300 hover:text-white transition rounded-md hover:bg-gray-800">
              <Link to={"/createPosts"}>
                <MessageCircle size={20} />
              </Link>
            </button>
            <button className="p-2 text-gray-300 hover:text-white transition rounded-md hover:bg-gray-800">
              <Link to={"/createPosts"}>
                <Plus size={20} />
              </Link>
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center space-y-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800">
              Wrapping up the debate,{" "}
              <span className="text-red-600">{username}</span>?
            </h2>
            <p className="text-base text-gray-600">
              You're about to log out of SpeakUp. If you leave now, your voice
              goes quiet — and great debates might miss your perspective!
            </p>
            <p className="text-base text-gray-600">
              Are you sure you want to step away?
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md text-sm font-medium"
              >
                Yes, Log me out
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md text-sm font-medium"
              >
                Stay and Speak
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;
