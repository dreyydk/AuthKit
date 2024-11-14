// Import necessary modules
import asyncHandler from "express-async-handler";
import User from "../../models/auth/UserModel.js";
import generateToken from "../../helpers/generateToken.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Token from "../../models/auth/Token.js";
import crypto from "node:crypto";
import hashToken from "../../helpers/hashToken.js";
import {
  passwordResetEmail,
  verificationEmail,
} from "../../helpers/sendEmail.js";

// Register a new user
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters!" });
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User  already exists!" });
  }

  // Create a new user
  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  // Set cookie with token
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: true,
    secure: true,
  });

  // Respond with user data
  const { _id, role, photo, bio, isVerified } = user;
  res
    .status(201)
    .json({ _id, name, email, role, photo, bio, isVerified, token });
});

// Login user
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (!userExists) {
    return res.status(404).json({ message: "User  not found!" });
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, userExists.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

  // Generate token and set cookie
  const token = generateToken(userExists._id);
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: true,
    secure: true,
  });

  // Respond with user data
  const { _id, name, role, photo, bio, isVerified } = userExists;
  res
    .status(200)
    .json({ _id, name, email, role, photo, bio, isVerified, token });
});

// Logout user
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "User  logged out!" });
});

// Get logged-in user data
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (user) {
    return res.status(200).json(user);
  }
  return res.status(404).json({ message: "User  not found!" });
});

// Update user profile
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User  not found!" });
  }

  // Update user fields
  const { name, bio, photo } = req.body;
  user.name = name || user.name;
  user.bio = bio || user.bio;
  user.photo = photo || user.photo;

  const updated = await user.save();
  res.status(200).json(updated);
});

// Check user login status
export const userLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Not authorized, please login!" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json(true);
  } catch {
    return res.status(401).json(false);
  }
});

// Verify user email
export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User  not found!" });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: "User  is already verified!" });
  }

  // Generate verification token
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await Token.deleteOne({ userId: user._id });
  }

  const verificationToken = crypto.randomBytes(64).toString("hex") + user._id;
  const hashedToken = hashToken(verificationToken);

  await new Token({
    userId: user._id,
    verificationToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }).save();

  const verificationLink = `${process.env.CLIENT_URL}/verify-user/${verificationToken}`;
  try {
    await verificationEmail(req.user.email, verificationLink, req.user.name);
    return res.status(200).json({ message: "Email sent!" });
  } catch (error) {
    console.error("Error sending email: ", error);
    return res.status(500).json({ message: "Email could not be sent!" });
  }
});

// Verify user with token
export const verifyUser = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;
  if (!verificationToken) {
    return res.status(400).json({ message: "Invalid verification token!" });
  }

  const hashedToken = hashToken(verificationToken);
  const userToken = await Token.findOne({
    verificationToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    return res
      .status(400)
      .json({ message: "Invalid or expired verification token!" });
  }

  const user = await User.findById(userToken.userId);
  if (user.isVerified) {
    return res.status(400).json({ message: "User  is already verified!" });
  }

  user.isVerified = true;
  await user.save();
  res.status(200).json({ message: "User  verified!" });
});

// Request password reset
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required!" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User  not found!" });
  }

  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  const passwordResetToken = crypto.randomBytes(64).toString("hex") + user._id;
  const hashedToken = hashToken(passwordResetToken);

  await new Token({
    userId: user._id,
    passwordResetToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  }).save();

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}`;
  try {
    await passwordResetEmail(email, resetLink);
    return res.status(200).json({ message: "Email sent!" });
  } catch (error) {
    console.error("Error sending email: ", error);
    return res.status(500).json({ message: "Email could not be sent!" });
  }
});

// Reset user password
export const resetPassword = asyncHandler(async (req, res) => {
  const { resetPasswordToken } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required!" });
  }

  const hashedToken = hashToken(resetPasswordToken);
  const userToken = await Token.findOne({
    passwordResetToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    return res.status(400).json({ message: "Invalid or expired reset token!" });
  }

  const user = await User.findById(userToken.userId);
  user.password = password;
  await user.save();

  res.status(200).json({ message: "Password reset successfully!" });
});

// Change user password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate input fields
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const user = await User.findById(req.user._id);
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid password!" });
  }

  // Update password
  user.password = newPassword;
  await user.save();
  return res.status(200).json({ message: "Password changed successfully!" });
});
