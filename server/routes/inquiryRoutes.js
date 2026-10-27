import { Router } from "express";
import {
  createInquiry,
  addInquiryMessage,
  getCustomerInquiries,
  getCreatorInquiries,
  updateInquiryStatus,
} from "../controllers/inquiryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, createInquiry);
router.get("/received", authMiddleware, getCreatorInquiries);
router.get("/mine", authMiddleware, getCustomerInquiries);
router.post("/:id/messages", authMiddleware, addInquiryMessage);
router.patch("/:id/status", authMiddleware, updateInquiryStatus);

export default router;
