import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { env } from "../config/env.config.js";

/**
 * Global error handling middleware.
 * Catches all errors thrown in route handlers and middleware.
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // Log error in development
  if (env.NODE_ENV === "development") {
    console.error("❌ Error:", err);
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const mongooseErr = err as any;
    const messages = Object.values(mongooseErr.errors).map((e: any) => e.message);
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: messages,
    });
    return;
  }

  // Handle Mongoose duplicate key errors
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0];
    res.status(409).json({
      success: false,
      message: `${field ? `${field} already exists` : "Duplicate key error"}`,
    });
    return;
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid resource ID format",
    });
    return;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token has expired",
    });
    return;
  }

  // Unexpected errors
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(env.NODE_ENV === "development" && { error: err.message, stack: err.stack }),
  });
}
