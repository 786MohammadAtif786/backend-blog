// routes/commentRoutes.js

import express from "express";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

// import { isAuthenticated } from "../middleware/auth.js";
import { isAdmin, protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/:blogId", protect, addComment);
router.get("/:blogId", getComments);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);

export default router;