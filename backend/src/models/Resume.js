import mongoose from "mongoose";
const { Schema } = mongoose;
const itemSchema = new Schema(
  {
    title: String,
    subtitle: String,
    date: String,
    location: String,
    bullets: [String],
    link: String,
  },
  { _id: true },
);
const resumeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, trim: true, default: "My Resume" },
    template: { type: String, enum: ["modern"], default: "modern" },
    source: { type: String, enum: ["scratch", "improved"], default: "scratch" },
    targetRole: String,
    jobDescription: String,
    personal: {
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      portfolio: String,
    },
    summary: String,
    education: [itemSchema],
    experience: [itemSchema],
    projects: [itemSchema],
    certifications: [itemSchema],
    achievements: [String],
    skills: { technical: [String], soft: [String] },
    originalFileName: String,
    aiNotes: [String],
  },
  { timestamps: true },
);
resumeSchema.index({ userId: 1, updatedAt: -1 });
export default mongoose.model("Resume", resumeSchema);
