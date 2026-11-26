import mongoose from "mongoose";
import Resume from "../models/Resume.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { improveResume, tailorResume } from "../services/resumeAIService.js";
const fields = [
  "title",
  "template",
  "source",
  "targetRole",
  "jobDescription",
  "personal",
  "summary",
  "education",
  "experience",
  "projects",
  "certifications",
  "achievements",
  "skills",
  "originalFileName",
  "aiNotes",
];
const clean = (body) =>
  Object.fromEntries(fields.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));
export const listResumes = asyncHandler(async (req, res) => {
  const items = await Resume.find({ userId: req.user._id })
    .sort({ updatedAt: -1 })
    .select("title targetRole source template updatedAt createdAt");
  res.json({ success: true, data: items });
});
export const getResume = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid resume ID");
  const item = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!item) throw new ApiError(404, "Resume not found");
  res.json({ success: true, data: item });
});
export const createResume = asyncHandler(async (req, res) => {
  const item = await Resume.create({ ...clean(req.body), userId: req.user._id });
  res.status(201).json({ success: true, data: item });
});
export const updateResume = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid resume ID");
  const item = await Resume.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: clean(req.body) },
    { new: true, runValidators: true },
  );
  if (!item) throw new ApiError(404, "Resume not found");
  res.json({ success: true, data: item });
});
export const deleteResume = asyncHandler(async (req, res) => {
  const item = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!item) throw new ApiError(404, "Resume not found");
  res.json({ success: true, message: "Resume deleted" });
});
export const improve = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "PDF resume upload karo");
  const data = await improveResume(
    req.file.buffer,
    req.file.originalname,
    req.body.targetRole,
    req.body.jobDescription,
  );
  res.json({ success: true, data });
});
export const tailor = asyncHandler(async (req, res) => {
  if (!req.body.jobDescription || req.body.jobDescription.trim().length < 50)
    throw new ApiError(400, "Job description kam se kam 50 characters ki honi chahiye");
  const data = await tailorResume(req.body.resume, req.body.jobDescription);
  res.json({ success: true, data });
});
