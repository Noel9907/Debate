import { useState, useEffect, useRef } from "react";
import {
  Send,
  MoreVertical,
  Phone,
  Video,
  Info,
  Reply,
  Trash2,
  X,
} from "lucide-react";
import { useGetMessages } from "../src/hooks/useGetMessages";
import { useSendMessage } from "../src/hooks/useSendMessage";
import { useDeleteMessage } from "../src/hooks/useDeleteMessage";
import { useBlockUser } from "../src/hooks/useBlockUser";
import { useSocket } from "../src/hooks/useSocket";

const MessageArea = ({ conversation, currentUser }) => {
  const { messages, loading, setMessages } = useGetMessages(conversation?._id);
  const { sendMessage, loading: sendingMessage } = useSendMessage();
  const { deleteMessage } = useDeleteMessage();
  const { blockUser } = useBlockUser();
  const { socket, joinConversation, markMessagesRead } = useSocket();

  const [newMessage, setNewMessage] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversation?._id && socket) {
      joinConversation(conversation._id);
      markMessagesRead(conversation._id);

      // Listen for new messages
      socket.on("new_message", (data) => {
        if (data.conversationId === conversation._id) {
          setMessages((prev) => [...prev, data.message]);
        }
      });

      // Listen for typing indicators
      socket.on("user_typing", (data) => {
        if (data.userId !== currentUser?._id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });

      return () => {
        socket.off("new_message");
        socket.off("user_typing");
      };
    }
  }, [conversation?._id, socket]);

  const getOtherParticipant = () => {
    return conversation?.participants.find(
      (p) => p.username !== currentUser?.username
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    const messageData = {
      conversationId: conversation._id,
      content: newMessage.trim(),
      messageType: "text",
      ...(replyTo && { replyTo: replyTo._id }),
    };

    setNewMessage("");
    setReplyTo(null);

    try {
      const sentMessage = await sendMessage(messageData);
      setMessages((prev) => [...prev, sentMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setNewMessage(messageData.content);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleBlockUser = async () => {
    const otherParticipant = getOtherParticipant();
    try {
      await blockUser(otherParticipant.username, "Blocked from chat");
      setShowOptions(false);
    } catch (error) {
      console.error("Failed to block user:", error);
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const otherParticipant = getOtherParticipant();

  if (!conversation) {
    return (
      <div className="flex-1 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Start a conversation
          </h3>
          <p className="text-gray-400">
            Select a conversation or search for users to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                {otherParticipant?.profilepic ? (
                  <img
                    src={otherParticipant.profilepic || "/placeholder.svg"}
                    alt={otherParticipant.username}
                    className="w-20 h-20 object-cover"
                  />
                ) : (
                  <span className="text-white font-medium">
                    {otherParticipant?.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {otherParticipant?.fullname || otherParticipant?.username}
              </h3>
              <p className="text-gray-400 text-sm">
                @{otherParticipant?.username}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
              <Phone className="w-5 h-5 text-gray-300" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
              <Video className="w-5 h-5 text-gray-300" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-300" />
              </button>

              {showOptions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => setShowOptions(false)}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 rounded-t-lg"
                  >
                    <Info className="w-4 h-4 inline mr-2" />
                    View Profile
                  </button>
                  <button
                    onClick={handleBlockUser}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-600 rounded-b-lg"
                  >
                    Block User
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isCurrentUser =
                message.sender_username === currentUser?.username;
              const showDate =
                index === 0 ||
                formatMessageDate(message.createdAt) !==
                  formatMessageDate(messages[index - 1].createdAt);

              return (
                <div key={message._id}>
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                        {formatMessageDate(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-xs lg:max-w-md group">
                      {/* Reply preview */}
                      {message.reply_to && (
                        <div
                          className={`mb-2 ${
                            isCurrentUser ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="bg-gray-600 p-2 rounded-lg text-sm">
                            <p className="text-gray-400 text-xs">
                              @{message.reply_to.sender_username}
                            </p>
                            <p className="text-gray-200 truncate">
                              {message.reply_to.content}
                            </p>
                          </div>
                        </div>
                      )}

                      <div
                        className={`relative px-4 py-2 rounded-lg ${
                          isCurrentUser
                            ? "bg-red-500 text-white"
                            : "bg-gray-700 text-gray-100"
                        }`}
                      >
                        {/* Message options */}
                        {isCurrentUser && (
                          <div className="absolute -right-8 top-0 hidden group-hover:flex flex-col space-y-1">
                            <button
                              onClick={() => setReplyTo(message)}
                              className="p-1 bg-gray-600 hover:bg-gray-500 rounded"
                            >
                              <Reply className="w-3 h-3 text-gray-300" />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(message._id)}
                              className="p-1 bg-red-600 hover:bg-red-500 rounded"
                            >
                              <Trash2 className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        )}

                        {/* Media content */}
                        {message.message_type === "image" &&
                          message.media_url && (
                            <div className="mb-2">
                              <img
                                src={message.media_url || "/placeholder.svg"}
                                alt="Shared image"
                                className="max-w-full rounded-lg"
                              />
                            </div>
                          )}

                        <p className="break-words">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p
                            className={`text-xs ${
                              isCurrentUser ? "text-red-100" : "text-gray-400"
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                            {message.is_edited && (
                              <span className="ml-1">(edited)</span>
                            )}
                          </p>
                          {isCurrentUser && (
                            <div className="flex items-center space-x-1">
                              {message.is_read && (
                                <span className="text-xs text-red-200">✓✓</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="p-3 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-xs">
                Replying to @{replyTo.sender_username}
              </p>
              <p className="text-gray-200 text-sm truncate">
                {replyTo.content}
              </p>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="p-1 hover:bg-gray-600 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-3"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              replyTo
                ? `Reply to @${replyTo.sender_username}...`
                : "Type a message..."
            }
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            disabled={sendingMessage}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sendingMessage}
            className="p-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {sendingMessage ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageArea;
