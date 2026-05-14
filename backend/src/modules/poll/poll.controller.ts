import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess, sendCreated, sendNoContent } from "../../utils/response.js";
import * as pollService from "./poll.service.js";

export const createPoll = asyncHandler(async (req: Request, res: Response) => {
  const poll = await pollService.createPoll(req.user!.userId, req.body);
  sendCreated(res, poll, "Poll created successfully");
});

export const getMyPolls = asyncHandler(async (req: Request, res: Response) => {
  const polls = await pollService.getPollsByUser(req.user!.userId);
  sendSuccess(res, polls);
});

export const getPollById = asyncHandler(async (req: Request, res: Response) => {
  const poll = await pollService.getPollById(req.params.id as string);
  sendSuccess(res, poll);
});

export const getPollBySlug = asyncHandler(async (req: Request, res: Response) => {
  const poll = await pollService.getPollBySlug(req.params.slug as string);
  sendSuccess(res, poll);
});

export const updatePoll = asyncHandler(async (req: Request, res: Response) => {
  const poll = await pollService.updatePoll(req.params.id as string, req.user!.userId, req.body);
  sendSuccess(res, poll, "Poll updated successfully");
});

export const activatePoll = asyncHandler(async (req: Request, res: Response) => {
  const poll = await pollService.activatePoll(req.params.id as string, req.user!.userId);
  sendSuccess(res, poll, "Poll activated successfully");
});

export const closePoll = asyncHandler(async (req: Request, res: Response) => {
  const poll = await pollService.closePoll(req.params.id as string, req.user!.userId);
  sendSuccess(res, poll, "Poll closed successfully");
});

export const publishResults = asyncHandler(async (req: Request, res: Response) => {
  const poll = await pollService.publishResults(req.params.id as string, req.user!.userId);
  sendSuccess(res, poll, "Results published successfully");
});

export const deletePoll = asyncHandler(async (req: Request, res: Response) => {
  await pollService.deletePoll(req.params.id as string, req.user!.userId);
  sendNoContent(res);
});
