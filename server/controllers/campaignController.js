import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";
import Proposal from "../models/Proposal.js";

const parseDeliverables = (value) => {
  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value.map((item) => item.trim()).filter(Boolean);
  }
  return null;
};

const validateCampaign = (body) => {
  const deliverables = parseDeliverables(body.deliverables);
  const campaignGoal = body.campaignGoal || body.description;
  const nicheCategory = body.nicheCategory || body.category;
  if (
    typeof body.title !== "string" ||
    !body.title.trim() ||
    body.title.trim().length > 160 ||
    typeof campaignGoal !== "string" ||
    !campaignGoal.trim() ||
    campaignGoal.trim().length > 2000 ||
    typeof nicheCategory !== "string" ||
    !nicheCategory.trim() ||
    nicheCategory.trim().length > 120 ||
    !deliverables ||
    deliverables.length === 0 ||
    deliverables.length > 20 ||
    deliverables.some((item) => item.length > 300) ||
    typeof body.budget !== "string" ||
    !body.budget.trim() ||
    body.budget.trim().length > 120
  ) {
    return null;
  }

  return {
    title: body.title.trim(),
    campaignGoal: campaignGoal.trim(),
    nicheCategory: nicheCategory.trim(),
    deliverables,
    budget: body.budget.trim(),
  };
};

export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "active" })
      .populate("brand", "name")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, campaigns });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load campaigns",
    });
  }
};

export const getBrandCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ brand: req.userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, campaigns });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load your campaigns",
    });
  }
};

export const getCampaignApplicants = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid campaign ID" });
  }

  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      brand: req.userId,
    }).select("_id");
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    const proposals = await Proposal.find({
      campaign: campaign._id,
      brand: req.userId,
    })
      .populate("creator", "name category profileImage")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, proposals });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load campaign applicants",
    });
  }
};

export const createCampaign = async (req, res) => {
  const values = validateCampaign(req.body || {});
  if (!values) {
    return res.status(400).json({
      success: false,
      message:
        "Provide a campaign title, description, niche category, deliverables, and budget",
    });
  }

  try {
    const campaign = await Campaign.create({
      ...values,
      brandName: req.brand.name,
      brand: req.userId,
    });
    return res.status(201).json({
      success: true,
      message: "Campaign created",
      campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create campaign",
    });
  }
};

export const updateCampaign = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid campaign ID" });
  }
  const values = validateCampaign(req.body || {});
  if (!values || !["active", "closed"].includes(req.body.status || "active")) {
    return res.status(400).json({
      success: false,
      message: "Provide valid campaign fields and status",
    });
  }

  try {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, brand: req.userId },
      {
        ...values,
        brandName: req.brand.name,
        status: req.body.status || "active",
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    );
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }
    return res.status(200).json({ success: true, campaign });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update campaign",
    });
  }
};

export const deleteCampaign = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid campaign ID" });
  }

  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      brand: req.userId,
    });
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }
    return res.status(200).json({ success: true, message: "Campaign deleted" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete campaign",
    });
  }
};
