import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import { sanitize } from "./middleware/sanitize.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:5173").split(","),
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(sanitize);
app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) =>
  res.json({ success: true, message: "AscendAI backend is running" }),
);
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/resumes", resumeRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
