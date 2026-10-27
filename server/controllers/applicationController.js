import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";
import Proposal from "../models/Proposal.js";

export const createProposal = async (req, res) => {
  const {
    campaignId,
    subjectLine,
    proposalBody,
    keyHighlights = [],
  } = req.body || {};

  if (
    !mongoose.isValidObjectId(campaignId) ||
    typeof subjectLine !== "string" ||
    !subjectLine.trim() ||
    subjectLine.trim().length > 200 ||
    typeof proposalBody !== "string" ||
    !proposalBody.trim() ||
    proposalBody.trim().length > 6000 ||
    !Array.isArray(keyHighlights) ||
    keyHighlights.length > 10 ||
    !keyHighlights.every(
      (item) =>
        typeof item === "string" &&
        item.trim().length > 0 &&
        item.trim().length <= 300,
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide a valid campaign, subject, proposal, and highlights",
    });
  }

  try {
    const campaign = await Campaign.findOne({
      _id: campaignId,
      status: "active",
    });
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "This campaign is no longer accepting applications",
      });
    }

    const proposal = await Proposal.create({
      campaign: campaign._id,
      creator: req.creator._id,
      creatorUser: req.userId,
      brand: campaign.brand,
      brandName: campaign.brandName,
      campaignTitle: campaign.title,
      subjectLine: subjectLine.trim(),
      proposalBody: proposalBody.trim(),
      keyHighlights: keyHighlights.map((item) => item.trim()),
    });

    return res.status(201).json({
      success: true,
      message: "Proposal submitted",
      proposal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to submit your proposal",
    });
  }
};

export const getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ creatorUser: req.userId })
      .populate("creator", "name category")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, proposals });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load your applications",
    });
  }
};

export const updateProposalStatus = async (req, res) => {
  const { status } = req.body || {};
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid proposal ID",
    });
  }
  if (!["accepted", "declined"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Choose Accepted or Declined",
    });
  }

  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      brand: req.userId,
    });
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      });
    }

    proposal.status = status;
    proposal.updatedAt = new Date();
    await proposal.save();
    return res.status(200).json({
      success: true,
      message: "Proposal status updated",
      proposal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update proposal status",
    });
  }
};
