import mongoose from "mongoose";
import Creator from "../models/Creator.js";
import Inquiry from "../models/Inquiry.js";
import User from "../models/User.js";

export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalCreators] = await Promise.all([
      User.countDocuments(),
      Creator.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      stats: { totalUsers, totalCreators },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load admin statistics",
    });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load users",
    });
  }
};

export const getAdminCreators = async (req, res) => {
  try {
    const creators = await Creator.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, creators });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load creator profiles",
    });
  }
};

export const getAdminInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate("creator", "name category")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, inquiries });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load inquiries",
    });
  }
};

export const deleteAdminCreator = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid creator ID",
    });
  }

  try {
    const creator = await Creator.findByIdAndDelete(req.params.id);

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Creator profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Creator profile deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete creator profile",
    });
  }
};
