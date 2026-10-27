import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

export const googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (typeof credential !== "string" || !credential) {
    return res.status(400).json({
      success: false,
      message: "A Google credential is required",
    });
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: "Google sign-in is not configured on the server",
    });
  }

  let googleUser;

  try {
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    googleUser = ticket.getPayload();
  } catch (error) {
    const safeMessage = String(error.message || "Unknown verification error").replace(
      /[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+/g,
      "[redacted token]",
    );
    console.error("[Google auth] ID-token verification failed:", error.name, safeMessage);
    return res.status(401).json({
      success: false,
      message: "Google sign-in failed. Please try again.",
    });
  }

  if (
    !googleUser?.sub ||
    !googleUser.email ||
    !googleUser.name ||
    googleUser.email_verified !== true
  ) {
    console.error("[Google auth] Verified token missing required claims:", {
      hasGoogleId: Boolean(googleUser?.sub),
      hasEmail: Boolean(googleUser?.email),
      hasName: Boolean(googleUser?.name),
      emailVerified: googleUser?.email_verified === true,
    });
    return res.status(401).json({
      success: false,
      message: "Google account could not be verified",
    });
  }

  try {
    const email = googleUser.email.toLowerCase();
    let user = await User.findOne({ email });

    if (user) {
      if (user.googleId && user.googleId !== googleUser.sub) {
        return res.status(409).json({
          success: false,
          message: "This email is linked to a different Google account",
        });
      }

      if (!user.googleId) {
        user.googleId = googleUser.sub;
        await user.save();
      }
    } else {
      user = await User.create({
        name: googleUser.name,
        email,
        googleId: googleUser.sub,
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "This account has been suspended. Contact CreatorCircle support.",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This Google account is already linked to another user",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to complete Google sign-in right now",
    });
  }
};
