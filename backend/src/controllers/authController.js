import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/token.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) throw new ApiError(409, "Ye email already registered hai");
  const user = await User.create({ name, email, password });
  res
    .status(201)
    .json({ success: true, message: "Account ban gaya", token: signToken(user._id), user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  // same message dono cases mein, taaki attacker ko pata na chale email exist karta hai ya nahi
  if (!user || !(await user.comparePassword(password)))
    throw new ApiError(401, "Email ya password galat hai");
  res.json({ success: true, message: "Login successful", token: signToken(user._id), user });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  Object.assign(req.user, req.body); // validator sirf allowed fields chhodta hai (email/password nahi)
  await req.user.save();
  res.json({ success: true, message: "Profile update ho gayi", user: req.user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword)))
    throw new ApiError(400, "Current password galat hai");
  if (currentPassword === newPassword)
    throw new ApiError(400, "Naya password purane se alag hona chahiye");
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: "Password change ho gaya" });
});
