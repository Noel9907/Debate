import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
  Reply,
  Award,
  Share2,
  Users,
  TrendingUp,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  X,
} from "lucide-react";
import CommentComponent from "./CommentComponent";
import useCreateComment from "../../../hooks/useCreateComment.js";
import { useGetComments } from "../../../hooks/useGetComments.js";
import { useGetPost } from "../../../hooks/useGetPosts.js";
import { useLikes } from "../../../hooks/useLikes.js"; // Import the useLikes hook
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
  } = postData;

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
                      by <span className="text-blue-400">{username}</span>
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
                    } ${likeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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
                    } ${likeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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
                  {Math.round((upvotes / (upvotes + downvotes || 1)) * 100)}%
                  positive
                </div>
              )}
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
      </main>
      <footer className="sticky bottom-0 z-50 bg-gray-900">
        <Footernav />
      </footer>
    </div>
  );
}
