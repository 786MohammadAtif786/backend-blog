import express from "express"

import {
 registerUser,
 loginUser,
 verifyEmail,
 refreshToken,
 logoutUser,
 getMe,
 getAllUsers,
 toggleBlockUser
} from "../controllers/userControllers.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/register",registerUser)

router.post("/login",loginUser)

router.post("/refresh", refreshToken);

router.post("/logout", logoutUser);
router.get("/me", protect, getMe)
router.get("/verify/:token",verifyEmail);
router.get("/admin/users", protect, getAllUsers);
router.patch("/admin/block/:id", protect, toggleBlockUser)


export default router