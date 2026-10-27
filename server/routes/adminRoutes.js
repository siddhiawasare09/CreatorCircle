import { Router } from "express";
import {
  deleteAdminCreator,
  deleteAdminInquiry,
  deleteAdminPost,
  getAdminCreators,
  getAdminInquiries,
  getAdminPosts,
  getAdminStats,
  getAdminUsers,
  updateAdminUserStatus,
} from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware, adminAuth);
router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.put("/users/:id/status", updateAdminUserStatus);
router.get("/creators", getAdminCreators);
router.get("/inquiries", getAdminInquiries);
router.delete("/inquiries/:id", deleteAdminInquiry);
router.get("/posts", getAdminPosts);
router.delete("/posts/:id", deleteAdminPost);
router.delete("/creators/:id", deleteAdminCreator);

export default router;
