import Groq from "groq-sdk";
import { ApiError } from "../utils/ApiError.js";
import { aiReportSchema } from "../validators/aiReportSchema.js";

const MAX_RESUME_CHARS = 7000;
const MAX_JD_CHARS = 5000;

let client;
function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.startsWith("your_")) {
    throw new ApiError(
      503,
      "AI service configure nahi hai: backend/.env mein GROQ_API_KEY set karo",
    );
  }
  if (!client) {
    client = new Groq({
      apiKey,
      baseURL: process.env.GROQ_BASE_URL || undefined, // sirf testing ke liye
      timeout: 60000,
      maxRetries: 1,
    });
  }
  return client;
}

const SYSTEM_PROMPT = `You are an expert technical recruiter and interview coach.
You compare a candidate's resume against a job description and produce an honest, personalised interview-preparation report.

STRICT RULES:
- Use ONLY information present in the resume and job description. NEVER invent experience, projects, employers, degrees or skills.
- If something important is missing from the resume (e.g. no experience duration, no projects, no education), list it in "missingInformation".
- matchedSkills = skills required by the job that the resume clearly shows. missingSkills = required skills the resume does not show.
- Be realistic with matchScore (0-100); do not inflate.
- Respond with ONE valid JSON object only, no markdown, no extra text.

JSON SHAPE (exact keys):
{
  "matchScore": number,
  "profileSummary": string (3-4 sentences),
  "jobCompatibility": string (2-3 sentences),
  "relevantExperience": string[],
  "missingInformation": string[],
  "strengths": string[],
  "weaknesses": string[],
  "matchedSkills": string[],
  "missingSkills": string[],
  "jobInsights": { "requiredSkills": string[], "preferredTechnologies": string[], "qualifications": string[], "experienceRequired": string, "responsibilities": string[] },
  "technicalQuestions": [ { "question": string, "difficulty": "Beginner"|"Intermediate"|"Advanced", "category": "Role-specific"|"Based on your skills"|"Based on missing skills", "answerGuideline": string } ] (10-12 items, mix of difficulties),
  "behavioralQuestions": [ { "question": string, "type": "HR"|"Behavioral"|"Situational", "answerGuideline": string } ] (8-10 items),
  "preparationRoadmap": [ { "day": number, "title": string, "topics": string[], "exercises": string[], "priority": "High"|"Medium"|"Low" } ] (7 days, day 1..7, missing skills first),
  "recommendations": string[] (5-7 actionable items),
  "readiness": { "level": "Not Ready"|"Needs Work"|"Almost Ready"|"Ready", "summary": string }
}`;

function buildUserPrompt({ resumeText, jobDescription, jobRole, experience }) {
  return `JOB ROLE: ${jobRole || "(not provided - infer from job description)"}
CANDIDATE EXPERIENCE (self-reported): ${experience || "(not provided - infer only from resume, otherwise mark as missing)"}

=== JOB DESCRIPTION ===
${jobDescription.slice(0, MAX_JD_CHARS)}

=== RESUME TEXT ===
${resumeText.slice(0, MAX_RESUME_CHARS)}

Return the JSON report now.`;
}

function mapGroqError(err) {
  if (err instanceof ApiError) return err;
  const s = err?.status;
  if (s === 401)
    return new ApiError(503, "GROQ_API_KEY galat hai ya expire ho gayi. .env check karo");
  if (s === 404 || (s === 400 && /model/i.test(err?.message || "")))
    return new ApiError(
      503,
      `Groq model "${process.env.GROQ_MODEL}" available nahi hai. .env mein GROQ_MODEL badlo`,
    );
  if (s === 413)
    return new ApiError(413, "Resume/JD AI ke liye bahut lambi hai. Chhoti karke try karo");
  if (s === 429)
    return new ApiError(429, "Groq rate limit lag gayi. 1 minute baad dobara try karo");
  if (s >= 500)
    return new ApiError(502, "Groq service abhi unavailable hai. Thodi der baad try karo");
  if (err?.name?.includes("Timeout") || err?.code === "ETIMEDOUT")
    return new ApiError(504, "AI ne bahut der laga di. Dobara try karo");
  if (err?.name?.includes("Connection"))
    return new ApiError(502, "Groq se connect nahi ho paaya. Internet check karo");
  return new ApiError(502, "AI service error aaya. Dobara try karo");
}

function parseJson(raw) {
  if (!raw || !raw.trim()) throw new Error("empty");
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const a = cleaned.indexOf("{");
    const b = cleaned.lastIndexOf("}");
    if (a === -1 || b <= a) throw new Error("no json");
    return JSON.parse(cleaned.slice(a, b + 1));
  }
}

export async function generateReport(input) {
  const groq = getClient();
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(input) },
  ];

  let lastIssue = "";
  // Malformed JSON ya Zod fail pe 1 baar retry
  for (let attempt = 1; attempt <= 2; attempt++) {
    let completion;
    try {
      completion = await groq.chat.completions.create({
        model,
        messages,
        temperature: attempt === 1 ? 0.3 : 0.1,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      });
    } catch (err) {
      throw mapGroqError(err);
    }

    const raw = completion?.choices?.[0]?.message?.content;
    try {
      const parsed = aiReportSchema.safeParse(parseJson(raw));
      if (parsed.success) return { report: parsed.data, model };
      lastIssue = parsed.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
    } catch {
      lastIssue = raw?.trim() ? "malformed JSON" : "empty response";
    }
  }
  console.error("Groq invalid response:", lastIssue);
  throw new ApiError(502, "AI ne sahi format mein report nahi di. Dobara try karo");
}
