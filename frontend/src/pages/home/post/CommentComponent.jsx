import React, { useState } from "react";
import { Reply } from "lucide-react";

export default function CommentComponent({ comment, onReply }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyIsFor, setReplyIsFor] = useState(true);

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      onReply(comment.id, replyText, replyIsFor);
      setReplyText("");
      setIsReplying(false);
    }
  };

  return (
    <div
      className={`p-4 rounded-lg ${
        comment.isFor
          ? "bg-green-900 bg-opacity-50"
          : "bg-red-900 bg-opacity-50"
      }`}
    >
      <p className="mb-2">{comment.text}</p>
      <div className="text-sm text-gray-400 flex justify-between items-center mb-2">
        <span>{comment.username}</span>
        <span>{comment.isFor ? "In Support" : "Against"}</span>
      </div>
      <button
        onClick={() => setIsReplying(!isReplying)}
        className="mb-2 px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center"
      >
        <Reply className="w-4 h-4 mr-2" />
        Reply
      </button>
      {isReplying && (
        <form onSubmit={handleSubmitReply} className="space-y-2 mb-4">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Your reply..."
            className="w-full bg-gray-700 rounded-lg p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          ></textarea>
          <div className="flex justify-between items-center">
            <div className="space-x-2">
              <button
                type="button"
                className={`px-3 py-1 rounded-md ${
                  replyIsFor ? "bg-green-600" : "bg-gray-600"
                } hover:bg-opacity-80 transition-colors`}
                onClick={() => setReplyIsFor(true)}
              >
                For
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded-md ${
                  !replyIsFor ? "bg-red-600" : "bg-gray-600"
                } hover:bg-opacity-80 transition-colors`}
                onClick={() => setReplyIsFor(false)}
              >
                Against
              </button>
            </div>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Submit Reply
            </button>
          </div>
        </form>
      )}
      {comment.replies.length > 0 && (
        <div className="ml-4 mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <div
              key={reply.id}
              className={`p-2 rounded-lg ${
                reply.isFor
                  ? "bg-green-800 bg-opacity-50"
                  : "bg-red-800 bg-opacity-50"
              }`}
            >
              <p className="text-sm">{reply.text}</p>
              <div className="text-xs text-gray-400 flex justify-between items-center">
                <span>{reply.username}</span>
                <span>{reply.isFor ? "In Support" : "Against"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
