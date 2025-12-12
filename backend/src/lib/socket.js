import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "../routes/auth.route.js";
import messageRoutes from "../routes/message.route.js";

const app = express();

// IMPORTANT for Render (reverse proxy)
app.set("trust proxy", 1);

// Middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "https://real-time-chat-application.deepak-sh798.workers.dev",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// Simple test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// HTTP server for Express + Socket.io
const server = http.createServer(app);

// Socket setup
const io = new Server(server, {
  cors: {
    origin: [
      "https://real-time-chat-application.deepak-sh798.workers.dev",
      "http://localhost:5173",
    ],
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
