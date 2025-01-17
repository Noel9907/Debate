import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
  Reply,
} from "lucide-react";
import CommentComponent from "./CommentComponent";
// Mock data for the post and comments
const mockPost = {
  id: "1",
  username: "JohnDoe",
  title: "Should AI be regulated?",
  text: "As AI technology advances rapidly, there's a growing debate about whether it should be regulated. What are your thoughts?",
  likes: 120,
  dislikes: 45,
  categories: ["Technology", "Ethics", "Politics"],
};

const mockComments = [
  {
    id: "1",
    username: "Alice",
    text: "I believe AI should be regulated to ensure it's developed and used ethically.",
    isFor: true,
    replies: [],
  },
  {
    id: "2",
    username: "Bob",
    text: "Regulation might stifle innovation. We should let the technology develop freely.",
    isFor: false,
    replies: [
      {
        id: "2-1",
        username: "Charlie",
        text: "I disagree. Some regulation is necessary to protect society.",
        isFor: true,
      },
    ],
  },
  {
    id: "3",
    username: "Charlie",
    text: "A balanced approach with some oversight is necessary to protect society while allowing progress.",
    isFor: true,
    replies: [],
  },
];

export default function Postpage() {
  const location = useLocation();
  const { id, username, likes, dislikes, text, title } = location.state;
  const categories = location.state || "";
  const { Id } = useParams();
  const [post, setPost] = useState(mockPost);
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState("");
  const [isFor, setIsFor] = useState(true);

  useEffect(() => {
    // In a real app, fetch the post and comments data here
    // For now, we'll use the mock data
  }, [id]);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: String(comments.length + 1),
        username: "CurrentUser", // In a real app, get this from auth state
        text: newComment,
        isFor,
        replies: [],
      };
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
              username: "CurrentUser", // In a real app, get this from auth state
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
          <h1 className="text-2xl font-bold mb-4">{title}</h1>
          <p className="text-gray-300 mb-4">{text}</p>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Posted by {username}</span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <ThumbsUp className="w-4 h-4 mr-1" />
                {likes}
              </span>
              <span className="flex items-center">
                <ThumbsDown className="w-4 h-4 mr-1" />
                {dislikes}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.isArray(categories) &&
              categories.map((category, index) => (
                <span
                  key={index}
                  className="bg-gray-700 px-2 py-1 rounded-full text-xs"
                >
                  {category}
                </span>
              ))}
          </div>
        </article>

        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          <div className="space-y-4 mb-6">
            {comments.map((comment) => (
              <CommentComponent
                key={comment.id}
                comment={comment}
                onReply={handleReply}
              />
            ))}
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
              >
                <Send className="w-4 h-4 mr-2" />
                Post Comment
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
