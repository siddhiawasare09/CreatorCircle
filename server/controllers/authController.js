import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

const passwordResetMessage =
  "If that email exists, a reset link has been sent";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !password.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to register right now",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    const passwordMatches = user?.password
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "This account has been suspended. Contact CreatorCircle support.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured on the server",
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to log in right now",
    });
  }
};

export const forgotPassword = async (req, res) => {
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  try {
    if (email) {
      const user = await User.findOne({ email });

      if (user?.password) {
        const resetToken = randomBytes(32).toString("hex");
        user.resetPasswordToken = createHash("sha256")
          .update(resetToken)
          .digest("hex");
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        try {
          await sendEmail({
            to: user.email,
            subject: "Reset your CreatorCircle password",
            resetToken,
          });
        } catch (error) {
          console.error("[Forgot password] Email delivery failed:", {
            name: error instanceof Error ? error.name : "Unknown error",
            code: error?.code,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: passwordResetMessage,
    });
  } catch (error) {
    console.error("[Forgot password] Request failed:", {
      name: error instanceof Error ? error.name : "Unknown error",
      code: error?.code,
    });
    return res.status(200).json({
      success: true,
      message: passwordResetMessage,
    });
  }
};

export const resetPassword = async (req, res) => {
  const { password } = req.body || {};

  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  const resetPasswordToken = createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This password reset link is invalid or has expired",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to reset your password right now",
    });
  }
};
