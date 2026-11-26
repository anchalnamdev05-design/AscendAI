import mongoose from "mongoose";

const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    question: String,
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
    category: String,
    answerGuideline: String,
  },
  { _id: false },
);

const behavioralSchema = new Schema(
  {
    question: String,
    type: { type: String, enum: ["HR", "Behavioral", "Situational"] },
    answerGuideline: String,
  },
  { _id: false },
);

const roadmapSchema = new Schema(
  {
    day: Number,
    title: String,
    topics: [String],
    exercises: [String],
    priority: { type: String, enum: ["High", "Medium", "Low"] },
  },
  { _id: false },
);

const reportSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    resumeFileName: { type: String, trim: true },
    resumeTextPreview: { type: String, maxlength: 600 }, // poora resume store nahi karte (privacy)
    resumeCharCount: Number,
    jobDescription: { type: String, required: true },
    jobRole: { type: String, trim: true },
    experience: { type: String, trim: true },
    matchScore: { type: Number, min: 0, max: 100, required: true },
    profileSummary: String,
    jobCompatibility: String,
    relevantExperience: [String],
    missingInformation: [String],
    strengths: [String],
    weaknesses: [String],
    matchedSkills: [String],
    missingSkills: [String],
    technicalQuestions: [questionSchema],
    behavioralQuestions: [behavioralSchema],
    preparationRoadmap: [roadmapSchema],
    recommendations: [String],
    readiness: { level: String, summary: String },
    jobInsights: {
      requiredSkills: [String],
      preferredTechnologies: [String],
      qualifications: [String],
      experienceRequired: String,
      responsibilities: [String],
    },
    aiModel: String,
  },
  { timestamps: true },
);

reportSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("InterviewReport", reportSchema);
