import asyncHandler from "express-async-handler";
import User from "../../models/auth/UserModel.js";
import generateToken from "../../helpers/generateToken.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Token from "../../models/auth/Token.js";
import crypto from "node:crypto";
import hashToken from "../../helpers/hashToken.js";
import sendEmail from "../../helpers/sendEmail.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "All fields are required!" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters!" });
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: "User already exists!" });
  }

  const user = await User.create({ name, email, password });

  const token = generateToken(user._id);

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: true,
    secure: true,
  });

  if (user) {
    const { _id, name, email, role, photo, bio, isVerified } = user;

    res
      .status(201)
      .json({ _id, name, email, role, photo, bio, isVerified, token });
  } else {
    res.status(400).json({ message: "Invalid user data!" });
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const userExists = await User.findOne({ email });

  if (!userExists) {
    return res.status(404).json({ message: "User not found!" });
  }

  const isMatch = await bcrypt.compare(password, userExists.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

  const token = generateToken(userExists._id);

  if (userExists && isMatch) {
    const { _id, name, email, role, photo, bio, isVerified } = userExists;

    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: true,
      secure: true,
    });

    res
      .status(200)
      .json({ _id, name, email, role, photo, bio, isVerified, token });
  } else {
    res.status(400).json({ message: "Invalid user data!" });
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");

  res.status(200).json({ message: "User logged out!" });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "User not found!" });
  }
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, bio, photo } = req.body;

    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    user.photo = req.body.photo || user.photo;

    const updated = await user.save();

    res.status(200).json({
      _id: updated._id,
      name: updated.name,
      email: updated.name,
      role: updated.role,
      photo: updated.photo,
      bio: updated.bio,
      isVerified: updated.isVerified,
    });
  } else {
    res.status(404).json({ message: "User not found!" });
  }
});

export const userLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "Not authorized, please login!" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded) {
    res.status(200).json(true);
  } else {
    res.status(401).json(false);
  }
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: "User is already verified!" });
  }

  let token = await Token.findOne({ userId: user._id });

  if (token) {
    await Token.deleteOne();
  }

  const verificationToken = crypto.randomBytes(64).toString("hex") + user._id;
  const hashedToken = hashToken(verificationToken);

  await new Token({
    userId: user._id,
    verificationToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  }).save();

  const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  try {
    await sendEmail(req.user.email, verificationLink, req.user.name);
    return res.status(200).json({ message: "Email sent!" });
  } catch (error) {
    console.log("Error sending email: ", error);
    return res.status(500).json({ message: "Email could not be sent!" });
  }
});

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
    return res.status(400).json({ message: "User is already verified!" });
  }

  user.isVerified = true;
  await user.save();
  res.status(200).json({ message: "User verified!" });
});
