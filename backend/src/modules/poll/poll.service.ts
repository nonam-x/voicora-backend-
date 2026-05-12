import { Poll } from "./poll.model.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../utils/errors.js";
import { generateSlug, isPollExpired } from "../../utils/helpers.js";
import { CreatePollInput, UpdatePollInput } from "./poll.validation.js";

export async function createPoll(userId: string, data: CreatePollInput) {
  const slug = generateSlug();

  const poll = await Poll.create({
    ...data,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    createdBy: userId,
    publicSlug: slug,
  });

  return poll;
}

export async function getPollsByUser(userId: string) {
  const polls = await Poll.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .select("-__v");
  return polls;
}

export async function getPollById(pollId: string) {
  const poll = await Poll.findById(pollId).populate("createdBy", "name email");
  if (!poll) {
    throw new NotFoundError("Poll not found");
  }
  return poll;
}

export async function getPollBySlug(slug: string) {
  const poll = await Poll.findOne({ publicSlug: slug });
  if (!poll) {
    throw new NotFoundError("Poll not found");
  }
  return poll;
}

export async function updatePoll(pollId: string, userId: string, data: UpdatePollInput) {
  const poll = await Poll.findById(pollId);
  if (!poll) {
    throw new NotFoundError("Poll not found");
  }
  if (poll.createdBy.toString() !== userId) {
    throw new ForbiddenError("You can only update your own polls");
  }
  if (poll.status === "closed") {
    throw new BadRequestError("Cannot update a closed poll");
  }

  Object.assign(poll, {
    ...data,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : poll.expiresAt,
  });

  await poll.save();
  return poll;
}

export async function activatePoll(pollId: string, userId: string) {
  const poll = await Poll.findById(pollId);
  if (!poll) throw new NotFoundError("Poll not found");
  if (poll.createdBy.toString() !== userId) {
    throw new ForbiddenError("You can only activate your own polls");
  }
  if (poll.status !== "draft") {
    throw new BadRequestError("Only draft polls can be activated");
  }

  poll.status = "active";
  poll.publishedAt = new Date();
  await poll.save();
  return poll;
}

export async function closePoll(pollId: string, userId: string) {
  const poll = await Poll.findById(pollId);
  if (!poll) throw new NotFoundError("Poll not found");
  if (poll.createdBy.toString() !== userId) {
    throw new ForbiddenError("You can only close your own polls");
  }
  if (poll.status === "closed") {
    throw new BadRequestError("Poll is already closed");
  }

  poll.status = "closed";
  await poll.save();
  return poll;
}

export async function publishResults(pollId: string, userId: string) {
  const poll = await Poll.findById(pollId);
  if (!poll) throw new NotFoundError("Poll not found");
  if (poll.createdBy.toString() !== userId) {
    throw new ForbiddenError("You can only publish results for your own polls");
  }

  poll.resultsPublished = true;
  await poll.save();
  return poll;
}

export async function deletePoll(pollId: string, userId: string) {
  const poll = await Poll.findById(pollId);
  if (!poll) throw new NotFoundError("Poll not found");
  if (poll.createdBy.toString() !== userId) {
    throw new ForbiddenError("You can only delete your own polls");
  }

  await Poll.findByIdAndDelete(pollId);
  return { deleted: true };
}

/**
 * Check if a poll accepts responses (active + not expired).
 */
export function ensurePollAcceptsResponses(poll: any): void {
  if (poll.status !== "active") {
    throw new BadRequestError("This poll is not currently accepting responses");
  }
  if (isPollExpired(poll.expiresAt)) {
    throw new BadRequestError("This poll has expired");
  }
}
