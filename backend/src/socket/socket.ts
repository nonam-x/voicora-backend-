import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "../config/env.config.js";

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join a poll room for live updates
    socket.on("poll:join", (pollId: string) => {
      socket.join(`poll:${pollId}`);
      console.log(`📊 Socket ${socket.id} joined poll room: ${pollId}`);
    });

    // Leave a poll room
    socket.on("poll:leave", (pollId: string) => {
      socket.leave(`poll:${pollId}`);
      console.log(`👋 Socket ${socket.id} left poll room: ${pollId}`);
    });

    // Handle disconnection
    socket.on("disconnect", (reason: string) => {
      console.log(`❌ Socket disconnected: ${socket.id} (${reason})`);
    });

    // Error handling
    socket.on("error", (error: Error) => {
      console.error(`⚠️ Socket error for ${socket.id}:`, error.message);
    });
  });

  console.log("🔌 Socket.io initialized");
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initializeSocket first.");
  }
  return io;
}
