import mongoose from "mongoose";

const creatorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: "",
  },
  skills: {
    type: [String],
    default: [],
  },
  location: {
    type: String,
    default: "",
  },
  socialLinks: {
    type: Object,
    default: {},
  },
  rateCard: {
    type: String,
    default: "",
    trim: true,
    maxlength: 120,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Creator = mongoose.model("Creator", creatorSchema);

export default Creator;
