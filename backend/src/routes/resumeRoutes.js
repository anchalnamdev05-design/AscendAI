import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import {
  listResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  improve,
  tailor,
} from "../controllers/resumeController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
const router = Router();
router.use(protect);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    file.mimetype === "application/pdf"
      ? cb(null, true)
      : cb(new ApiError(400, "Only PDF files are supported")),
});
router.get("/", listResumes);
router.post("/", createResume);
router.post("/improve", upload.single("resume"), improve);
router.post("/tailor", tailor);
router.get("/:id", getResume);
router.put("/:id", updateResume);
router.delete("/:id", deleteResume);
export default router;
