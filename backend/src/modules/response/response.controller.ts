import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess, sendCreated } from "../../utils/response.js";
import * as responseService from "./response.service.js";
import { getIO } from "../../socket/socket.js";

export const submitResponse = asyncHandler(async (req: Request, res: Response) => {
  const { pollId } = req.params;
  const userId = req.user?.userId;

  const result = await responseService.submitResponse(pollId as string, userId, req.body);

  // Emit live updates via Socket.io
  const io = getIO();
  for (const update of result.updates) {
    io.to(`poll:${pollId}`).emit("vote:update", update);
  }

  sendCreated(res, result.response, "Response submitted successfully");
});

export const getResponses = asyncHandler(async (req: Request, res: Response) => {
  const responses = await responseService.getResponsesByPoll(req.params.pollId as string);
  sendSuccess(res, responses);
});

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const analytics = await responseService.getPollAnalytics(req.params.pollId as string);
  sendSuccess(res, analytics);
});
