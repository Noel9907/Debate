import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import CommentComponent from "./CommentComponent";
import useCreateComment from "../../../hooks/useCreateComment.js";
import { useGetComments } from "../../../hooks/useGetComments.js";

export default function Postpage() {
  const CurrentUser = JSON.parse(localStorage.getItem("duser"));

  const commentid = JSON.parse(localStorage.getItem("duser"))._id;

  const location = useLocation();
  const { id, username, likes, dislikes, text, title, categories } =
    location.state;

  // Add upvote/downvote state functionality from Posts component
  const [upvotes, setUpvotes] = useState(likes || 0);
  const [downvotes, setDownvotes] = useState(dislikes || 0);
  const [userVote, setUserVote] = useState(null);

  // Calculate net votes
  const netVotes = upvotes - downvotes;

  const { getCommentLoading, getComments, currentComment } = useGetComments([]);
  useEffect(() => {
    getComments(id);
  }, [getComments, id]);

  const [newComment, setNewComment] = useState("");
  const [isFor, setIsFor] = useState(true);
  const { createComment, LoadingComment } = useCreateComment();
  const [comments, setComments] = useState([]);

  // Format function from Posts component
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

  // Upvote/downvote handlers from Posts component
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

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        postid: id,
        username: CurrentUser.username,
        text: newComment,
        position: isFor,
        author_id: commentid,
      };
      createComment(comment);
      console.log(comment);
      setComments([...comments, comment]);
      setNewComment("");
    }
  };

  const handleReply = (commentId, replyText, isFor) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [
            ...comment.replies,
            {
              id: `${commentId}-${comment.replies.length + 1}`,
              username: "CurrentUser",
              text: replyText,
              isFor,
            },
          ],
        };
      }
      return comment;
    });
    setComments(updatedComments);
  };

  // Calculate reading time (from Posts component)
  const readingTime = text
    ? Math.max(1, Math.ceil(text.split(" ").length / 200))
    : 1;

  // Format date if available (mock date for demo)
  const formattedDate = new Date().toLocaleDateString();
  // Mock debate stats
  const debate = {
    participants: 25,
    comments: currentComment?.length || 0,
  };

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
        <article className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mb-8">
          {/* Add profile pic, title section with meta info (similar to Posts component) */}
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
                className={`flex items-center px-0 py-1 rounded-md hover:bg-gray-700 transition-colors ${
                  userVote === "up"
                    ? "text-green-400"
                    : "text-gray-400 hover:text-white"
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
                className={`flex items-center px-3 py-1 rounded-md hover:bg-gray-700 transition-colors ${
                  userVote === "down"
                    ? "text-red-400"
                    : "text-gray-400 hover:text-white"
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
            <button className="flex items-center text-gray-400 hover:text-white transition-colors px-3 py-1 rounded-md hover:bg-gray-700">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
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
            {currentComment?.length > 0 ? (
              currentComment.map((comment, index) => (
                <CommentComponent
                  key={index}
                  comment={comment}
                  onReply={handleReply}
                />
              ))
            ) : (
              <p>No comments yet.</p>
            )}
          </div>

          <form onSubmit={handleSubmitComment} className="space-y-4">
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
              <div className="space-x-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-full ${
                    isFor ? "bg-green-600" : "bg-gray-600"
                  } hover:bg-opacity-80 transition-colors`}
                  onClick={() => setIsFor(true)}
                >
                  For
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-full ${
                    !isFor ? "bg-red-600" : "bg-gray-600"
                  } hover:bg-opacity-80 transition-colors`}
                  onClick={() => setIsFor(false)}
                >
                  Against
                </button>
              </div>
              <button
                type="submit"
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
                disabled={LoadingComment}
              >
                <Send className="w-4 h-4 mr-2" />
                {LoadingComment ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="bg-gray-900 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} DebateHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
