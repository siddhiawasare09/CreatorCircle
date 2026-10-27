import bcrypt from "bcryptjs";
import Creator from "../models/Creator.js";
import User from "../models/User.js";

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const normalizeStrengths = (value) => {
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value.map((item) => item.trim()).filter(Boolean);
  }
  return null;
};

export const getProfile = async (req, res) => {
  try {
    const [user, creator] = await Promise.all([
      User.findById(req.userId).select("name email role"),
      Creator.findOne({ user: req.userId }),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      creatorProfileExists: Boolean(creator),
      accountType:
        creator ? "creator" : user.role === "admin" ? "admin" : "brand",
      profile: {
        name: creator?.name || user.name,
        niche: creator?.category || "",
        bio: creator?.bio || "",
        strengths: creator?.skills || [],
        socialLinks: creator?.socialLinks || {},
        rateCard: creator?.rateCard || "",
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load your profile",
    });
  }
};

export const updateProfile = async (req, res) => {
  const { name, niche, bio, strengths, socialLinks, rateCard } = req.body || {};
  const normalizedStrengths =
    strengths === undefined ? undefined : normalizeStrengths(strengths);

  if (
    (name !== undefined &&
      (typeof name !== "string" || !name.trim() || name.trim().length > 120)) ||
    (niche !== undefined &&
      (typeof niche !== "string" || !niche.trim() || niche.trim().length > 120)) ||
    (bio !== undefined &&
      (typeof bio !== "string" || !bio.trim() || bio.trim().length > 2000)) ||
    (strengths !== undefined &&
      (!normalizedStrengths ||
        normalizedStrengths.length > 30 ||
        normalizedStrengths.some((item) => item.length > 120))) ||
    (socialLinks !== undefined &&
      (!isPlainObject(socialLinks) ||
        Object.entries(socialLinks).some(
          ([key, value]) =>
            !["instagram", "linkedin", "youtube", "website"].includes(key) ||
            typeof value !== "string" ||
            value.length > 500,
        ))) ||
    (rateCard !== undefined &&
      (typeof rateCard !== "string" || rateCard.length > 120))
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide valid profile details",
    });
  }

  try {
    const creator = await Creator.findOne({ user: req.userId });
    const creatorDetailsChanged = [niche, bio, strengths, socialLinks, rateCard]
      .some((value) => value !== undefined);
    if (creatorDetailsChanged && !creator) {
      return res.status(409).json({
        success: false,
        message: "Create a creator profile before updating creator details",
      });
    }

    if (creator) {
      if (niche !== undefined) creator.category = niche.trim();
      if (bio !== undefined) creator.bio = bio.trim();
      if (normalizedStrengths !== undefined) creator.skills = normalizedStrengths;
      if (socialLinks !== undefined) {
        creator.socialLinks = {
          ...creator.socialLinks,
          ...Object.fromEntries(
            Object.entries(socialLinks).map(([key, value]) => [
              key,
              value.trim(),
            ]),
          ),
        };
      }
      if (rateCard !== undefined) creator.rateCard = rateCard.trim();
      if (name !== undefined) creator.name = name.trim();
      await creator.save();
    }

    const userUpdates = {};
    if (name !== undefined) userUpdates.name = name.trim();
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: userUpdates },
      { new: true, runValidators: true },
    ).select("name email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    const refreshedCreator = await Creator.findOne({ user: req.userId });
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        name: refreshedCreator?.name || user.name,
        niche: refreshedCreator?.category || "",
        bio: refreshedCreator?.bio || "",
        strengths: refreshedCreator?.skills || [],
        socialLinks: refreshedCreator?.socialLinks || {},
        rateCard: refreshedCreator?.rateCard || "",
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update your profile",
    });
  }
};

export const updateSettings = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    !currentPassword ||
    newPassword.length < 8
  ) {
    return res.status(400).json({
      success: false,
      message: "Enter your current password and a new password of at least 8 characters",
    });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This Google account does not have a password to change",
      });
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update your password",
    });
  }
};

export const getSettingsPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("notifications theme");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    return res.status(200).json({
      success: true,
      preferences: {
        notifications: {
          proposalAccepted:
            user.notifications?.proposalAccepted ?? true,
          newMessages: user.notifications?.newMessages ?? true,
        },
        theme: user.theme || "light",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load your settings",
    });
  }
};

export const updateSettingsPreferences = async (req, res) => {
  const { notifications, theme } = req.body || {};
  const validNotifications =
    notifications !== null &&
    typeof notifications === "object" &&
    !Array.isArray(notifications) &&
    typeof notifications.proposalAccepted === "boolean" &&
    typeof notifications.newMessages === "boolean" &&
    Object.keys(notifications).every((key) =>
      ["proposalAccepted", "newMessages"].includes(key),
    );

  if (!validNotifications || !["light", "dark"].includes(theme)) {
    return res.status(400).json({
      success: false,
      message: "Choose a valid theme and notification preferences",
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          notifications: {
            proposalAccepted: notifications.proposalAccepted,
            newMessages: notifications.newMessages,
          },
          theme,
        },
      },
      { new: true, runValidators: true },
    ).select("notifications theme");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Settings saved successfully",
      preferences: {
        notifications: user.notifications,
        theme: user.theme,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to save your settings",
    });
  }
};
