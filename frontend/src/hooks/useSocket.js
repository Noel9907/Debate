// useSocket.js
import { useEffect, useState } from "react";
import { socket } from "../../singleton/socket"; // import the same instance

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  const connect = () => {
    if (!socket.connected) socket.connect();
  };

  const disconnect = () => {
    if (socket.connected) socket.disconnect();
  };

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    joinConversation: (id) => socket.emit("join_conversation", id),
    sendMessage: (data) => socket.emit("send_message", data),
    startTyping: (id) => socket.emit("typing_start", { conversationId: id }),
    stopTyping: (id) => socket.emit("typing_stop", { conversationId: id }),
    markMessagesRead: (id) =>
      socket.emit("mark_messages_read", { conversationId: id }),
  };
};
