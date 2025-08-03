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
import CommentComponent from "./CommentComponent.jsx";
import useCreateComment from "../../../hooks/useCreateComment.js";
import { useGetComments } from "../../../hooks/useGetComments.js";
import { useGetPost } from "../../../hooks/useGetPosts.js";
import useLikes from "../../../hooks/useLikes.js";
import Footernav from "../../../../components/Footernav.jsx";
import MediaPlayer from "./MediaPlayer.jsx";

// Format number function
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

export default function PostPage() {
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
    imageUrl: "",
    videoUrl: "",
    video: false,
    image: false,
  });
  // Share functionality
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const shareMenuRef = useRef(null);

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
    videoUrl,
    video,
    image,
  } = postData;
  console.log(postData);
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

  // Comment submission handler
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!CurrentUser) {
      alert("You need to be logged in to comment");
      return;
    }
    if (!newComment.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }
    setCommentError("");
    try {
      // console.log({
      //   postid: _id,
      //   user: CurrentUser._id,
      //   text: newComment,
      //   stance: isFor ? "for" : "against",
      // });
      await createComment({
        postid: _id,
        author_id: CurrentUser._id,
        username: CurrentUser.username,
        text: newComment,
        position: isFor ? true : false,
      });
      setNewComment("");
      getComments(_id);
    } catch (error) {
      console.error("Error creating comment:", error);
      setCommentError("Failed to post comment");
    }
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

  // Helper function to process imageUrl
  const getImages = () => {
    if (!imageUrl || !image) return [];
    if (Array.isArray(imageUrl)) {
      return imageUrl.slice(0, 3);
    }
    if (typeof imageUrl === "string") {
      return [imageUrl];
    }
    return [];
  };

  const images = getImages();

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
    try {
      await handleLike({
        postid: _id,
        user: CurrentUser._id,
        stance: "like",
      });
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
    if (likeLoading) {
      return;
    }
    try {
      await handleLike({
        postid: _id,
        user: CurrentUser._id,
        stance: "dislike",
      });
      getPost(postid);
    } catch (error) {
      console.error("Error handling downvote:", error);
    }
  };

  const handleReply = (commentId) => {
    console.log("Reply to comment:", commentId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="bg-gray-900 bg-opacity-50 backdrop-blur-md py-4 sticky top-0 z-5">
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
                    <span className="mr-2">
                      • {new Date().toLocaleDateString()}
                    </span>
                    <span className="mr-2">
                      • {Math.max(1, Math.ceil(text.split(" ").length / 200))}{" "}
                      min read
                    </span>
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

              {/* Main content area - responsive two-column layout */}
              <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start">
                {/* Media section - left side on desktop, top on mobile */}
                {(images.length > 0 || (video && videoUrl)) && (
                  <div className="w-full lg:w-1/2 lg:flex-shrink-0 mb-6 lg:mb-0">
                    <MediaPlayer
                      videoUrl={videoUrl}
                      images={images}
                      hasVideo={video && videoUrl}
                      hasImages={image && images.length > 0}
                      className="sticky lg:top-24"
                    />
                  </div>
                )}

                {/* Content section - right side on desktop, bottom on mobile */}
                <div
                  className={`w-full ${
                    images.length > 0 || (video && videoUrl)
                      ? "lg:w-1/2"
                      : "lg:w-full"
                  } lg:min-w-0`}
                >
                  {/* Post text content */}
                  <div className="mb-6">
                    <p className="text-gray-300 text-lg leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap">
                      {text}
                    </p>
                  </div>

                  {/* Stats section */}
                  <div className="flex flex-wrap justify-between text-sm text-gray-400 mb-6 gap-4">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-blue-400" />
                      {formatNumber(25)} participants
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
                      {formatNumber(netVotes)} net points
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1 text-purple-400" />
                      {formatNumber(comments.length)} comments
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={handleUpvote}
                        disabled={likeLoading}
                        className={`flex items-center px-4 py-2 rounded-lg hover:bg-gray-700 focus:outline-none transition-colors ${
                          userVote === "up"
                            ? "text-green-400 bg-green-400/10"
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
                        <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded-full">
                          {formatNumber(upvotes)}
                        </span>
                      </button>
                      <button
                        onClick={handleDownvote}
                        disabled={likeLoading}
                        className={`flex items-center px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors ${
                          userVote === "down"
                            ? "text-red-400 bg-red-400/10"
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
                        <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded-full">
                          {formatNumber(downvotes)}
                        </span>
                      </button>
                    </div>

                    <div className="relative">
                      <button
                        className="flex items-center text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-700"
                        onClick={handleShareButtonClick}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </button>
                      {/* Share Menu Dropdown - keep existing code */}
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
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                          >
                            <Linkedin className="w-4 h-4 mr-3" />
                            LinkedIn
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vote breakdown */}
                  {(upvotes > 0 || downvotes > 0) && (
                    <div className="text-xs text-gray-500 border-t border-gray-700 pt-4">
                      <div className="flex flex-wrap gap-4">
                        <span>{formatNumber(upvotes)} upvotes</span>
                        <span>{formatNumber(downvotes)} downvotes</span>
                        <span>
                          {Math.round(
                            (upvotes / (upvotes + downvotes || 1)) * 100
                          )}
                          % positive
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>

            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Comments
              </h2>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {commentsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-pulse text-gray-400">
                      Loading comments...
                    </div>
                  </div>
                ) : commentsError ? (
                  <div className="p-3 bg-red-800 bg-opacity-20 border border-red-500 rounded-md">
                    <p className="text-red-300 text-sm sm:text-base">
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
                  <></>
                )}
              </div>
              <form
                onSubmit={handleSubmitComment}
                className="space-y-3 sm:space-y-4"
              >
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
                    className="w-full bg-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-400 mr-3">
                      Position:
                    </span>
                    <div className="relative inline-flex bg-gray-700 rounded-lg p-1 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setIsFor(true)}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          isFor
                            ? "bg-green-600 text-white shadow-md"
                            : "text-gray-400 hover:text-gray-300"
                        }`}
                      >
                        👍 For
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFor(false)}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          !isFor
                            ? "bg-red-600 text-white shadow-md"
                            : "text-gray-400 hover:text-gray-300"
                        }`}
                      >
                        👎 Against
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={LoadingComment}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {LoadingComment ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </main>

      <footer className="sticky bottom-0 z-50 bg-gray-900">
        <Footernav />
      </footer>
    </div>
  );
}
