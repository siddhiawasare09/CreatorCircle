import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
    default: undefined,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer",
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  notifications: {
    proposalAccepted: {
      type: Boolean,
      default: true,
    },
    newMessages: {
      type: Boolean,
      default: true,
    },
  },
  theme: {
    type: String,
    enum: ["light", "dark"],
    default: "light",
  },
  resetPasswordToken: {
    type: String,
    default: undefined,
  },
  resetPasswordExpires: {
    type: Date,
    default: undefined,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
