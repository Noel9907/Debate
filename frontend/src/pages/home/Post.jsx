import { Link } from "react-router-dom";
import {
  Users,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Award,
} from "lucide-react";
import { useState } from "react";

export default function Posts({
  username,
  likes,
  categories,
  createdAt,
  dislikes = 1000,
  id,
  text,
  title,
}) {
  const postid = id;
  const [upvotes, setUpvotes] = useState(likes || 0);
  const [downvotes, setDownvotes] = useState(dislikes);
  const [userVote, setUserVote] = useState(null);

  // Calculate net votes
  const netVotes = upvotes - downvotes;

  // Format large numbers to k, M format
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 10000) {
      return (num / 1000).toFixed(0) + "k";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num;
  };

  const handleUpvote = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (userVote === "up") {
      // Remove upvote
      setUpvotes(upvotes - 1);
      setUserVote(null);
    } else if (userVote === "down") {
      // Change from downvote to upvote
      setDownvotes(downvotes - 1);
      setUpvotes(upvotes + 1);
      setUserVote("up");
    } else {
      // New upvote
      setUpvotes(upvotes + 1);
      setUserVote("up");
    }
  };

  const handleDownvote = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (userVote === "down") {
      // Remove downvote
      setDownvotes(downvotes - 1);
      setUserVote(null);
    } else if (userVote === "up") {
      // Change from upvote to downvote
      setUpvotes(upvotes - 1);
      setDownvotes(downvotes + 1);
      setUserVote("down");
    } else {
      // New downvote
      setDownvotes(downvotes + 1);
      setUserVote("down");
    }
  };

  // Format date if available
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : "";

  // Calculate reading time (assuming average reading speed of 200 words per minute)
  const readingTime = text
    ? Math.max(1, Math.ceil(text.split(" ").length / 200))
    : 1;

  const debate = {
    participants: 25,
    comments: 10,
  };

  return (
    <div className="p-2 sm:p-3 transform hover:scale-100 sm:hover:scale-102 transition-transform duration-200">
      <div className="block bg-gray-800 bg-opacity-50 rounded-lg p-3 sm:p-6 hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-gray-500">
        <Link
          to={`/test/${postid}`}
          state={{
            id,
            username,
            likes: upvotes,
            dislikes: downvotes,
            categories,
            text,
            title,
          }}
          className="block"
        >
          <div className="flex items-center space-x-2 sm:space-x-4 mb-2 sm:mb-4">
            <div className="relative flex-shrink-0">
              <img
                src={`https://avatar.iran.liara.run/public/boy?username=${username}`}
                alt={username}
                width={32}
                height={32}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-0.5"
              />
              {netVotes > 50 && (
                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                {title}
              </h3>
              <div className="flex flex-wrap text-xs sm:text-sm text-gray-400">
                <span className="mr-2 truncate">
                  by <span className="text-blue-400">{username}</span>
                </span>
                {formattedDate && (
                  <span className="mr-2 truncate">• {formattedDate}</span>
                )}
                {readingTime && (
                  <span className="mr-2 truncate">
                    • {readingTime} min read
                  </span>
                )}
                {categories?.length > 0 && (
                  <span className="truncate">
                    •
                    <span className="text-purple-400">
                      {" "}
                      {categories.join(", ")}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-gray-300 line-clamp-2 sm:line-clamp-3">
            {text}
          </p>
        </Link>

        {/* Stats Bar - Now using grid for better responsiveness */}
        <div className="grid grid-cols-3 gap-1 text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
          <span className="flex items-center justify-start">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-400" />
            <span className="truncate">
              {formatNumber(debate.participants)}
            </span>
            <span className="hidden sm:inline ml-1">participants</span>
          </span>
          <span className="flex items-center justify-center">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-400" />
            <span className="truncate">{formatNumber(netVotes)}</span>
            <span className="hidden sm:inline ml-1">net points</span>
          </span>
          <span className="flex items-center justify-end">
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-purple-400" />
            <span className="truncate">{formatNumber(debate.comments)}</span>
            <span className="hidden sm:inline ml-1">comments</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap justify-between gap-1 sm:gap-2">
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={handleUpvote}
              className={`flex items-center px-0 py-1 rounded-md hover:bg-gray-700 transition-colors ${
                userVote === "up"
                  ? "text-green-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ThumbsUp
                className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${
                  userVote === "up" ? "fill-current" : ""
                }`}
              />
              <span className="text-xs sm:text-sm">Upvote</span>
              <span className="ml-1 text-xs bg-gray-700 px-1 py-0.5 rounded-full">
                {formatNumber(upvotes)}
              </span>
            </button>
            <button
              onClick={handleDownvote}
              className={`flex items-center px-2 py-1 rounded-md hover:bg-gray-700 transition-colors ${
                userVote === "down"
                  ? "text-red-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ThumbsDown
                className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${
                  userVote === "down" ? "fill-current" : ""
                }`}
              />
              <span className="text-xs sm:text-sm">Downvote</span>
              <span className="ml-1 text-xs bg-gray-700 px-1 py-0.5 rounded-full">
                {formatNumber(downvotes)}
              </span>
            </button>
          </div>

          <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-0">
            <button className="flex items-center text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-gray-700">
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Comment</span>
            </button>
            <button className="flex items-center text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-gray-700">
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Share</span>
            </button>
          </div>
        </div>

        {/* Vote breakdown tooltip - shows on hover */}
        {(upvotes > 0 || downvotes > 0) && (
          <div className="mt-3 text-xs text-gray-500">
            {formatNumber(upvotes)} upvotes • {formatNumber(downvotes)}{" "}
            downvotes •{" "}
            {Math.round((upvotes / (upvotes + downvotes || 1)) * 100)}% positive
          </div>
        )}
      </div>
    </div>
  );
}
