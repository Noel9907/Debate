import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Award,
  Share2,
  Users,
  TrendingUp,
  Copy,
  Facebook,
  Linkedin,
  X,
} from "lucide-react";
import CommentComponent from "../Post/CommentComponent.jsx";
import useCreateComment from "../../../hooks/useCreateComment.js";
import { useGetComments } from "../../../hooks/useGetComments.js";
import { useGetPost } from "../../../hooks/useGetPosts.js";
import useLikes from "../../../hooks/useLikes.js";
import Footernav from "../../../../components/Footernav.jsx";

export default function Postpage() {
  const CurrentUser = JSON.parse(localStorage.getItem("duser"));
  const commentid = CurrentUser?._id;
  const { postid } = useParams();
  const { getPost, PostLoading, post } = useGetPost();
  const [postData, setPostData] = useState({
    _id: "",
    username: "",
    likes: 0,
    dislikes: 0,
    dislikes_count: 0,
    likes_count: 0,
    text: "",
    title: "",
    categories: [],
  });

  // Share functionality
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const shareMenuRef = useRef(null);

  // Image modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch post data when postid changes
  useEffect(() => {
    if (postid) {
      getPost(postid);
    }
  }, [postid]);

  // Update local state when post data changes
  useEffect(() => {
    if (post && post._id) {
      setPostData(post);
      // Initialize userVote based on whether user has liked or disliked
      if (
        post.likes &&
        Array.isArray(post.likes) &&
        post.likes.includes(CurrentUser?._id)
      ) {
        setUserVote("up");
      } else if (
        post.dislikes &&
        Array.isArray(post.dislikes) &&
        post.dislikes.includes(CurrentUser?._id)
      ) {
        setUserVote("down");
      } else {
        setUserVote(null);
      }
    }
  }, [post, CurrentUser]);

  const {
    _id,
    username,
    likes,
    likes_count,
    dislikes_count,
    dislikes,
    text,
    title,
    categories,
    imageUrl,
  } = postData;
  console.log("img _ " + imageUrl);
  const { handleLike, likeLoading } = useLikes();

  // Upvote/downvote state functionality
  const [upvotes, setUpvotes] = useState(likes_count || 0);
  const [downvotes, setDownvotes] = useState(dislikes_count || 0);
  const [userVote, setUserVote] = useState(null);

  // Update vote counts when post data changes
  useEffect(() => {
    setUpvotes(likes_count || 0);
    setDownvotes(dislikes_count || 0);
  }, [likes, dislikes]);

  // Calculate net votes
  const netVotes = upvotes - downvotes;

  // Get comments from hook
  const {
    getComments,
    isLoading: commentsLoading,
    comments,
    error: commentsError,
    updateComments,
  } = useGetComments();

  // Fetch comments on post load/update
  useEffect(() => {
    if (_id) {
      console.log("Fetching comments for post:", _id);
      getComments(_id)
        .then(() => console.log("Comments fetched successfully"))
        .catch((error) => console.error("Error fetching comments:", error));
    }
  }, [getComments, _id]);

  const [newComment, setNewComment] = useState("");
  const [isFor, setIsFor] = useState(true);
  const [commentError, setCommentError] = useState("");
  const { createComment, LoadingComment } = useCreateComment();

  // Format number function
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

  // Helper function to process imageUrl
  const getImages = () => {
    if (!imageUrl) return [];

    // If imageUrl is already an array, return it (limited to 3)
    if (Array.isArray(imageUrl)) {
      return imageUrl.slice(0, 3);
    }

    // If imageUrl is a string, return it as a single-item array
    if (typeof imageUrl === "string") {
      return [imageUrl];
    }

    return [];
  };

  const images = getImages();

  // Image modal functions
  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showImageModal) return;

    if (e.key === "Escape") {
      closeImageModal();
    } else if (e.key === "ArrowRight") {
      nextImage();
    } else if (e.key === "ArrowLeft") {
      prevImage();
    }
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
        postid: _id,
        user: CurrentUser._id,
        stance: "like",
      });
      // After successful API call, fetch the updated post
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
        postid: _id,
        user: CurrentUser._id,
        stance: "dislike",
      });
      // After successful API call, fetch the updated post
      getPost(postid);
    } catch (error) {
      console.error("Error handling downvote:", error);
    }
  };

  // Comment submission handler with optimistic update
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setCommentError("");
    if (!CurrentUser) {
      setCommentError("You must be logged in to comment");
      return;
    }
    if (newComment.trim() && _id) {
      const comment = {
        postid: _id,
        username: CurrentUser?.username || "Anonymous",
        text: newComment,
        position: isFor,
        author_id: commentid,
      };
      console.log("Sending comment data:", comment);
      // Create an optimistic comment with a temporary ID
      const optimisticComment = {
        ...comment,
        _id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      // Add the optimistic comment to the UI immediately
      updateComments([optimisticComment, comments]);
      // Clear the input
      setNewComment("");
      try {
        await createComment(comment);
        // After successful creation, fetch fresh comments
        getComments(_id);
      } catch (error) {
        console.error("Error creating comment:", error);
        setCommentError("Failed to post comment. Please try again.");
        // Remove the optimistic comment on failure
        updateComments(comments.filter((c) => c._id !== optimisticComment._id));
      }
    }
  };

  // Reply handler for nested comments
  const handleReply = (commentId, replyText, isFor) => {
    const updatedComments = comments.map((comment) => {
      if (comment._id === commentId) {
        return {
          ...comment,
          replies: [
            ...(comment.replies || []),
            {
              _id: `${commentId}-${(comment.replies?.length || 0) + 1}`,
              username: CurrentUser?.username || "Anonymous",
              text: replyText,
              isFor,
            },
          ],
        };
      }
      return comment;
    });
    updateComments(updatedComments);
  };

  // Share functionality
  const handleShareButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
    setCopySuccess(false);
  };

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(
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
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this debate: ${title}`);
    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, "_blank", "width=600,height=400");
    setShowShareMenu(false);
  };

  // Close share menu when clicking outside
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

  // Keyboard navigation for image modal
  useEffect(() => {
    if (showImageModal) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [showImageModal]);

  // Calculate reading time (using 200 words/min average)
  const readingTime = text
    ? Math.max(1, Math.ceil(text.split(" ").length / 200))
    : 1;

  // Format date (using current date for demo)
  const formattedDate = new Date().toLocaleDateString();

  // Mock debate stats - using the length of comments array
  const debate = {
    participants: 25,
    comments: comments.length || 0,
  };

  // Handle post loading state
  if (PostLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex justify-center items-center">
        <p>Loading post...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="bg-gray-900 bg-opacity-50 backdrop-blur-md py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="text-white hover:text-red-400 transition-colors flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Feed
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!_id ? (
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mb-8 text-center">
            <p>Post not found or still loading...</p>
          </div>
        ) : (
          <>
            <article className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mb-8">
              {/* Post header with profile pic and meta info */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <img
                    src={`https://avatar.iran.liara.run/public/boy?username=${username}`}
                    alt={username}
                    width={40}
                    height={40}
                    className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-0.5"
                  />
                  {netVotes > 50 && (
                    <Award className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white">{title}</h1>
                  <div className="flex flex-wrap text-sm text-gray-400">
                    <span className="mr-2">
                      by{" "}
                      <Link to={`/profile/${username}`}>
                        <span className="text-blue-400">{username}</span>
                      </Link>
                    </span>
                    <span className="mr-2">• {formattedDate}</span>
                    <span className="mr-2">• {readingTime} min read</span>
                    {Array.isArray(categories) && categories.length > 0 && (
                      <span className="mr-2">
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

              {/* Main content area - responsive layout */}
              <div className={`${images.length > 0 ? "lg:flex lg:gap-6" : ""}`}>
                {/* Images section - left side on large screens */}
                {images.length > 0 && (
                  <div className="mb-6 lg:mb-0 lg:w-1/2 lg:flex-shrink-0">
                    {images.length === 1 ? (
                      // Single image - full width
                      <div
                        className="rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => openImageModal(0)}
                      >
                        <img
                          src={images[0] || "/placeholder.svg"}
                          alt="Post image"
                          className="w-full h-auto lg:h-64 xl:h-80 object-cover bg-gray-700 hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    ) : images.length === 2 ? (
                      // Two images - side by side
                      <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                        {images.map((img, index) => (
                          <img
                            key={index}
                            src={img || "/placeholder.svg"}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-48 lg:h-32 xl:h-40 object-cover bg-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openImageModal(index)}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      // Three images - first large, other two stacked
                      <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                        <img
                          src={images[0] || "/placeholder.svg"}
                          alt="Post image 1"
                          className="w-full h-96 lg:h-64 xl:h-80 object-cover bg-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openImageModal(0)}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <div className="grid grid-rows-2 gap-2">
                          <img
                            src={images[1] || "/placeholder.svg"}
                            alt="Post image 2"
                            className="w-full h-47 lg:h-31 xl:h-39 object-cover bg-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openImageModal(1)}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <img
                            src={images[2] || "/placeholder.svg"}
                            alt="Post image 3"
                            className="w-full h-47 lg:h-31 xl:h-39 object-cover bg-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openImageModal(2)}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Content section - right side on large screens */}
                <div className={`${images.length > 0 ? "lg:w-1/2" : "w-full"}`}>
                  <p className="text-gray-300 mb-6">{text}</p>

                  {/* Stats section */}
                  <div className="flex justify-between text-sm text-gray-400 mb-4">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-blue-400" />{" "}
                      {formatNumber(debate.participants)} participants
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-400" />{" "}
                      {formatNumber(netVotes)} net points
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1 text-purple-400" />{" "}
                      {formatNumber(debate.comments)} comments
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-between mt-6">
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpvote}
                        disabled={likeLoading}
                        className={`flex items-center px-3 py-1 rounded-md hover:bg-gray-700 transition-colors ${
                          userVote === "up"
                            ? "text-green-400"
                            : "text-gray-400 hover:text-white"
                        } ${
                          likeLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <ThumbsUp
                          className={`w-4 h-4 mr-2 ${
                            userVote === "up" ? "fill-current" : ""
                          }`}
                        />
                        <span>Upvote</span>
                        <span className="ml-1 text-xs bg-gray-700 px-1.5 py-0.5 rounded-full">
                          {formatNumber(upvotes)}
                        </span>
                      </button>
                      <button
                        onClick={handleDownvote}
                        disabled={likeLoading}
                        className={`flex items-center px-3 py-1 rounded-md hover:bg-gray-700 transition-colors ${
                          userVote === "down"
                            ? "text-red-400"
                            : "text-gray-400 hover:text-white"
                        } ${
                          likeLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <ThumbsDown
                          className={`w-4 h-4 mr-2 ${
                            userVote === "down" ? "fill-current" : ""
                          }`}
                        />
                        <span>Downvote</span>
                        <span className="ml-1 text-xs bg-gray-700 px-1.5 py-0.5 rounded-full">
                          {formatNumber(downvotes)}
                        </span>
                      </button>
                    </div>
                    <div className="relative">
                      <button
                        className="flex items-center text-gray-400 hover:text-white transition-colors px-3 py-1 rounded-md hover:bg-gray-700"
                        onClick={handleShareButtonClick}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </button>
                      {/* Share Menu Dropdown */}
                      {showShareMenu && (
                        <div
                          ref={shareMenuRef}
                          className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-50 py-1 border border-gray-700"
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
                            <X className="w-4 h-4 mr-3" />
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
                            className="flex items-center px-4 py-2 text-sm text-gray-3000 hover:bg-gray-700 w-full text-left"
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
                      {formatNumber(upvotes)} upvotes •{" "}
                      {formatNumber(downvotes)} downvotes •{" "}
                      {Math.round((upvotes / (upvotes + downvotes || 1)) * 100)}
                      % positive
                    </div>
                  )}
                </div>
              </div>
            </article>

            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Comments</h2>
              <div className="space-y-4 mb-6">
                {commentsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-pulse text-gray-400">
                      Loading comments...
                    </div>
                  </div>
                ) : commentsError ? (
                  <div className="p-3 bg-red-800 bg-opacity-20 border border-red-500 rounded-md">
                    <p className="text-red-300">
                      Error loading comments: {commentsError}
                    </p>
                    <button
                      onClick={() => getComments(_id)}
                      className="text-sm text-red-400 hover:text-red-300 mt-2"
                    >
                      Try again
                    </button>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <CommentComponent
                      key={comment._id || index}
                      comment={comment}
                      onReply={handleReply}
                      isOptimistic={comment._id?.startsWith("temp-")}
                    />
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    Be the first to comment!
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmitComment} className="space-y-4">
                {commentError && (
                  <div className="p-2 bg-red-600 bg-opacity-20 border border-red-400 rounded text-red-200 text-sm">
                    {commentError}
                  </div>
                )}
                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-gray-400 mb-2"
                  >
                    Add your comment
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    className="w-full bg-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center text-sm text-gray-400">
                      <input
                        type="radio"
                        name="position"
                        value="for"
                        checked={isFor}
                        onChange={() => setIsFor(true)}
                        className="mr-1"
                      />
                      For
                    </label>
                    <label className="inline-flex items-center text-sm text-gray-400">
                      <input
                        type="radio"
                        name="position"
                        value="against"
                        checked={!isFor}
                        onChange={() => setIsFor(false)}
                        className="mr-1"
                      />
                      Against
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={LoadingComment}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    {LoadingComment ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
              {/* Close button */}
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-gray-800 bg-opacity-50 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation arrows - only show if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-gray-800 bg-opacity-50 rounded-full p-2 transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-gray-800 bg-opacity-50 rounded-full p-2 transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6 transform rotate-180" />
                  </button>
                </>
              )}

              {/* Main image */}
              <img
                src={images[currentImageIndex] || "/placeholder.svg"}
                alt={`Post image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.src = "/placeholder.svg";
                }}
              />

              {/* Image counter - only show if multiple images */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={closeImageModal} />
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 z-50 bg-gray-900">
        <Footernav />
      </footer>
    </div>
  );
}
