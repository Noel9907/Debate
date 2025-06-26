import { Link } from "react-router-dom";
import {
  Users,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Award,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import useLikes from "../../hooks/useLikes";
import { useGetPost } from "../../hooks/useGetPosts";
import { set } from "mongoose";
export default function Posts({
  username,
  likes,
  likesUsername,
  dislikesUsername,
  categories,
  createdAt,
  dislikes,
  id,
  comments,
  text,
  title,
}) {
  const postid = id;

  const CurrentUser = JSON.parse(localStorage.getItem("duser"))._id;
  const { handleLike, likeLoading } = useLikes();
  const { getPost, PostLoading, post } = useGetPost();
  const [upvotes, setUpvotes] = useState(likes || 0);
  const [downvotes, setDownvotes] = useState(dislikes || 0);
  const [userVote, setUserVote] = useState(null);
  // Share functionality state

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const shareMenuRef = useRef(null);
  // Calculate net votes
  const netVotes = upvotes - downvotes;
  useEffect(() => {
    if (Array.isArray(likesUsername) && likesUsername.includes(CurrentUser)) {
      setUserVote("up");
    } else if (
      Array.isArray(dislikesUsername) &&
      dislikesUsername.includes(CurrentUser)
    ) {
      setUserVote("down");
    }
  }, [likesUsername, dislikesUsername, CurrentUser]);
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

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!CurrentUser) {
      alert("You need to be logged in to vote");
      return;
    }

    // Don't allow actions while already loading
    if (likeLoading) {
      return;
    }

    try {
      // Call API first without optimistic updates
      await handleLike({
        postid: postid,
        user: CurrentUser,
        stance: "like",
      });
      if (userVote == "up") {
        setUserVote(null);
        setUpvotes(likes ? likes - 1 : 0);
      } else {
        setUserVote("up");

        setUpvotes(likesUsername.includes(CurrentUser) ? likes : likes + 1);
      }

      // // After successful API call, fetch the updated post
      getPost(postid);
    } catch (error) {
      console.error("Error handling upvote:", error);
    }
  };

  const handleDownvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!CurrentUser) {
      alert("You need to be logged in to vote");
      return;
    }

    // Don't allow actions while already loading
    if (likeLoading) {
      return;
    }

    try {
      // Call API first without optimistic updates
      await handleLike({
        postid: postid,
        user: CurrentUser,
        stance: "dislike",
      });

      if (userVote == "down") {
        setUserVote(null);
        setDownvotes(dislikes ? dislikes - 1 : 0);
      } else {
        setUserVote("down");

        setDownvotes(
          dislikesUsername.includes(CurrentUser) ? dislikes : dislikes + 1
        );
      }

      // After successful API call, fetch the updated post
      getPost(postid);
    } catch (error) {
      console.error("Error handling downvote:", error);
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

  // Share menu handlers
  const handleShareButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
    setCopySuccess(false);
  };

  const shareUrl = window.location.origin + `/test/${postid}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  const shareToSocialMedia = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(`Check out this debate: ${title}`);
    let shareLink = "";

    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        return;
    }
    window.open(shareLink, "_blank", "width=600,height=400");
    setShowShareMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target)
      ) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showShareMenu]);

  return (
    <div className="p-2 sm:p-3 transform hover:scale-100 sm:hover:scale-102 transition-transform duration-200">
      <div className="block bg-gray-800 bg-opacity-50 rounded-lg p-3 sm:p-6 hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-gray-500 relative">
        <Link
          to={`/posts/${postid}`}
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

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-1 text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
          <span className="flex items-center justify-start">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-400" />
            <span className="truncate">
              {formatNumber(comments + likes + dislikes)}
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
            <span className="truncate">{formatNumber(comments)}</span>
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

          <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-0 relative">
            <button
              onClick={handleShareButtonClick}
              className="flex items-center text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-gray-700"
            >
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Share</span>
            </button>
            {/* Share Menu Dropdown */}
            {showShareMenu && (
              <div
                ref={shareMenuRef}
                className="absolute top-full right-0 mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-50 py-1 border border-gray-700"
              >
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                >
                  <Copy className="w-4 h-4 mr-3" />
                  {copySuccess ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={() => shareToSocialMedia("twitter")}
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                >
                  <Twitter className="w-4 h-4 mr-3" />
                  Twitter
                </button>
                <button
                  onClick={() => shareToSocialMedia("facebook")}
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                >
                  <Facebook className="w-4 h-4 mr-3" />
                  Facebook
                </button>
                <button
                  onClick={() => shareToSocialMedia("linkedin")}
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                >
                  <Linkedin className="w-4 h-4 mr-3" />
                  LinkedIn
                </button>
              </div>
            )}
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
