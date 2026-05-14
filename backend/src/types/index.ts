import { Types, Document } from "mongoose";

// ======================== USER ========================

export type UserRole = "admin" | "user";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ======================== POLL ========================

export interface IOption {
  _id: Types.ObjectId;
  text: string;
  votes: number;
}

export interface IQuestion {
  _id: Types.ObjectId;
  text: string;
  options: IOption[];
}

export type PollStatus = "draft" | "active" | "closed";
export type ResponseMode = "anonymous" | "authenticated";

export interface IPoll extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  questions: IQuestion[];
  createdBy: Types.ObjectId;
  status: PollStatus;
  responseMode: ResponseMode;
  isPublic: boolean;
  publicSlug: string;
  expiresAt?: Date;
  publishedAt?: Date;
  resultsPublished: boolean;
  showResultsAfterVoting: boolean;
  totalResponses: number;
  createdAt: Date;
  updatedAt: Date;
}

// ======================== RESPONSE ========================

export interface IAnswer {
  questionId: Types.ObjectId;
  selectedOptionId: Types.ObjectId;
}

export interface IResponse extends Document {
  _id: Types.ObjectId;
  pollId: Types.ObjectId;
  userId?: Types.ObjectId;
  anonymousId?: string;
  answers: IAnswer[];
  submittedAt: Date;
}

// ======================== API ========================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

// ======================== JWT ========================

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// ======================== SOCKET ========================

export interface PollUpdatePayload {
  pollId: string;
  questionId: string;
  optionId: string;
  newVoteCount: number;
  totalResponses: number;
}

export interface PollRoomPayload {
  pollId: string;
}
