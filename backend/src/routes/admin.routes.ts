import { Router, Request, Response } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { ForbiddenError } from "../utils/errors.js";
import { sendSuccess } from "../utils/response.js";
import { User } from "../modules/auth/user.model.js";
import { Poll } from "../modules/poll/poll.model.js";

const router = Router();

// Admin protection middleware
const requireAdminEmail = (req: Request, _res: Response, next: any) => {
  if (req.user?.email !== "cuet504@gmail.com") {
    throw new ForbiddenError("Access denied. Admin only.");
  }
  next();
};

// Admin stats route
router.get("/stats", authenticate, requireAdminEmail, async (req, res) => {
  const userCount = await User.countDocuments();
  const pollCount = await Poll.countDocuments();
  sendSuccess(res, { userCount, pollCount });
});

export default router;
