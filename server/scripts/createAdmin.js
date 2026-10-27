import dotenv from "dotenv";
import mongoose from "mongoose";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import User from "../models/User.js";

dotenv.config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env"),
});

const email = process.argv[2]?.trim().toLowerCase();
let exitCode = 0;

try {
  if (!email) {
    console.error("Usage: npm run make-admin -- admin@example.com");
    exitCode = 1;
  } else {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email });

    if (!user) {
      console.error(
        `No user found for ${email}. Register this email in the app first, then run this command again.`,
      );
      exitCode = 1;
    } else {
      user.role = "admin";
      await user.save();
      console.log(`Successfully promoted ${email} to admin.`);
    }
  }
} catch (error) {
  console.error(
    "Failed to create or promote admin:",
    error instanceof Error ? error.name : "Unknown error",
  );
  exitCode = 1;
} finally {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error(
      "Failed to disconnect from MongoDB:",
      error instanceof Error ? error.name : "Unknown error",
    );
    exitCode = 1;
  }

  process.exitCode = exitCode;
}
