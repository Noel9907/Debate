import { useState, useEffect } from "react";
import ConversationList from "./ConversationList";
import MessageArea from "./MessageArea";
import Topbar from "./Topbar";
import { socket } from "../singleton/socket.js";

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setCurrentUser(userInfo);

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Connected to socket.io server", socket.id);
    });

    socket.on("message", (message) => {
      console.log("New message received:", message);
    });

    return () => {
      socket.off("connect");
      socket.off("message");
      // don't disconnect unless you truly want to kill connection
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-900">
      <div className="shrink-0">
        <Topbar />
      </div>
      <div className="flex">
        <div className="border-r border-gray-700 z-10 w-56 overflow-y-auto">
          <ConversationList
            onSelectConversation={setSelectedConversation}
            selectedConversationId={selectedConversation?._id}
            currentUser={currentUser}
          />
        </div>
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
