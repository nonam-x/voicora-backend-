import mongoose from "mongoose";
import dotenv from "dotenv";
import { PollResponse } from "../src/modules/response/response.model.js";

dotenv.config();

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("No MONGODB_URI found");
    
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    console.log("Dropping old indexes...");
    await PollResponse.collection.dropIndexes();
    console.log("Old indexes dropped.");

    console.log("Rebuilding indexes based on new schema...");
    await PollResponse.syncIndexes();
    console.log("Indexes rebuilt successfully.");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();
