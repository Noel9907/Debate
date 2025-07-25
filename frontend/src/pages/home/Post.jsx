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
import useLikes from "../../hooks/useLikes.js";

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
  console.log(isLiked);
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem("duser");
      if (!userData) return null;
      const parsed = JSON.parse(userData);
      return parsed?._id || null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  };

  const CurrentUser = getCurrentUser();
  const { handleLike, likeLoading } = useLikes();

  // Share functionality state
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const shareMenuRef = useRef(null);

  // Local state for votes - initialize with props
  // TEMPORARY: If props are undefined, try to sync with backend on first render
  const [upvotes, setUpvotes] = useState(likes_count ?? 0);
  const [downvotes, setDownvotes] = useState(dislikes_count ?? 0);
  const [userVote, setUserVote] = useState(
    isLiked ? "up" : isDisliked ? "down" : null
  );
  const [initialSyncDone, setInitialSyncDone] = useState(false);

  // Effect to update local state when initial props change
  useEffect(() => {
    // If props are defined, use them
    if (likes_count !== undefined && dislikes_count !== undefined) {
      setUpvotes(likes_count);
      setDownvotes(dislikes_count);
      setUserVote(isLiked ? "up" : isDisliked ? "down" : null);
      setInitialSyncDone(true);
    }
    // If props are undefined but we haven't synced yet, we need to fetch current state
    else if (!initialSyncDone && CurrentUser && id) {
      console.log(
        "Props are undefined, this suggests a data fetching issue in parent component"
      );
      // The real fix should be in your parent component that fetches posts
      setInitialSyncDone(true);
    }
  }, [
    likes_count,
    dislikes_count,
    isLiked,
    isDisliked,
    initialSyncDone,
    CurrentUser,
    id,
  ]);

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
    if (num === null || num === undefined || isNaN(num)) return "0";
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
        return "grid-cols-2"; // Two small, one large
      default:
        return "grid-cols-1";
    }
  };

  // Get individual image class based on count and index
  const getImageClass = (imageCount, index) => {
    if (imageCount === 3 && index === 2) {
      return "col-span-2"; // The third image spans two columns
    }
    return "";
  };

  const handleVote = async (e, voteType) => {
    e.preventDefault();
    e.stopPropagation();

    if (!CurrentUser) {
      console.error("You need to be logged in to vote.");
      return;
    }

    if (likeLoading) {
      return; // Prevent multiple requests
    }

    // Store current state for potential rollback
    const currentUpvotes = upvotes;
    const currentDownvotes = downvotes;
    const currentUserVote = userVote;

    console.log("Before vote:", {
      currentUpvotes,
      currentDownvotes,
      currentUserVote,
      voteType,
    });

    // Determine what the new state should be based on current vote and new action
    let newUpvotes = currentUpvotes;
    let newDownvotes = currentDownvotes;
    let newUserVote = currentUserVote;

    if (voteType === "like") {
      if (currentUserVote === "up") {
        // User is removing their upvote
        newUpvotes = Math.max(0, currentUpvotes - 1);
        newUserVote = null;
      } else {
        // User is upvoting (possibly removing downvote)
        if (currentUserVote === "down") {
          newDownvotes = Math.max(0, currentDownvotes - 1);
        }
        newUpvotes = currentUpvotes + 1;
        newUserVote = "up";
      }
    } else {
      // dislike
      if (currentUserVote === "down") {
        // User is removing their downvote
        newDownvotes = Math.max(0, currentDownvotes - 1);
        newUserVote = null;
      } else {
        // User is downvoting (possibly removing upvote)
        if (currentUserVote === "up") {
          newUpvotes = Math.max(0, currentUpvotes - 1);
        }
        newDownvotes = currentDownvotes + 1;
        newUserVote = "down";
      }
    }

    // Apply optimistic update
    setUpvotes(newUpvotes);
    setDownvotes(newDownvotes);
    setUserVote(newUserVote);

    console.log("Optimistic update:", {
      newUpvotes,
      newDownvotes,
      newUserVote,
    });

    try {
      const result = await handleLike({
        postid: id,
        stance: voteType,
      });

      if (
        result &&
        result.likes_count !== undefined &&
        result.dislikes_count !== undefined
      ) {
        // Update state with actual backend response
        console.log("Backend response:", result);
        setUpvotes(result.likes_count);
        setDownvotes(result.dislikes_count);
        setUserVote(result.isLiked ? "up" : result.isDisliked ? "down" : null);
        console.log("Updated to backend state:", {
          upvotes: result.likes_count,
          downvotes: result.dislikes_count,
          userVote: result.isLiked ? "up" : result.isDisliked ? "down" : null,
        });
      } else {
        // API call failed, rollback optimistic update
        console.error("API call failed, rolling back optimistic update");
        setUpvotes(currentUpvotes);
        setDownvotes(currentDownvotes);
        setUserVote(currentUserVote);
      }
    } catch (error) {
      console.error("Error handling vote:", error);
      // Rollback optimistic update on error
      setUpvotes(currentUpvotes);
      setDownvotes(currentDownvotes);
      setUserVote(currentUserVote);
    }
  };

  const handleUpvote = (e) => handleVote(e, "like");
  const handleDownvote = (e) => handleVote(e, "dislike");

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
        // Fallback for older browsers
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
            likes: upvotes, // Use current state instead of initial props
            dislikes: downvotes, // Use current state instead of initial props
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

        {/* Vote breakdown tooltip */}
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
