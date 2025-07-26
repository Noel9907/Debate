"use client";

import { Link } from "react-router-dom";
import {
  Users,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback, memo } from "react";
import useLikes from "../../hooks/useLikes.js";

// Constants
const MAX_IMAGES_DISPLAY = 3;
const SHARE_POPUP_DIMENSIONS = "width=600,height=400";

// Utility functions
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

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

const processImages = (imageData) => {
  if (!imageData) return [];

  try {
    if (typeof imageData === "string") {
      return imageData
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url && url.length > 0)
        .slice(0, MAX_IMAGES_DISPLAY);
    }

    if (Array.isArray(imageData)) {
      return imageData
        .filter(
          (url) => url && typeof url === "string" && url.trim().length > 0
        )
        .slice(0, MAX_IMAGES_DISPLAY);
    }
  } catch (error) {
    console.error("Error processing images:", error);
  }

  return [];
};

// Custom hooks
const useShareMenu = () => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const shareMenuRef = useRef(null);

  const handleShareButtonClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowShareMenu(!showShareMenu);
      setCopySuccess(false);
    },
    [showShareMenu]
  );

  const copyToClipboard = useCallback(async (url) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (fallbackErr) {
          console.error("Fallback copy failed:", fallbackErr);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error("Could not copy text: ", err);
    }
  }, []);

  const shareToSocialMedia = useCallback((platform, url, title) => {
    const encodedUrl = encodeURIComponent(url);
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

    window.open(shareLink, "_blank", SHARE_POPUP_DIMENSIONS);
    setShowShareMenu(false);
  }, []);

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

  return {
    showShareMenu,
    copySuccess,
    shareMenuRef,
    handleShareButtonClick,
    copyToClipboard,
    shareToSocialMedia,
  };
};

const useVoting = (
  initialLikes,
  initialDislikes,
  initialIsLiked,
  initialIsDisliked,
  postId,
  currentUser
) => {
  const [upvotes, setUpvotes] = useState(initialLikes ?? 0);
  const [downvotes, setDownvotes] = useState(initialDislikes ?? 0);
  const [userVote, setUserVote] = useState(
    initialIsLiked ? "up" : initialIsDisliked ? "down" : null
  );
  const [renderKey, setRenderKey] = useState(0);
  const { handleLike, likeLoading } = useLikes();

  const updateVoteState = useCallback(
    (newUpvotes, newDownvotes, newUserVote) => {
      setUpvotes(newUpvotes);
      setDownvotes(newDownvotes);
      setUserVote(newUserVote);
      setRenderKey((prev) => prev + 1);
    },
    []
  );

  const handleVote = useCallback(
    async (e, voteType) => {
      e.preventDefault();
      e.stopPropagation();

      if (!currentUser) {
        console.error("You need to be logged in to vote.");
        return;
      }

      if (likeLoading) {
        return;
      }

      // Store current state for potential rollback
      const currentUpvotes = upvotes;
      const currentDownvotes = downvotes;
      const currentUserVote = userVote;

      // Calculate new state for optimistic update
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
      updateVoteState(newUpvotes, newDownvotes, newUserVote);

      try {
        const result = await handleLike({
          postid: postId,
          stance: voteType,
        });

        if (
          result &&
          result.likes_count !== null &&
          result.dislikes_count !== null
        ) {
          // Set user vote based on backend response
          let finalUserVote = null;
          if (result.isLiked === true) {
            finalUserVote = "up";
          } else if (result.isDisliked === true) {
            finalUserVote = "down";
          }

          updateVoteState(
            result.likes_count,
            result.dislikes_count,
            finalUserVote
          );
        } else {
          console.error(
            "Invalid backend response, rolling back optimistic update"
          );
          // Rollback optimistic update
          updateVoteState(currentUpvotes, currentDownvotes, currentUserVote);
        }
      } catch (error) {
        console.error("Error handling vote:", error);
        // Rollback optimistic update on error
        updateVoteState(currentUpvotes, currentDownvotes, currentUserVote);
      }
    },
    [
      upvotes,
      downvotes,
      userVote,
      currentUser,
      likeLoading,
      postId,
      handleLike,
      updateVoteState,
    ]
  );

  // Sync with props changes
  useEffect(() => {
    if (initialLikes !== undefined && initialDislikes !== undefined) {
      setUpvotes(initialLikes);
      setDownvotes(initialDislikes);
      setUserVote(initialIsLiked ? "up" : initialIsDisliked ? "down" : null);
    }
  }, [initialLikes, initialDislikes, initialIsLiked, initialIsDisliked]);

  return {
    upvotes,
    downvotes,
    userVote,
    renderKey,
    handleVote,
    likeLoading,
  };
};

