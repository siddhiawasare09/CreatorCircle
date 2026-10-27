import { Router } from "express";
import rateLimit from "express-rate-limit";
import { generateBio } from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post(
  "/generate-bio",
  authMiddleware,
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many bio generation requests. Please try again later.",
    },
  }),
  generateBio,
);

export default router;
