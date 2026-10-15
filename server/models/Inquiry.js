import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Creator",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Inquiry = mongoose.model("Inquiry", inquirySchema);

export default Inquiry;
