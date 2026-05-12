import { createServer } from "http";
import { env } from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";
import { initializeSocket } from "./socket/socket.js";
import app from "./app.js";

async function startServer(): Promise<void> {
  // Connect to MongoDB
  await connectDB();

  // Create HTTP server (needed for Socket.io)
  const httpServer = createServer(app);

  // Initialize Socket.io
  initializeSocket(httpServer);

  // Start listening
  httpServer.listen(env.PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║   🎙️  VOICORA API SERVER                     ║
║                                              ║
║   Port:  ${String(env.PORT).padEnd(35)}║
║   Mode:  ${env.NODE_ENV.padEnd(35)}║
║   URL:   http://localhost:${String(env.PORT).padEnd(18)}║
║                                              ║
╚══════════════════════════════════════════════╝
    `);
  });
}

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
