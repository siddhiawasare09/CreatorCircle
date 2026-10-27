import mongoose from "mongoose";
import Creator from "../models/Creator.js";
import Post from "../models/Post.js";

const isValidPostId = (id) => mongoose.isValidObjectId(id);
const mediaTypes = new Set(["image", "video", "link"]);
const editableFields = ["title", "description", "mediaUrl", "mediaType", "tags"];

const validatePostFields = (fields, { creating = false } = {}) => {
  if (
    creating &&
    (typeof fields.title !== "string" || !fields.title.trim())
  ) {
    return "Title is required";
  }

  if (
    fields.title !== undefined &&
    (typeof fields.title !== "string" ||
      !fields.title.trim() ||
      fields.title.trim().length > 100)
  ) {
    return "Title must be a non-empty string of at most 100 characters";
  }

  if (
    creating &&
    (typeof fields.mediaUrl !== "string" || !fields.mediaUrl.trim())
  ) {
    return "Media URL is required";
  }

  if (fields.mediaUrl !== undefined) {
    if (typeof fields.mediaUrl !== "string" || !fields.mediaUrl.trim()) {
      return "Media URL must be a valid HTTP or HTTPS URL";
    }

    try {
      const url = new URL(fields.mediaUrl.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return "Media URL must be a valid HTTP or HTTPS URL";
      }
    } catch {
      return "Media URL must be a valid HTTP or HTTPS URL";
    }
  }

  if (
    creating &&
    (typeof fields.mediaType !== "string" || !mediaTypes.has(fields.mediaType))
  ) {
    return "Media type must be image, video, or link";
  }

  if (
    fields.mediaType !== undefined &&
    (typeof fields.mediaType !== "string" || !mediaTypes.has(fields.mediaType))
  ) {
    return "Media type must be image, video, or link";
  }

  if (
    fields.description !== undefined &&
    (typeof fields.description !== "string" || fields.description.length > 1000)
  ) {
    return "Description must be a string of at most 1000 characters";
  }

  if (fields.tags !== undefined) {
    if (
      !Array.isArray(fields.tags) ||
      fields.tags.length > 5 ||
      !fields.tags.every(
        (tag) => typeof tag === "string" && tag.trim().length > 0,
      )
    ) {
      return "Tags must be an array of at most 5 non-empty strings";
    }
  }

  return "";
};

const postFieldsFrom = (body) => {
  const fields = {};
  for (const field of editableFields) {
    if (body[field] !== undefined) fields[field] = body[field];
  }
  return fields;
};

const isMongooseValidationError = (error) =>
  error instanceof mongoose.Error.ValidationError;

export const createPost = async (req, res) => {
  const fields = postFieldsFrom(req.body || {});
  const validationMessage = validatePostFields(fields, { creating: true });

  if (validationMessage) {
    return res.status(400).json({ success: false, message: validationMessage });
  }

  try {
    const creator = await Creator.findOne({ user: req.userId }).select("_id");
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Create a creator profile before adding portfolio posts",
      });
    }

    const post = await Post.create({
      ...fields,
      title: fields.title.trim(),
      description: fields.description?.trim() || "",
      mediaUrl: fields.mediaUrl.trim(),
      tags: fields.tags?.map((tag) => tag.trim()) || [],
      creator: creator._id,
      user: req.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Portfolio post created",
      post,
    });
  } catch (error) {
    return res.status(isMongooseValidationError(error) ? 400 : 500).json({
      success: false,
      message: isMongooseValidationError(error)
        ? error.message
        : "Unable to create portfolio post",
    });
  }
};

export const updatePost = async (req, res) => {
  if (!isValidPostId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid post ID",
    });
  }

  const fields = postFieldsFrom(req.body || {});
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one post field to update",
    });
  }

  const validationMessage = validatePostFields(fields);
  if (validationMessage) {
    return res.status(400).json({ success: false, message: validationMessage });
  }

  for (const field of ["title", "description", "mediaUrl"]) {
    if (typeof fields[field] === "string") fields[field] = fields[field].trim();
  }
  if (fields.tags) fields.tags = fields.tags.map((tag) => tag.trim());

  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: fields },
      { new: true, runValidators: true },
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or you do not own it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Portfolio post updated",
      post,
    });
  } catch (error) {
    return res.status(isMongooseValidationError(error) ? 400 : 500).json({
      success: false,
      message: isMongooseValidationError(error)
        ? error.message
        : "Unable to update portfolio post",
    });
  }
};

export const deletePost = async (req, res) => {
  if (!isValidPostId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid post ID",
    });
  }

  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or you do not own it",
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

export const getCreatorPosts = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid creator ID",
    });
  }

  try {
    const creator = await Creator.findById(req.params.id).select("_id");
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Creator profile not found",
      });
    }

    const posts = await Post.find({ creator: creator._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ success: true, posts });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load creator portfolio posts",
    });
  }
};

export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ success: true, posts });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load your portfolio posts",
    });
  }
};
