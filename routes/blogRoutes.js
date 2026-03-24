import express from "express";
import { isAdmin, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

import {
    createBlog,
    deleteBlog,
    publishBlog,
    searchBlogs,
    getPublishedBlogs,
    getRelatedBlogs,
    toggleLikeBlog,
    getAllBlogs,
    getSingleBlog,
    getAllBlogsAdmin,
    getSingleBlogAdmin,
    getMyBlogs,
    updateBlog,
    getBlogsByCategory,
    getSingleBlogViews,
} from "../controllers/blogController.js";

// const router = express.Router();

// router.get("/", getPublishedBlogs);

// router.post("/", protect, upload.single("image"), createBlog);

// router.delete("/:id", protect, deleteBlog);
// router.get("/admin", protect, isAdmin, getAllBlogs);
// router.put("/publish/:id", protect, isAdmin, publishBlog);
// router.get("/related/:id", getRelatedBlogs);
// router.put("/like/:id", protect, toggleLikeBlog);
// router.get("/admin/blogs", protect, isAdmin, getAllBlogsAdmin);
// router.get("/admin/:id", protect, isAdmin, getSingleBlogAdmin);

// router.get("/my", protect, getMyBlogs);
// router.put("/:id", protect, updateBlog);
// router.get("/:id", getSingleBlog);
// router.get("/category/:category", getBlogsByCategory);
// router.get("/search", searchBlogs)
// router.get("/:id", getSingleBlogViews);
// router.delete("/:id", protect, deleteBlog);
// router.put("/approve/:id", protect, isAdmin, approveBlog);


const router = express.Router();

// ✅ simple routes
router.get("/", getPublishedBlogs);
router.post("/", protect, upload.single("image"), createBlog);

// ✅ specific routes FIRST
router.get("/search", searchBlogs);
router.get("/category/:category", getBlogsByCategory);
router.get("/related/:id", getRelatedBlogs);
router.get("/my", protect, getMyBlogs);

// ✅ admin routes
router.get("/admin", protect, isAdmin, getAllBlogs);
router.get("/admin/blogs", protect, isAdmin, getAllBlogsAdmin);
router.get("/admin/:id", protect, isAdmin, getSingleBlogAdmin);

// ✅ actions
router.put("/publish/:id", protect, isAdmin, publishBlog);
router.put("/like/:id", protect, toggleLikeBlog);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

// 🔥 LAST me dynamic route
router.get("/:id", getSingleBlog);

export default router;