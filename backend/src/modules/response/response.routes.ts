import { Router } from "express";
import { submitResponse, getResponses, getAnalytics } from "./response.controller.js";
import { authenticate, optionalAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { submitResponseSchema } from "./response.validation.js";

const router = Router();

// POST /api/responses/:pollId — Submit a response (optional auth for anonymous polls)
router.post("/:pollId", optionalAuth, validate(submitResponseSchema), submitResponse);

// GET /api/responses/:pollId — Get all responses for a poll (auth required — poll owner)
router.get("/:pollId", authenticate, getResponses);

// GET /api/responses/:pollId/analytics — Get live analytics for a poll
router.get("/:pollId/analytics", authenticate, getAnalytics);

export default router;
