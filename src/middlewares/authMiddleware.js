// Import required modules
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/auth/UserModel.js";

/**
 * Middleware to protect routes by verifying JWT and user existence.
 */
export const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // Check if token is provided
    if (!token) {
      return res.status(401).json({ message: "Not authorized, please login!" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database
    const user = await User.findById(decoded.id).select("-password");

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User  not found!" });
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed!" });
  }
});

/**
 * Middleware to restrict access to admin users only.
 */
export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  res.status(403).json({ message: "Not authorized as an admin!" });
});

/**
 * Middleware to restrict access to creators and admins.
 */
export const creatorMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === "creator" || req.user.role === "admin")) {
    return next();
  }

  res.status(403).json({ message: "Not authorized!" });
});

/**
 * Middleware to ensure the user has verified their email.
 */
export const verifiedMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isVerified) {
    return next();
  }

  res.status(403).json({ message: "Please verify your email address!" });
});
