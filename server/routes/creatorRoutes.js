import { Router } from "express";
import {
  createCreator,
  deleteCreator,
  getCreatorById,
  getCreators,
  updateCreator,
} from "../controllers/creatorController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getCreators);
router.get("/:id", getCreatorById);
router.post("/", authMiddleware, createCreator);
router.put("/:id", authMiddleware, updateCreator);
router.delete("/:id", authMiddleware, deleteCreator);

export default router;
