import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Creator",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    default: "",
    maxlength: 1000,
  },
  mediaUrl: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value) => {
        try {
          const url = new URL(value);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      message: "Media URL must be a valid HTTP or HTTPS URL",
    },
  },
  mediaType: {
    type: String,
    enum: ["image", "video", "link"],
    required: true,
  },
  tags: {
    type: [
      {
        type: String,
        trim: true,
      },
    ],
    default: [],
    validate: {
      validator: (tags) => tags.length <= 5,
      message: "A post can have at most 5 tags",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

postSchema.index({ creator: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
