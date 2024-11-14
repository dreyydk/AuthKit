import express from "express";
import {
  forgotPassword,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateUser,
  userLoginStatus,
  verifyEmail,
  verifyUser,
} from "../controllers/auth/userController.js";
import {
  adminMiddleware,
  creatorMiddleware,
  protect,
} from "../middlewares/authMiddleware.js";
import {
  deleteUser,
  getAllUsers,
} from "../controllers/auth/adminController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/user", protect, getUser);
router.patch("/user", protect, updateUser);

router.delete("/admin/users/:id", protect, adminMiddleware, deleteUser);
router.get("/admin/users", protect, creatorMiddleware, getAllUsers);

router.get("/login-status", userLoginStatus);

router.post("/verify-email", protect, verifyEmail);
router.post("/verify-user/:verificationToken", verifyUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetPasswordToken", resetPassword);

export default router;
