import mongoose, { Schema } from "mongoose";
import { IPoll, IQuestion, IOption } from "../../types/index.js";

const optionSchema = new Schema<IOption>({
  text: {
    type: String,
    required: [true, "Option text is required"],
    trim: true,
    maxlength: [200, "Option text must be at most 200 characters"],
  },
  votes: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const questionSchema = new Schema<IQuestion>({
  text: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
    maxlength: [500, "Question text must be at most 500 characters"],
  },
  options: {
    type: [optionSchema],
    validate: [
      {
        validator: (val: IOption[]) => val.length >= 2,
        message: "Each question must have at least 2 options",
      },
      {
        validator: (val: IOption[]) => val.length <= 10,
        message: "Each question can have at most 10 options",
      },
    ],
  },
});

const pollSchema = new Schema<IPoll>(
  {
    title: {
      type: String,
      required: [true, "Poll title is required"],
      trim: true,
      maxlength: [200, "Poll title must be at most 200 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must be at most 1000 characters"],
    },

    questions: {
      type: [questionSchema],
      validate: [
        {
          validator: (val: IQuestion[]) => val.length >= 1,
          message: "Poll must have at least 1 question",
        },
        {
          validator: (val: IQuestion[]) => val.length <= 20,
          message: "Poll can have at most 20 questions",
        },
      ],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft",
    },

    responseMode: {
      type: String,
      enum: ["anonymous", "authenticated"],
      default: "anonymous",
    },

    isPublic: {
      type: Boolean,
      default: true,
    },

    publicSlug: {
      type: String,
      unique: true,
      sparse: true,
    },

    expiresAt: {
      type: Date,
    },

    publishedAt: {
      type: Date,
    },

    resultsPublished: {
      type: Boolean,
      default: false,
    },

    showResultsAfterVoting: {
      type: Boolean,
      default: false,
    },

    totalResponses: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: check if poll is expired
pollSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Indexes for performance
pollSchema.index({ createdBy: 1, status: 1 });
pollSchema.index({ publicSlug: 1 });
pollSchema.index({ status: 1, expiresAt: 1 });

export const Poll = mongoose.model<IPoll>("Poll", pollSchema);
