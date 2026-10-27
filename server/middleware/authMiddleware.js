import jwt from "jsonwebtoken";
import User from "../models/User.js";

const invalidTokenResponse = {
  message: "Session expired or invalid token. Please log in again.",
};

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decoded === "string" || !decoded.userId) {
      return res.status(401).json(invalidTokenResponse);
    }

    const user = await User.findById(decoded.userId).select(
      "name email role isSuspended",
    );
    if (!user) {
      return res.status(401).json(invalidTokenResponse);
    }
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "This account has been suspended. Contact CreatorCircle support.",
      });
    }

    req.userId = decoded.userId;
    req.user = user;
    return next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      return res.status(401).json(invalidTokenResponse);
    }

    console.error("[Authentication] Failed to verify account:", {
      name: error instanceof Error ? error.name : "Unknown error",
    });
    return res.status(500).json({
      success: false,
      message: "Unable to verify your account",
    });
  }
};

export default authMiddleware;
