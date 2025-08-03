import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socketInstance.close();
    };
  }, []);

  const joinConversation = (conversationId) => {
    if (socket) {
      socket.emit("join_conversation", conversationId);
    }
  };

  const sendMessage = (messageData) => {
    if (socket) {
      socket.emit("send_message", messageData);
    }
  };

  const startTyping = (conversationId) => {
    if (socket) {
      socket.emit("typing_start", { conversationId });
    }
  };

  const stopTyping = (conversationId) => {
    if (socket) {
      socket.emit("typing_stop", { conversationId });
    }
  };

  const markMessagesRead = (conversationId) => {
    if (socket) {
      socket.emit("mark_messages_read", { conversationId });
    }
  };

  return {
    socket,
    isConnected,
    joinConversation,
    sendMessage: sendMessage,
    startTyping,
    stopTyping,
    markMessagesRead,
  };
};
