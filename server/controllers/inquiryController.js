import mongoose from "mongoose";
import Creator from "../models/Creator.js";
import Inquiry from "../models/Inquiry.js";
import User from "../models/User.js";

export const createInquiry = async (req, res) => {
  const { creator: creatorId, name, email, subject, message } = req.body || {};

  if (
    !mongoose.isValidObjectId(creatorId) ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof subject !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !subject.trim() ||
    !message.trim() ||
    subject.trim().length > 120 ||
    message.trim().length > 1000
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Creator, name, valid email, subject, and message are required. Subject must be 120 characters or fewer and message 1000 characters or fewer.",
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
    const [creator, customer] = await Promise.all([
      Creator.findById(creatorId).select("_id"),
      User.findById(req.userId).select("role"),
    ]);
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Creator profile not found",
      });
    }
    if (!customer || customer.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customer accounts can start an inquiry",
      });
    }

    const inquiry = await Inquiry.create({
      customer: req.userId,
      creator: creatorId,
      name: name.trim(),
      email: normalizedEmail,
      subject: subject.trim(),
      message: message.trim(),
      messages: [{ sender: req.userId, text: message.trim() }],
    });
    await inquiry.populate([
      { path: "customer", select: "name email" },
      {
        path: "creator",
        select: "name user",
        populate: { path: "user", select: "name" },
      },
      { path: "messages.sender", select: "name email" },
    ]);

    return res.status(201).json({
      success: true,
      message: "Inquiry sent successfully",
      inquiry: {
        id: inquiry._id,
        creator: inquiry.creator,
        name: inquiry.name,
        email: inquiry.email,
        subject: inquiry.subject,
        message: inquiry.message,
        messages: inquiry.messages,
        status: inquiry.status,
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

export const getCreatorInquiries = async (req, res) => {
  try {
    const creator = await Creator.findOne({ user: req.userId }).select("_id");
    if (!creator) {
      return res.status(200).json({ success: true, inquiries: [] });
    }

    const inquiries = await Inquiry.find({ creator: creator._id })
      .populate("customer", "name email")
      .populate({
        path: "creator",
        select: "name user",
        populate: { path: "user", select: "name" },
      })
      .populate("messages.sender", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, inquiries });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load your inquiries",
    });
  }
};

export const getCustomerInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ customer: req.userId })
      .populate("customer", "name email")
      .populate({
        path: "creator",
        select: "name category profileImage user",
        populate: { path: "user", select: "name" },
      })
      .populate("messages.sender", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, inquiries });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load your inquiries",
    });
  }
};

export const addInquiryMessage = async (req, res) => {
  const { text } = req.body || {};
  if (typeof text !== "string" || !text.trim() || text.trim().length > 1000) {
    return res.status(400).json({
      success: false,
      message: "A reply of 1 to 1000 characters is required",
    });
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid inquiry ID",
    });
  }

  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    const isCustomer = String(inquiry.customer) === String(req.userId);
    const isCreator = await Creator.exists({
      _id: inquiry.creator,
      user: req.userId,
    });

    if (!isCustomer && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this inquiry",
      });
    }

    inquiry.messages.push({
      sender: req.userId,
      text: text.trim(),
    });
    await inquiry.save();
    await inquiry.populate("customer", "name email");
    await inquiry.populate({
      path: "creator",
      select: "name user",
      populate: { path: "user", select: "name" },
    });
    await inquiry.populate("messages.sender", "name email");

    return res.status(201).json({
      success: true,
      message: "Reply sent",
      inquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to send your reply",
    });
  }
};

export const updateInquiryStatus = async (req, res) => {
  const { status } = req.body || {};
  if (!["pending", "accepted", "declined"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Choose Pending, Accepted, or Declined",
    });
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid inquiry ID",
    });
  }

  try {
    const creator = await Creator.findOne({ user: req.userId }).select("_id");
    if (!creator) {
      return res.status(403).json({
        success: false,
        message: "A creator profile is required to manage inquiries",
      });
    }

    const inquiry = await Inquiry.findOneAndUpdate(
      { _id: req.params.id, creator: creator._id },
      { status },
      { new: true, runValidators: true },
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inquiry status updated",
      inquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update inquiry status",
    });
  }
};
