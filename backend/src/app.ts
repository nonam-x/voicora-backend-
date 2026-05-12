import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.config.js";
import { errorHandler } from "./middlewares/error.middleware.js";

// Route imports
import authRoutes from "./modules/auth/auth.routes.js";
import pollRoutes from "./modules/poll/poll.routes.js";
import responseRoutes from "./modules/response/response.routes.js";

const app = express();

// ======================== GLOBAL MIDDLEWARE ========================

app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ======================== HEALTH CHECK ========================

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "🎙️ Voicora API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    uptime: process.uptime(),
  });
});

// ======================== API ROUTES ========================

app.use("/api/auth", authRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/responses", responseRoutes);

// ======================== 404 HANDLER ========================

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ======================== GLOBAL ERROR HANDLER ========================

app.use(errorHandler);

export default app;
