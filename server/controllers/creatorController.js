import mongoose from "mongoose";
import Creator from "../models/Creator.js";

const isValidCreatorId = (id) => mongoose.isValidObjectId(id);

const requiredTextFieldsAreValid = ({ name, bio, category }) =>
  [name, bio, category].every(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

export const getCreators = async (req, res) => {
  try {
    const creators = await Creator.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, creators });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve creator profiles",
    });
  }
};

export const getCreatorById = async (req, res) => {
  if (!isValidCreatorId(req.params.id)) {
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

    return res.status(200).json({ success: true, creator });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve creator profile",
    });
  }
};

export const createCreator = async (req, res) => {
  const { name, bio, category, profileImage, skills, location, socialLinks } =
    req.body;

  if (!requiredTextFieldsAreValid({ name, bio, category })) {
    return res.status(400).json({
      success: false,
      message: "Name, bio, and category are required",
    });
  }

  if (
    skills !== undefined &&
    (!Array.isArray(skills) ||
      !skills.every((skill) => typeof skill === "string"))
  ) {
    return res.status(400).json({
      success: false,
      message: "Skills must be an array of strings",
    });
  }

  if (
    socialLinks !== undefined &&
    (socialLinks === null ||
      typeof socialLinks !== "object" ||
      Array.isArray(socialLinks))
  ) {
    return res.status(400).json({
      success: false,
      message: "Social links must be an object",
    });
  }

  if (location !== undefined && typeof location !== "string") {
    return res.status(400).json({
      success: false,
      message: "Location must be a string",
    });
  }

  if (profileImage !== undefined && typeof profileImage !== "string") {
    return res.status(400).json({
      success: false,
      message: "Profile image URL must be a string",
    });
  }

  try {
    const creator = await Creator.create({
      user: req.userId,
      name: name.trim(),
      bio: bio.trim(),
      category: category.trim(),
      profileImage: profileImage?.trim() || "",
      skills,
      location: location?.trim(),
      socialLinks,
    });

    return res.status(201).json({
      success: true,
      message: "Creator profile created",
      creator,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create creator profile",
    });
  }
};

export const updateCreator = async (req, res) => {
  if (!isValidCreatorId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid creator ID",
    });
  }

  const { name, bio, category, profileImage, skills, location, socialLinks } =
    req.body;
  const updates = {};

  if (name !== undefined) updates.name = name;
  if (bio !== undefined) updates.bio = bio;
  if (category !== undefined) updates.category = category;
  if (profileImage !== undefined) updates.profileImage = profileImage;
  if (skills !== undefined) updates.skills = skills;
  if (location !== undefined) updates.location = location;
  if (socialLinks !== undefined) updates.socialLinks = socialLinks;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one profile field to update",
    });
  }

  if (
    (updates.name !== undefined &&
      (typeof updates.name !== "string" || !updates.name.trim())) ||
    (updates.bio !== undefined &&
      (typeof updates.bio !== "string" || !updates.bio.trim())) ||
    (updates.category !== undefined &&
      (typeof updates.category !== "string" || !updates.category.trim()))
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Name, bio, and category must be non-empty strings when provided",
    });
  }

  if (
    updates.skills !== undefined &&
    (!Array.isArray(updates.skills) ||
      !updates.skills.every((skill) => typeof skill === "string"))
  ) {
    return res.status(400).json({
      success: false,
      message: "Skills must be an array of strings",
    });
  }

  if (updates.location !== undefined && typeof updates.location !== "string") {
    return res.status(400).json({
      success: false,
      message: "Location must be a string",
    });
  }

  if (
    updates.profileImage !== undefined &&
    typeof updates.profileImage !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Profile image URL must be a string",
    });
  }

  if (
    updates.socialLinks !== undefined &&
    (updates.socialLinks === null ||
      typeof updates.socialLinks !== "object" ||
      Array.isArray(updates.socialLinks))
  ) {
    return res.status(400).json({
      success: false,
      message: "Social links must be an object",
    });
  }

  for (const field of ["name", "bio", "category", "profileImage", "location"]) {
    if (typeof updates[field] === "string")
      updates[field] = updates[field].trim();
  }

  try {
    const creator = await Creator.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Creator profile not found or you do not own it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Creator profile updated",
      creator,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update creator profile",
    });
  }
};

export const deleteCreator = async (req, res) => {
  if (!isValidCreatorId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid creator ID",
    });
  }

  try {
    const creator = await Creator.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Creator profile not found or you do not own it",
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
