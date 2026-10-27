import { Router } from "express";
import {
  createPost,
  deletePost,
  getMyPosts,
  updatePost,
} from "../controllers/postController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/mine", authMiddleware, getMyPosts);
router.post("/", authMiddleware, createPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;
