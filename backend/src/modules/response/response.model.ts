import mongoose, { Schema } from "mongoose";
import { IResponse, IAnswer } from "../../types/index.js";

const answerSchema = new Schema<IAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      required: [true, "Question ID is required"],
    },
    selectedOptionId: {
      type: Schema.Types.ObjectId,
      required: [true, "Selected option ID is required"],
    },
  },
  { _id: false }
);

const responseSchema = new Schema<IResponse>(
  {
    pollId: {
      type: Schema.Types.ObjectId,
      ref: "Poll",
      required: [true, "Poll ID is required"],
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    anonymousId: {
      type: String,
      index: true,
    },

    answers: {
      type: [answerSchema],
      validate: [
        {
          validator: (val: IAnswer[]) => val.length >= 1,
          message: "At least one answer is required",
        },
      ],
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index: prevent duplicate responses per user per poll
responseSchema.index(
  { pollId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $exists: true } } }
);
responseSchema.index(
  { pollId: 1, anonymousId: 1 },
  { unique: true, partialFilterExpression: { anonymousId: { $exists: true } } }
);

export const PollResponse = mongoose.model<IResponse>("Response", responseSchema);
