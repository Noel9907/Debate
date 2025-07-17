import React from "react";
import { Link } from "react-router-dom";
import {
  HomeIcon,
  TrendingUpDown,
  Cloud,
  User,
  Plus,
  Container,
} from "lucide-react";
const Footernav = ({ color }) => {
  const currentpage = color == "home";
  return (
    <footer className="sticky bottom-0 z-50 bg-gray-900">
      <nav className="bg-gray-900 bg-opacity-80 backdrop-blur-md py-3 sticky bottom-0 border-t border-gray-800">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link
              to="/"
              className={`flex flex-col items-center ${
                color == "home"
                  ? "text-red-500"
                  : " text-gray-400 hover:text-white"
              }`}
            >
              <HomeIcon className="w-6 h-6" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link
              to="/search"
              className={`flex flex-col items-center ${
                color == "search"
                  ? "text-red-500"
                  : " text-gray-400 hover:text-white"
              }`}
            >
              <TrendingUpDown className="w-6 h-6" />
              <span className="text-xs mt-1">Connect</span>
            </Link>
            <Link
              to="/createPosts"
              className={`flex flex-col items-center ${
                color == "post"
                  ? "text-red-500"
                  : " text-gray-400 hover:text-white"
              }`}
            >
              <Plus />
              <span className="text-xs mt-1">Post</span>
            </Link>
            {/* <Link
              to="/topics"
              className="flex flex-col items-center text-gray-400 hover:text-white"
            >
              <Cloud className="w-6 h-6" />
              <span className="text-xs mt-1">Live Debates</span>
            </Link> */}
            <Link
              to="/profile"
              className={`flex flex-col items-center ${
                color == "profile"
                  ? "text-red-500"
                  : " text-gray-400 hover:text-white"
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>
      </nav>
    </footer>
  );
};

export default Footernav;
