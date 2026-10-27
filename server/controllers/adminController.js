import mongoose from "mongoose";
import Creator from "../models/Creator.js";
import Campaign from "../models/Campaign.js";
import Inquiry from "../models/Inquiry.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCreators,
      creatorUserIds,
      totalCampaigns,
      totalInquiries,
      pendingInquiries,
      acceptedInquiries,
      declinedInquiries,
    ] = await Promise.all([
      User.countDocuments(),
      Creator.countDocuments(),
      Creator.distinct("user"),
      Campaign.countDocuments(),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({
        $or: [{ status: "pending" }, { status: { $exists: false } }],
      }),
      Inquiry.countDocuments({ status: "accepted" }),
      Inquiry.countDocuments({ status: "declined" }),
    ]);

    const totalBrands = await User.countDocuments({
      role: "customer",
      _id: { $nin: creatorUserIds },
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCreators,
        totalBrands,
        totalCampaigns,
        totalInquiries,
        pendingInquiries,
        acceptedInquiries,
        declinedInquiries,
      },
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
    const [registeredUsers, creatorUserIds] = await Promise.all([
      User.find()
        .select("name email role isSuspended createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      Creator.distinct("user"),
    ]);

    const creatorIds = new Set(creatorUserIds.map((id) => String(id)));
    const users = registeredUsers.map((user) => ({
      ...user,
      accountType:
        user.role === "admin"
          ? "admin"
          : creatorIds.has(String(user._id))
            ? "creator"
            : "brand",
    }));

    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load users",
    });
  }
};

export const updateAdminUserStatus = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  if (typeof req.body?.isSuspended !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Provide a valid suspension status",
    });
  }

  if (String(req.userId) === String(req.params.id) && req.body.isSuspended) {
    return res.status(400).json({
      success: false,
      message: "You cannot suspend your own account",
    });
  }

  try {
    const targetUser = await User.findById(req.params.id).select(
      "name email role isSuspended",
    );
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (targetUser.role === "admin" && req.body.isSuspended) {
      return res.status(400).json({
        success: false,
        message: "Admin accounts cannot be suspended here",
      });
    }

    targetUser.isSuspended = req.body.isSuspended;
    await targetUser.save();
    return res.status(200).json({
      success: true,
      message: targetUser.isSuspended
        ? "User suspended"
        : "User reactivated",
      user: targetUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update user status",
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

export const deleteAdminInquiry = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid inquiry ID",
    });
  }

  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inquiry deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete inquiry",
    });
  }
};

export const getAdminPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("creator", "name")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, posts });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load portfolio posts",
    });
  }
};

export const deleteAdminPost = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid post ID",
    });
  }

  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Portfolio post not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Portfolio post deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete portfolio post",
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
    const creator = await Creator.findById(req.params.id);

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Creator profile not found",
      });
    }

    await Post.deleteMany({ creator: creator._id });
    await creator.deleteOne();

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
