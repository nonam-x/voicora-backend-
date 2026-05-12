import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess, sendCreated } from "../../utils/response.js";
import * as authService from "./auth.service.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  sendCreated(res, result, "Registration successful");
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  sendSuccess(res, result, "Login successful");
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await authService.getUserProfile(req.user!.userId);
  sendSuccess(res, profile);
});
