import { Poll } from "../poll/poll.model.js";
import { PollResponse } from "./response.model.js";
import { ensurePollAcceptsResponses } from "../poll/poll.service.js";
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/errors.js";
import { generateAnonymousId } from "../../utils/helpers.js";
import { SubmitResponseInput } from "./response.validation.js";
import { PollUpdatePayload } from "../../types/index.js";

interface SubmitResult {
  response: any;
  updates: PollUpdatePayload[];
}

export async function submitResponse(
  pollId: string,
  userId: string | undefined,
  data: SubmitResponseInput
): Promise<SubmitResult> {
  const poll = await Poll.findById(pollId);
  if (!poll) throw new NotFoundError("Poll not found");

  // Validate poll is accepting responses
  ensurePollAcceptsResponses(poll);

  // Check response mode
  if (poll.responseMode === "authenticated" && !userId) {
    throw new BadRequestError("This poll requires authentication to respond");
  }

  // Prevent duplicate responses
  if (userId) {
    const existing = await PollResponse.findOne({ pollId, userId });
    if (existing) throw new ConflictError("You have already responded to this poll");
  }

  const anonId = !userId ? (data.anonymousId || generateAnonymousId()) : undefined;
  if (anonId) {
    const existing = await PollResponse.findOne({ pollId, anonymousId: anonId });
    if (existing) throw new ConflictError("This device has already responded to this poll");
  }

  // Validate answers match poll questions
  const questionMap = new Map(poll.questions.map((q) => [q._id.toString(), q]));

  for (const answer of data.answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) {
      throw new BadRequestError(`Invalid question ID: ${answer.questionId}`);
    }
    const optionExists = question.options.some(
      (o) => o._id.toString() === answer.selectedOptionId
    );
    if (!optionExists) {
      throw new BadRequestError(`Invalid option ID: ${answer.selectedOptionId} for question ${answer.questionId}`);
    }
  }

  // Save response
  const response = await PollResponse.create({
    pollId,
    userId,
    anonymousId: anonId,
    answers: data.answers,
  });

  // Increment vote counts on the poll and collect update payloads
  const updates: PollUpdatePayload[] = [];

  for (const answer of data.answers) {
    await Poll.updateOne(
      {
        _id: pollId,
        "questions._id": answer.questionId,
        "questions.options._id": answer.selectedOptionId,
      },
      {
        $inc: {
          "questions.$[q].options.$[o].votes": 1,
        },
      },
      {
        arrayFilters: [
          { "q._id": answer.questionId },
          { "o._id": answer.selectedOptionId },
        ],
      }
    );

    // Get updated vote count for the option
    const updatedPoll = await Poll.findById(pollId);
    const question = updatedPoll?.questions.find(
      (q) => q._id.toString() === answer.questionId
    );
    const option = question?.options.find(
      (o) => o._id.toString() === answer.selectedOptionId
    );

    updates.push({
      pollId,
      questionId: answer.questionId,
      optionId: answer.selectedOptionId,
      newVoteCount: option?.votes ?? 0,
      totalResponses: (updatedPoll?.totalResponses ?? 0) + 1,
    });
  }

  // Increment total response count
  await Poll.findByIdAndUpdate(pollId, { $inc: { totalResponses: 1 } });

  return { response, updates };
}

export async function getResponsesByPoll(pollId: string) {
  const responses = await PollResponse.find({ pollId })
    .populate("userId", "name email")
    .sort({ submittedAt: -1 });
  return responses;
}

export async function getPollAnalytics(pollId: string) {
  const poll = await Poll.findById(pollId);
  if (!poll) throw new NotFoundError("Poll not found");

  const analytics = poll.questions.map((question) => ({
    questionId: question._id,
    questionText: question.text,
    options: question.options.map((option) => ({
      optionId: option._id,
      optionText: option.text,
      votes: option.votes,
      percentage:
        poll.totalResponses > 0
          ? Math.round((option.votes / poll.totalResponses) * 100)
          : 0,
    })),
    totalVotes: question.options.reduce((sum, o) => sum + o.votes, 0),
  }));

  return {
    pollId: poll._id,
    title: poll.title,
    totalResponses: poll.totalResponses,
    status: poll.status,
    questions: analytics,
  };
}
