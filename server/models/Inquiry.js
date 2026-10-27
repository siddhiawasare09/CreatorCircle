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
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
    default: "Collaboration inquiry",
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Inquiry = mongoose.model("Inquiry", inquirySchema);

export default Inquiry;
