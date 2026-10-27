import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  forgotPassword,
  login,
  register,
  resetPassword,
} from "../controllers/authController.js";
import { googleLogin } from "../controllers/googleAuthController.js";

const router = Router();
const createPasswordResetLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many password reset requests. Please try again later.",
    },
  });

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/forgot-password", createPasswordResetLimiter(), forgotPassword);
router.post("/reset-password/:token", createPasswordResetLimiter(), resetPassword);

export default router;