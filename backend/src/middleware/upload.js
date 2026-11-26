import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const maxMb = Number(process.env.MAX_FILE_SIZE_MB) || 5;

// memoryStorage: file disk pe save nahi hoti, sirf RAM mein parse hoke discard ho jaati hai
export const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const okMime = file.mimetype === "application/pdf";
    const okExt = file.originalname.toLowerCase().endsWith(".pdf");
    if (!okMime || !okExt) return cb(new ApiError(400, "Sirf PDF file upload kar sakte ho"));
    cb(null, true);
  },
}).single("resume");
