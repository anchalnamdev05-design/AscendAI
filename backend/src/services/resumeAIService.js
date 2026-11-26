import Groq from "groq-sdk";
import { ApiError } from "../utils/ApiError.js";
import { extractResumeText } from "./pdfService.js";
let client;
function groqClient() {
  if (!process.env.GROQ_API_KEY) throw new ApiError(503, "Groq API key configure nahi hai");
  if (!client)
    client = new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 60000, maxRetries: 1 });
  return client;
}
function parse(raw) {
  const s = (raw || "")
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(s);
  } catch {
    const a = s.indexOf("{");
    const b = s.lastIndexOf("}");
    if (a < 0 || b <= a) throw new ApiError(502, "AI response parse nahi hua");
    return JSON.parse(s.slice(a, b + 1));
  }
}
const shape = `Return ONLY JSON with keys: title, targetRole, summary, personal{name,email,phone,location,linkedin,github,portfolio}, education[], experience[], projects[], certifications[], achievements[], skills{technical[],soft[]}, aiNotes[]. Each education/experience/project/certification item uses {title,subtitle,date,location,bullets[],link}. Never invent facts, dates, metrics, skills, qualifications, employers or links. Use empty strings/arrays when absent. Improve wording while preserving facts. Keep resume concise and ATS friendly.`;
export async function improveResume(buffer, originalFileName, targetRole, jobDescription) {
  const { text } = await extractResumeText(buffer);
  const prompt = `${shape}\nTarget role: ${targetRole || "Not provided"}\nJob description: ${(jobDescription || "").slice(0, 4500)}\nOriginal resume text:\n${text.slice(0, 8500)}`;
  const r = await groqClient().chat.completions.create({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: "You are a careful ATS resume editor. Never fabricate candidate information.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });
  const data = parse(r.choices?.[0]?.message?.content);
  return {
    ...data,
    originalFileName,
    source: "improved",
    template: "modern",
    aiNotes: Array.isArray(data.aiNotes) ? data.aiNotes : [],
  };
}
export async function tailorResume(resume, jobDescription) {
  const prompt = `Tailor this resume to the job description. ${shape} Keep every claim grounded in current resume. Do not add a skill unless present in source resume. You may reorder and rewrite. Return JSON only.\nRESUME: ${JSON.stringify(resume).slice(0, 9000)}\nJOB: ${jobDescription.slice(0, 4500)}`;
  const r = await groqClient().chat.completions.create({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: "You tailor ATS resumes accurately and never fabricate." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });
  return parse(r.choices?.[0]?.message?.content);
}
