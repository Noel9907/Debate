import { useState, useEffect } from "react";
import { Bell, MessageCircle, Plus, LogOut } from "lucide-react";
import ConversationList from "./ConversationList";
import MessageArea from "./MessageArea";
import { useUnreadCount } from "../src/hooks/useUnreadCount";
import io from "socket.io-client";
import Topbar from "./Topbar";
import Footernav from "./Footernav";

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { unreadCount } = useUnreadCount();
  const socket = io(import.meta.env.VITE_API_URL);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setCurrentUser(userInfo);

    socket.on("connect", () => {
      console.log("Connected to socket.io server");
    });

    socket.on("message", (message) => {
      console.log("New message received:", message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  };

  return (
    <div className="fixed inset-0  flex flex-col bg-gray-900 ">
      <div className="shrink-0">
        <Topbar />
      </div>

      {/* Main content: Conversations and Messages */}
      <div className="flex">
        {/* Left panel */}
        <div className=" border-r border-gray-700 z-10 w-56">
          <div className=" overflow-y-auto">
            <ConversationList
              onSelectConversation={setSelectedConversation}
              selectedConversationId={selectedConversation?._id}
              currentUser={currentUser}
            />
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-hidden">
          <MessageArea
            conversation={selectedConversation}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
