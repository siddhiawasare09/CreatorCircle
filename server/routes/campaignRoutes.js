import { Router } from "express";
import {
  createCampaign,
  deleteCampaign,
  getCampaignApplicants,
  getBrandCampaigns,
  getCampaigns,
  updateCampaign,
} from "../controllers/campaignController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import brandMiddleware from "../middleware/brandMiddleware.js";

const router = Router();

router.get("/", getCampaigns);
router.get("/my-campaigns", authMiddleware, brandMiddleware, getBrandCampaigns);
router.get("/mine", authMiddleware, brandMiddleware, getBrandCampaigns);
router.get(
  "/:id/applicants",
  authMiddleware,
  brandMiddleware,
  getCampaignApplicants,
);
router.post("/", authMiddleware, brandMiddleware, createCampaign);
router.put("/:id", authMiddleware, brandMiddleware, updateCampaign);
router.delete("/:id", authMiddleware, brandMiddleware, deleteCampaign);

export default router;
