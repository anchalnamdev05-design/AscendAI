import { z } from "zod";

const strArr = z.array(z.string()).default([]);

// Groq ke JSON ko store karne se pehle validate karne ka schema.
// AI kabhi-kabhi thoda galat format deta hai, isliye enums ko flexible rakha hai (catch).
export const aiReportSchema = z.object({
  matchScore: z.coerce.number().min(0).max(100).transform(Math.round),
  profileSummary: z.string().min(1),
  jobCompatibility: z.string().default(""),
  relevantExperience: strArr,
  missingInformation: strArr,
  strengths: strArr,
  weaknesses: strArr,
  matchedSkills: strArr,
  missingSkills: strArr,
  jobInsights: z
    .object({
      requiredSkills: strArr,
      preferredTechnologies: strArr,
      qualifications: strArr,
      experienceRequired: z.string().default(""),
      responsibilities: strArr,
    })
    .default({
      requiredSkills: [],
      preferredTechnologies: [],
      qualifications: [],
      experienceRequired: "",
      responsibilities: [],
    }),
  technicalQuestions: z
    .array(
      z.object({
        question: z.string().min(1),
        difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).catch("Intermediate"),
        category: z.string().default("General"),
        answerGuideline: z.string().default(""),
      }),
    )
    .min(1),
  behavioralQuestions: z
    .array(
      z.object({
        question: z.string().min(1),
        type: z.enum(["HR", "Behavioral", "Situational"]).catch("HR"),
        answerGuideline: z.string().default(""),
      }),
    )
    .min(1),
  preparationRoadmap: z
    .array(
      z.object({
        day: z.coerce.number().int().min(1),
        title: z.string().min(1),
        topics: strArr,
        exercises: strArr,
        priority: z.enum(["High", "Medium", "Low"]).catch("Medium"),
      }),
    )
    .min(1),
  recommendations: strArr,
  readiness: z
    .object({ level: z.string().default(""), summary: z.string().default("") })
    .default({ level: "", summary: "" }),
});
