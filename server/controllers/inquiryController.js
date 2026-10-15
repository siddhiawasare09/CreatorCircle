import mongoose from "mongoose";
import Creator from "../models/Creator.js";
import Inquiry from "../models/Inquiry.js";

export const createInquiry = async (req, res) => {
  const { creator: creatorId, name, email, message } = req.body;

  if (
    !mongoose.isValidObjectId(creatorId) ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !message.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Creator, name, valid email, and message are required",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email address",
    });
  }

  try {
    const creator = await Creator.findById(creatorId).select("_id");
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Creator profile not found",
      });
    }

    const inquiry = await Inquiry.create({
      customer: req.userId || null,
      creator: creatorId,
      name: name.trim(),
      email: normalizedEmail,
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Your inquiry was sent",
      inquiry: {
        id: inquiry._id,
        creator: inquiry.creator,
        name: inquiry.name,
        email: inquiry.email,
        message: inquiry.message,
        createdAt: inquiry.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to send your inquiry right now",
    });
  }
};
