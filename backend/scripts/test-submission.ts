import mongoose from "mongoose";
import dotenv from "dotenv";
import { Poll } from "../src/modules/poll/poll.model.js";
import { PollResponse } from "../src/modules/response/response.model.js";
import { submitResponse } from "../src/modules/response/response.service.js";
import { generateAnonymousId } from "../src/utils/helpers.js";

dotenv.config();

async function runTest() {
  let createdPollId: string | null = null;
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("No MONGODB_URI found");
    
    await mongoose.connect(uri);
    console.log("Connected to MongoDB for testing.");

    // 1. Create a dummy poll
    console.log("Creating dummy poll...");
    const poll = await Poll.create({
      title: "Test Poll",
      description: "Testing anonymous submissions",
      createdBy: new mongoose.Types.ObjectId(), // Fake owner
      status: "active",
      responseMode: "anonymous",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
      settings: {
        requireName: false,
        allowMultipleVotes: false,
        showResults: "always"
      },
      questions: [
        {
          text: "What is your favorite color?",
          type: "single",
          isRequired: true,
          options: [
            { text: "Red" },
            { text: "Blue" }
          ]
        }
      ]
    });
    
    createdPollId = poll._id.toString();
    console.log("Created Poll ID:", createdPollId);

    const questionId = poll.questions[0]._id.toString();
    const optionId = poll.questions[0].options[0]._id.toString();

    // 2. Submit First Anonymous Response
    console.log("Submitting first anonymous response...");
    await submitResponse(createdPollId as string, undefined, {
      answers: [
        {
          questionId,
          selectedOptionId: optionId
        }
      ]
    });
    console.log("First anonymous response submitted successfully!");

    // 3. Submit Second Anonymous Response
    console.log("Submitting second anonymous response...");
    await submitResponse(createdPollId as string, undefined, {
      answers: [
        {
          questionId,
          selectedOptionId: optionId
        }
      ]
    });
    console.log("Second anonymous response submitted successfully! The bug is officially fixed!");

  } catch (error: any) {
    console.error("Test failed with error:", error.message || error);
    if (error.code === 11000) {
      console.error("Duplicate key error detected! The index fix might not have applied properly.");
    }
  } finally {
    // 4. Cleanup
    if (createdPollId) {
      console.log("Cleaning up test data...");
      await Poll.findByIdAndDelete(createdPollId);
      await PollResponse.deleteMany({ pollId: createdPollId });
      console.log("Cleanup complete.");
    }
    
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest();
