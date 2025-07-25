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
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import useLikes from "../../../hooks/useLikes";
import { useGetPost } from "../../../hooks/useGetPosts";

export default function Posts({
  username,
  likes_count,
  dislikes_count,
  comments_count,
  categories,
  createdAt,
  id,
  text,
  title,
  imageUrl,
  videoUrl,
  isLiked,
  isDisliked,
}) {
  // Safe user data retrieval with error handling
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem("duser");
      if (!userData) return null;
      const parsed = JSON.parse(userData);
      return parsed?._id || null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const CurrentUser = getCurrentUser();
  const { handleLike, likeLoading } = useLikes();
  const { getPost, PostLoading, post } = useGetPost();

  // Share functionality state
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const shareMenuRef = useRef(null);

  // Local state for votes - initialize with props
  const [upvotes, setUpvotes] = useState(likes_count || 0);
  const [downvotes, setDownvotes] = useState(dislikes_count || 0);
  const [userVote, setUserVote] = useState(
    isLiked ? "up" : isDisliked ? "down" : null
  );

  // Update local state when props change (important for when parent updates)
  useEffect(() => {
    setUpvotes(likes_count || 0);
    setDownvotes(dislikes_count || 0);
    setUserVote(isLiked ? "up" : isDisliked ? "down" : null);
  }, [likes_count, dislikes_count, isLiked, isDisliked]);

  // Process images - handle string, array, or null/undefined
  const processImages = (imageData) => {
    if (!imageData) return [];
    try {
      if (typeof imageData === "string") {
        const urls = imageData
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url && url.length > 0);
        return urls;
      }
      if (Array.isArray(imageData)) {
        return imageData.filter(
          (url) => url && typeof url === "string" && url.trim().length > 0
        );
      }
    } catch (error) {
      console.error("Error processing images:", error);
    }
    return [];
  };

  const images = processImages(imageUrl).slice(0, 3);

  // Calculate net votes safely
  const netVotes = upvotes - downvotes;

  // Format large numbers to k, M format
  const formatNumber = (num) => {
    if (!num || isNaN(num)) return "0";
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 10000) {
      return (num / 1000).toFixed(0) + "k";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num.toString();
  };

  // Get grid layout class based on number of images
  const getImageGridClass = (imageCount) => {
    switch (imageCount) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2";
      default:
        return "grid-cols-1";
    }
  };

  // Get individual image class based on count and index
  const getImageClass = (imageCount, index) => {
    if (imageCount === 3 && index === 2) {
      return "col-span-2";
    }
    return "";
  };

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!CurrentUser) {
      alert("You need to be logged in to vote");
      return;
    }

    if (likeLoading) {
      return;
    }

    // Store original values for rollback
    const originalUpvotes = upvotes;
    const originalDownvotes = downvotes;
    const originalUserVote = userVote;

    try {
      // Optimistic update first
      if (userVote === "up") {
        // User is removing their upvote
        setUserVote(null);
        setUpvotes((prev) => Math.max(0, prev - 1));
      } else {
        // User is adding upvote (and possibly removing downvote)
        if (userVote === "down") {
          setDownvotes((prev) => Math.max(0, prev - 1));
        }
        setUserVote("up");
        setUpvotes((prev) => prev + 1);
      }

      // Call API
      const result = await handleLike({
        postid: id,
        user: CurrentUser,
        stance: "like",
      });

      // If API call was successful, update with server response
      if (
        result &&
        result.likes_count !== undefined &&
        result.dislikes_count !== undefined
      ) {
        setUpvotes(result.likes_count);
        setDownvotes(result.dislikes_count);
        setUserVote(result.isLiked ? "up" : result.isDisliked ? "down" : null);
      } else {
        // If API call failed, rollback the optimistic update
        setUpvotes(originalUpvotes);
        setDownvotes(originalDownvotes);
        setUserVote(originalUserVote);
      }
    } catch (error) {
      console.error("Error handling upvote:", error);
      // Rollback optimistic update
      setUpvotes(originalUpvotes);
      setDownvotes(originalDownvotes);
      setUserVote(originalUserVote);
    }
  };

  const handleDownvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!CurrentUser) {
      alert("You need to be logged in to vote");
      return;
    }

    if (likeLoading) {
      return;
    }

    // Store original values for rollback
    const originalUpvotes = upvotes;
    const originalDownvotes = downvotes;
    const originalUserVote = userVote;

    try {
      // Optimistic update first
      if (userVote === "down") {
        // User is removing their downvote
        setUserVote(null);
        setDownvotes((prev) => Math.max(0, prev - 1));
      } else {
        // User is adding downvote (and possibly removing upvote)
        if (userVote === "up") {
          setUpvotes((prev) => Math.max(0, prev - 1));
        }
        setUserVote("down");
        setDownvotes((prev) => prev + 1);
      }

      // Call API
      const result = await handleLike({
        postid: id,
        user: CurrentUser,
        stance: "dislike",
      });

      // If API call was successful, update with server response
      if (
        result &&
        result.likes_count !== undefined &&
        result.dislikes_count !== undefined
      ) {
        setUpvotes(result.likes_count);
        setDownvotes(result.dislikes_count);
        setUserVote(result.isLiked ? "up" : result.isDisliked ? "down" : null);
      } else {
        // If API call failed, rollback the optimistic update
        setUpvotes(originalUpvotes);
        setDownvotes(originalDownvotes);
        setUserVote(originalUserVote);
      }
    } catch (error) {
      console.error("Error handling downvote:", error);
      // Rollback optimistic update
      setUpvotes(originalUpvotes);
      setDownvotes(originalDownvotes);
      setUserVote(originalUserVote);
    }
  };

  // Format date safely
  const formattedDate = createdAt
    ? (() => {
        try {
          return new Date(createdAt).toLocaleDateString();
        } catch (error) {
          console.error("Error formatting date:", error);
          return "";
        }
      })()
    : "";

  // Calculate reading time safely
  const readingTime =
    text && typeof text === "string"
      ? Math.max(1, Math.ceil(text.split(" ").length / 200))
      : 1;

  // Share menu handlers
  const handleShareButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
    setCopySuccess(false);
  };

  const shareUrl = `${window.location.origin}/test/${id}`;

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (fallbackErr) {
          console.error("Fallback copy failed:", fallbackErr);
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Could not copy text: ", err);
    }
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

  // Early return if essential props are missing
  if (!id) {
    return (
      <div className="p-2 sm:p-3">
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-3 sm:p-6 border border-gray-700">
          <p className="text-gray-400">Error: Post ID is required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-3 transform hover:scale-100 sm:hover:scale-102 transition-transform duration-200">
      <div className="block bg-gray-800 bg-opacity-50 rounded-lg p-3 sm:p-6 hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-gray-500 relative">
        <Link
          to={`/posts/${id}`}
          state={{
            id,
            username,
            likes: likes_count,
            dislikes: dislikes_count,
            categories,
            text,
            title,
            images: images,
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
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=40&width=40";
                }}
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
                {categories && categories.length > 0 && (
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

          {/* Image Grid */}
          {images.length > 0 && (
            <div
              className={`grid gap-2 mb-3 sm:mb-4 ${getImageGridClass(
                images.length
              )}`}
            >
              {images.map((imageurl, index) => (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-lg bg-gray-700 ${getImageClass(
                    images.length,
                    index
                  )}`}
                >
                  <img
                    src={imageurl || "/placeholder.svg"}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-48 sm:h-56 object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {videoUrl && (
            <div className="mb-4 rounded-lg overflow-hidden bg-black">
              <video
                controls
                className="w-full h-64 object-cover"
                src={videoUrl}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}
        </Link>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-1 text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
          <span className="flex items-center justify-start">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-400" />
            <span className="truncate">
              {formatNumber((comments_count || 0) + upvotes + downvotes)}
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
            <span className="truncate">
              {formatNumber(comments_count || 0)}
            </span>
            <span className="hidden sm:inline ml-1">comments</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap justify-between gap-1 sm:gap-2">
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={handleUpvote}
              disabled={likeLoading}
              className={`flex items-center px-2 py-1 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 ${
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
              disabled={likeLoading}
              className={`flex items-center px-2 py-1 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 ${
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
