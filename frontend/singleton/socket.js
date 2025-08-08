// socket.js
import { io } from "socket.io-client";

// Create only one socket instance and export it
export const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: false, // we control when it connects
});
