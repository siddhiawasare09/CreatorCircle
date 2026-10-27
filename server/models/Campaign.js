import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  brandName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160,
  },
  campaignGoal: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  nicheCategory: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  deliverables: {
    type: [String],
    required: true,
    validate: {
      validator: (items) =>
        items.length > 0 && items.length <= 20 && items.every((item) => item.length <= 300),
      message: "Campaigns require 1 to 20 deliverables, each 300 characters or fewer",
    },
  },
  budget: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  status: {
    type: String,
    enum: ["active", "closed"],
    default: "active",
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

campaignSchema.index({ status: 1, createdAt: -1 });
campaignSchema.index({ brand: 1, createdAt: -1 });

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;
