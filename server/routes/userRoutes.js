import { Router } from "express";
import {
  getProfile,
  getSettingsPreferences,
  updateProfile,
  updateSettings,
  updateSettingsPreferences,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/settings/preferences", authMiddleware, getSettingsPreferences);
router.put(
  "/settings/preferences",
  authMiddleware,
  updateSettingsPreferences,
);
router.put("/settings", authMiddleware, updateSettings);

export default router;
