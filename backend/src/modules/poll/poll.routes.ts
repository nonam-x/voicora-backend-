import { Router } from "express";
import {
  createPoll,
  getMyPolls,
  getPollById,
  getPollBySlug,
  updatePoll,
  activatePoll,
  closePoll,
  publishResults,
  deletePoll,
} from "./poll.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createPollSchema, updatePollSchema } from "./poll.validation.js";

const router = Router();

// Public route — access poll via shareable slug
router.get("/public/:slug", getPollBySlug);

// Protected routes — require authentication
router.use(authenticate);

// POST /api/polls — Create poll
router.post("/", validate(createPollSchema), createPoll);

// GET /api/polls/mine — Get current user's polls
router.get("/mine", getMyPolls);

// GET /api/polls/:id — Get poll by ID
router.get("/:id", getPollById);

// PUT /api/polls/:id — Update poll
router.put("/:id", validate(updatePollSchema), updatePoll);

// PATCH /api/polls/:id/activate — Activate poll
router.patch("/:id/activate", activatePoll);

// PATCH /api/polls/:id/close — Close poll
router.patch("/:id/close", closePoll);

// PATCH /api/polls/:id/publish-results — Publish final results
router.patch("/:id/publish-results", publishResults);

// DELETE /api/polls/:id — Delete poll
router.delete("/:id", deletePoll);

export default router;
