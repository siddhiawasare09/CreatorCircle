import { Router } from "express";
import { createInquiry } from "../controllers/inquiryController.js";
import optionalAuthMiddleware from "../middleware/optionalAuthMiddleware.js";

const router = Router();

router.post("/", optionalAuthMiddleware, createInquiry);

export default router;
