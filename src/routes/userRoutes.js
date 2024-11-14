// Import required modules
import express from "express";
import {
  changePassword,
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

// Create a new router instance
const router = express.Router();

// User authentication routes
router.post("/register", registerUser); // Register a new user
router.post("/login", loginUser); // Log in an existing user
router.post("/logout", logoutUser); // Log out the current user
router.get("/login-status", userLoginStatus); // Check the login status

// User management routes (protected)
router.get("/user", protect, getUser); // Get the logged-in user's information
router.patch("/user", protect, updateUser); // Update the logged-in user's information
router.patch("/change-password", protect, changePassword); // Change the logged-in user's password

// Email verification routes
router.post("/verify-email", protect, verifyEmail); // Verify the logged-in user's email
router.post("/verify-user/:verificationToken", verifyUser); // Verify a user with a token

// Password reset routes
router.post("/forgot-password", forgotPassword); // Request a password reset
router.post("/reset-password/:resetPasswordToken", resetPassword); // Reset the password using a token

// Admin routes (protected)
router.delete("/admin/users/:id", protect, adminMiddleware, deleteUser); // Delete a user by ID
router.get("/admin/users", protect, creatorMiddleware, getAllUsers); // Get all users

// Export the router for use in the main application
export default router;
