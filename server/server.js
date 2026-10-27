import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import creatorRoutes from "./routes/creatorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import aiChatRoutes from "./routes/aiChatRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use("/api/ai/chat", aiChatRoutes);
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);
app.use("/api/creators", creatorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CreatorCircle API is running",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`CreatorCircle server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