// Memoized components
const UserAvatar = memo(({ username }) => (
  <div className="flex-shrink-0">
    <img
      src={`https://avatar.iran.liara.run/public/boy?username=${username}`}
      alt={username}
      width={32}
      height={32}
      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
      onError={(e) => {
        e.target.src = "/placeholder.svg?height=40&width=40";
      }}
    />
  </div>
));

UserAvatar.displayName = "UserAvatar";

const ImageGrid = memo(({ images }) => {
  if (images.length === 0) return null;

  // Single image takes full width
  if (images.length === 1) {
    return (
      <div className="mb-3 sm:mb-4">
        <div className="relative overflow-hidden rounded-lg bg-gray-700">
          <img
            src={images[0] || "/placeholder.svg"}
            alt="Post image"
            className="w-full h-64 sm:h-80 object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      </div>
    );
  }

  // Multiple images in grid
  return (
    <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
      {images.map((imageurl, index) => (
        <div
          key={`${imageurl}-${index}`}
          className="relative overflow-hidden rounded-lg bg-gray-700"
        >
          <img
            src={imageurl || "/placeholder.svg"}
            alt={`Post image ${index + 1}`}
            className="w-full h-48 sm:h-56 object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      ))}
    </div>
  );
});

ImageGrid.displayName = "ImageGrid";

const VideoPlayer = memo(({ videoUrl }) => (
  <div className="mb-4 rounded-lg overflow-hidden bg-black">
    <video
      controls
      className="w-full h-64 object-cover"
      src={videoUrl}
      preload="metadata"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
  </div>
));

VideoPlayer.displayName = "VideoPlayer";

const StatsBar = memo(({ commentsCount, upvotes, downvotes, netVotes }) => (
  <div className="grid grid-cols-3 gap-1 text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
    <span className="flex items-center justify-start">
      <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-400" />
      <span className="truncate">{formatNumber(upvotes + downvotes)}</span>
      <span className="hidden sm:inline ml-1">votes</span>
    </span>
    <span className="flex items-center justify-center">
      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-400" />
      <span className="truncate">{formatNumber(netVotes)}</span>
      <span className="hidden sm:inline ml-1">net points</span>
    </span>
    <span className="flex items-center justify-end">
      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-purple-400" />
      <span className="truncate">{formatNumber(commentsCount)}</span>
      <span className="hidden sm:inline ml-1">comments</span>
    </span>
  </div>
));

StatsBar.displayName = "StatsBar";

const VoteButton = memo(
  ({ type, count, isActive, onClick, disabled, renderKey }) => {
    const Icon = type === "up" ? ThumbsUp : ThumbsDown;
    const activeColor = type === "up" ? "green" : "red";
    const label = type === "up" ? "Upvote" : "Downvote";

    return (
      <button
        key={`${type}vote-${renderKey}`}
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center px-2 py-1 rounded-md transition-all duration-200 disabled:opacity-50 ${
          isActive
            ? `text-${activeColor}-400 bg-${activeColor}-400/20 border border-${activeColor}-400/30`
            : "text-gray-400 hover:text-white hover:bg-gray-700"
        }`}
        style={{
          color: isActive ? (type === "up" ? "#4ade80" : "#f87171") : "#9ca3af",
          backgroundColor: isActive
            ? type === "up"
              ? "rgba(74, 222, 128, 0.2)"
              : "rgba(248, 113, 113, 0.2)"
            : "transparent",
        }}
      >
        <Icon
          className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 transition-all duration-200 ${
            isActive ? "fill-current" : ""
          }`}
        />
        <span className="text-xs sm:text-sm">{label}</span>
        <span className="ml-1 text-xs bg-gray-700 px-1 py-0.5 rounded-full">
          {formatNumber(count)}
        </span>
      </button>
    );
  }
);

VoteButton.displayName = "VoteButton";

const ShareMenu = memo(
  ({
    showShareMenu,
    shareMenuRef,
    copySuccess,
    onCopyLink,
    onShareToSocial,
  }) => {
    if (!showShareMenu) return null;

    return (
      <div
        ref={shareMenuRef}
        className="absolute top-full right-0 mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-50 py-1 border border-gray-700"
      >
        <button
          onClick={onCopyLink}
          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
        >
          <Copy className="w-4 h-4 mr-3" />
          {copySuccess ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={() => onShareToSocial("twitter")}
          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
        >
          <Twitter className="w-4 h-4 mr-3" />
          Twitter
        </button>
        <button
          onClick={() => onShareToSocial("facebook")}
          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
        >
          <Facebook className="w-4 h-4 mr-3" />
          Facebook
        </button>
        <button
          onClick={() => onShareToSocial("linkedin")}
          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
        >
          <Linkedin className="w-4 h-4 mr-3" />
          LinkedIn
        </button>
      </div>
    );
  }
);

ShareMenu.displayName = "ShareMenu";

// Main component
const Posts = memo(
  ({
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
  }) => {
    // Custom hooks
    const currentUser = getCurrentUser();
    const images = processImages(imageUrl);
    const formattedDate = createdAt ? formatDate(createdAt) : "";
    const shareUrl = `${window.location.origin}/test/${id}`;

    const { upvotes, downvotes, userVote, renderKey, handleVote, likeLoading } =
      useVoting(
        likes_count,
        dislikes_count,
        isLiked,
        isDisliked,
        id,
        currentUser
      );

    const {
      showShareMenu,
      copySuccess,
      shareMenuRef,
      handleShareButtonClick,
      copyToClipboard,
      shareToSocialMedia,
    } = useShareMenu();

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

    // Derived values
    const netVotes = upvotes - downvotes;
    const commentsCount = comments_count || 0;

    // Event handlers
    const handleUpvote = (e) => handleVote(e, "like");
    const handleDownvote = (e) => handleVote(e, "dislike");
    const handleCopyLink = () => copyToClipboard(shareUrl);
    const handleShareToSocial = (platform) =>
      shareToSocialMedia(platform, shareUrl, title);

    return (
      <article className="p-2 sm:p-3">
        <div className="block bg-gray-800 bg-opacity-50 rounded-lg p-3 sm:p-6 hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-gray-500 relative">
          <Link
            to={`/posts/${id}`}
            state={{
              id,
              username,
              likes: upvotes,
              dislikes: downvotes,
              categories,
              text,
              title,
              images: images,
            }}
            className="block"
          >
            {/* Header */}
            <header className="flex items-center space-x-2 sm:space-x-4 mb-2 sm:mb-4">
              <UserAvatar username={username} />
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                  {title}
                </h1>
                <div className="flex flex-wrap text-xs sm:text-sm text-gray-400">
                  <span className="mr-2 truncate">
                    by <span className="text-blue-400">{username}</span>
                  </span>
                  {formattedDate && (
                    <span className="mr-2 truncate">• {formattedDate}</span>
                  )}
                  {categories && categories.length > 0 && (
                    <span className="truncate">
                      •{" "}
                      <span className="text-purple-400">
                        {" "}
                        {categories.join(", ")}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </header>

            {/* Content */}
            <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-gray-300 line-clamp-2 sm:line-clamp-3">
              {text}
            </p>

            {/* Media */}
            <ImageGrid images={images} />
            {videoUrl && <VideoPlayer videoUrl={videoUrl} />}
          </Link>

          {/* Stats */}
          <StatsBar
            commentsCount={commentsCount}
            upvotes={upvotes}
            downvotes={downvotes}
            netVotes={netVotes}
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap justify-between gap-1 sm:gap-2">
            <div className="flex gap-1 sm:gap-2">
              <VoteButton
                type="up"
                count={upvotes}
                isActive={userVote === "up"}
                onClick={handleUpvote}
                disabled={likeLoading}
                renderKey={renderKey}
              />
              <VoteButton
                type="down"
                count={downvotes}
                isActive={userVote === "down"}
                onClick={handleDownvote}
                disabled={likeLoading}
                renderKey={renderKey}
              />
            </div>

            <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-0 relative">
              <button
                onClick={handleShareButtonClick}
                className="flex items-center text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-gray-700"
                aria-label="Share post"
              >
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Share</span>
              </button>

              <ShareMenu
                showShareMenu={showShareMenu}
                shareMenuRef={shareMenuRef}
                copySuccess={copySuccess}
                onCopyLink={handleCopyLink}
                onShareToSocial={handleShareToSocial}
              />
            </div>
          </div>
        </div>
      </article>
    );
  }
);

Posts.displayName = "Posts";

export default Posts;
