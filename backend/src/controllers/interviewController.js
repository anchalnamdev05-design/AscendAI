import InterviewReport from "../models/InterviewReport.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { extractResumeText } from "../services/pdfService.js";
import { generateReport } from "../services/groqService.js";

const listFields =
  "resumeFileName jobRole matchScore profileSummary matchedSkills missingSkills createdAt";

export const analyze = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Resume PDF upload karo (form field name: "resume")');

  const { text, charCount } = await extractResumeText(req.file.buffer);
  const { jobDescription, jobRole, experience } = req.body;

  const { report, model } = await generateReport({
    resumeText: text,
    jobDescription,
    jobRole,
    experience: experience || req.user.experienceLevel,
  });

  const saved = await InterviewReport.create({
    ...report,
    userId: req.user._id,
    resumeFileName: req.file.originalname.slice(0, 120),
    resumeTextPreview: text.slice(0, 600),
    resumeCharCount: charCount,
    jobDescription,
    jobRole: jobRole || req.user.targetRole,
    experience,
    aiModel: model,
  });

  res.status(201).json({ success: true, message: "Report ready", report: saved });
});

export const listReports = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const filter = { userId: req.user._id };

  const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 80) : "";
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { jobRole: rx },
      { resumeFileName: rx },
      { matchedSkills: rx },
      { missingSkills: rx },
    ];
  }

  const [reports, total] = await Promise.all([
    InterviewReport.find(filter)
      .select(listFields)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    InterviewReport.countDocuments(filter),
  ]);

  res.json({
    success: true,
    reports,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

export const getReport = asyncHandler(async (req, res) => {
  // userId filter se dusre user ki report access nahi hoti (404 milta hai)
  const report = await InterviewReport.findOne({ _id: req.params.id, userId: req.user._id });
  if (!report) throw new ApiError(404, "Report nahi mili");
  res.json({ success: true, report });
});

export const deleteReport = asyncHandler(async (req, res) => {
  const report = await InterviewReport.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!report) throw new ApiError(404, "Report nahi mili");
  res.json({ success: true, message: "Report delete ho gayi" });
});

// Dashboard ke liye: sab kuch MongoDB se aata hai
const topSkills = (rows, field) => {
  const map = new Map();
  for (const r of rows) {
    for (const skill of r[field] || []) {
      const key = skill.trim().toLowerCase();
      if (!key) continue;
      const cur = map.get(key) || { name: skill.trim(), count: 0 };
      cur.count++;
      map.set(key, cur);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 8);
};

export const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  // Sirf zaroori light fields (questions/roadmap nahi) le rahe hain
  const rows = await InterviewReport.find({ userId })
    .select(
      "jobRole matchScore matchedSkills missingSkills resumeFileName profileSummary createdAt",
    )
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const total = await InterviewReport.countDocuments({ userId });
  const scores = rows.map((r) => r.matchScore);
  const trend = rows
    .slice(0, 10)
    .reverse()
    .map((r) => ({ id: r._id, score: r.matchScore, jobRole: r.jobRole, date: r.createdAt }));

  res.json({
    success: true,
    stats: {
      totalReports: total,
      averageScore: scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0,
      bestScore: scores.length ? Math.max(...scores) : 0,
      scoreImprovement: trend.length >= 2 ? trend[trend.length - 1].score - trend[0].score : 0,
      recentReports: rows.slice(0, 5),
      scoreTrend: trend,
      topMissingSkills: topSkills(rows, "missingSkills"),
      topMatchedSkills: topSkills(rows, "matchedSkills"),
    },
  });
});
