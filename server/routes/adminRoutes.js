import { Router } from "express";
import {
  deleteAdminCreator,
  getAdminCreators,
  getAdminInquiries,
  getAdminStats,
  getAdminUsers,
} from "../controllers/adminController.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);
router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.get("/creators", getAdminCreators);
router.get("/inquiries", getAdminInquiries);
router.delete("/creators/:id", deleteAdminCreator);

export default router;
