import { Router } from "express";
import {
  analyze,
  listReports,
  getReport,
  deleteReport,
  getStats,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/auth.js";
import { uploadResume } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { analyzeLimiter } from "../middleware/rateLimiters.js";
import { analyzeSchema } from "../validators/interviewValidator.js";

const router = Router();
router.use(protect); // is router ke saare routes login-protected hain

// multer pehle chalta hai (multipart parse), phir body validate hoti hai
router.post("/analyze", analyzeLimiter, uploadResume, validate(analyzeSchema), analyze);
router.get("/stats", getStats);
router.get("/reports", listReports);
router.get("/reports/:id", getReport);
router.delete("/reports/:id", deleteReport);

export default router;
