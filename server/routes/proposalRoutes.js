import { Router } from "express";
import rateLimit from "express-rate-limit";
import { generateAiPitch } from "../controllers/proposalController.js";
import {
  createProposal,
  getMyProposals,
  updateProposalStatus,
} from "../controllers/applicationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import brandMiddleware from "../middleware/brandMiddleware.js";
import creatorMiddleware from "../middleware/creatorMiddleware.js";

const router = Router();

router.get("/my-proposals", authMiddleware, creatorMiddleware, getMyProposals);
router.post("/", authMiddleware, creatorMiddleware, createProposal);
router.patch(
  "/:id/status",
  authMiddleware,
  brandMiddleware,
  updateProposalStatus,
);
router.post(
  "/generate-ai-pitch",
  authMiddleware,
  creatorMiddleware,
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many proposal requests. Please try again later.",
    },
  }),
  generateAiPitch,
);

export default router;
