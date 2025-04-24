import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, Search, Cloud, User, Plus } from "lucide-react";
const Footernav = () => {
  return (
    <nav className="bg-gray-900 bg-opacity-80 backdrop-blur-md py-3 sticky bottom-0 border-t border-gray-800">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex flex-col items-center text-red-500">
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            to="/search"
            className="flex flex-col items-center text-gray-400 hover:text-white"
          >
            <Search className="w-6 h-6" />
            <span className="text-xs mt-1">Search</span>
          </Link>
          <Link
            to="/createPosts"
            className="flex flex-col items-center text-gray-400 hover:text-white"
          >
            <Plus />
            <span className="text-xs mt-1">Post</span>
          </Link>
          <Link
            to="/topics"
            className="flex flex-col items-center text-gray-400 hover:text-white"
          >
            <Cloud className="w-6 h-6" />
            <span className="text-xs mt-1">Topics</span>
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center text-gray-400 hover:text-white"
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Footernav;
