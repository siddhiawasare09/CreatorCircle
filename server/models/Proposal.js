import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Creator",
    required: true,
  },
  creatorUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  brandName: {
    type: String,
    required: true,
    trim: true,
  },
  campaignTitle: {
    type: String,
    required: true,
    trim: true,
  },
  subjectLine: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  proposalBody: {
    type: String,
    required: true,
    trim: true,
    maxlength: 6000,
  },
  keyHighlights: {
    type: [String],
    default: [],
    validate: {
      validator: (items) => items.length <= 10 && items.every((item) => item.length <= 300),
      message: "Proposal highlights must be 300 characters or fewer",
    },
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

proposalSchema.index({ creatorUser: 1, createdAt: -1 });
proposalSchema.index({ campaign: 1, createdAt: -1 });

const Proposal = mongoose.model("Proposal", proposalSchema);

export default Proposal;
