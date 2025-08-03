import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { useGetConversations } from "../src/hooks/useGetConversations";
import { useSearchUsers } from "../src/hooks/useSearchUsers";
import { useStartConversation } from "../src/hooks/useStartConversation";

const ConversationList = ({
  onSelectConversation,
  selectedConversationId,
  currentUser,
}) => {
  const { conversations, loading, error, refetch } = useGetConversations();
  const { users, searchUsers, loading: searchLoading } = useSearchUsers();
  const { startConversation } = useStartConversation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const handleStartConversation = async (user) => {
    try {
      const conversation = await startConversation(user.username);
      setShowSearch(false);
      setSearchQuery("");
      refetch();
      onSelectConversation(conversation);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(
      (p) => p.username !== currentUser?.username
    );
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Messages</h2>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>
        )}
      </div>

      {/* Search Results */}
      {showSearch && searchQuery && (
        <div className="border-b border-gray-700 max-h-48 overflow-y-auto">
          {searchLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto"></div>
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id}
                onClick={() => handleStartConversation(user)}
                className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                    {user.profilepic ? (
                      <img
                        src={user.profilepic || "/placeholder.svg"}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-medium">
                        {user.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.username}</p>
                    <p className="text-gray-400 text-sm">{user.fullname}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-400">No users found</div>
          )}
        </div>
      )}

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {error ? (
          <div className="p-4 text-center text-red-400">
            Failed to load conversations
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            No conversations yet
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            return (
              <div
                key={conversation._id}
                onClick={() => onSelectConversation(conversation)}
                className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                  selectedConversationId === conversation._id
                    ? "bg-gray-700"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                      {otherParticipant?.profilepic ? (
                        <img
                          src={
                            otherParticipant.profilepic || "/placeholder.svg"
                          }
                          alt={otherParticipant.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {otherParticipant?.username?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium truncate">
                        {otherParticipant?.fullname ||
                          otherParticipant?.username}
                      </p>
                      <span className="text-xs text-gray-400">
                        {conversation.last_message &&
                          formatTime(conversation.last_message_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-sm truncate">
                        {conversation.last_message?.content ||
                          "No messages yet"}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
