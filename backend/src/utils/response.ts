import { Response } from "express";
import { ApiResponse } from "../types/index.js";

export function sendSuccess<T>(res: Response, data: T, message: string = "Success", statusCode: number = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T, message: string = "Created successfully"): void {
  sendSuccess(res, data, message, 201);
}

export function sendError(res: Response, message: string = "Internal server error", statusCode: number = 500, error?: string): void {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  };
  res.status(statusCode).json(response);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}
