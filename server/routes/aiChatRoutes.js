import express from "express";
import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { chat } from "../controllers/aiChatController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 7 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = new Set([
      "audio/webm",
      "audio/ogg",
      "audio/wav",
      "audio/mpeg",
      "audio/mp4",
      "audio/aac",
      "audio/flac",
    ]);
    if (!allowedTypes.has(file.mimetype)) {
      callback(new Error("Unsupported audio type"));
      return;
    }
    callback(null, true);
  },
});
const parseAudioUpload = (req, res, next) => {
  upload.single("audio")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    return res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Audio recording must be 7 MB or smaller"
          : error.message || "Unable to process the audio recording",
    });
  });
};

router.post(
  "/",
  authMiddleware,
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many assistant requests. Please try again later.",
    },
  }),
  express.json({ limit: "10mb" }),
  parseAudioUpload,
  chat,
);

export default router;
