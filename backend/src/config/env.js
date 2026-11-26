// Startup pe zaroori env variables check karta hai
export function validateEnv() {
  const missing = ["MONGO_URI", "JWT_SECRET"].filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing env variables: ${missing.join(", ")}`);
  if (process.env.JWT_SECRET.length < 16) {
    throw new Error("JWT_SECRET kam se kam 16 characters ka hona chahiye");
  }
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.startsWith("your_")) {
    console.warn(
      "WARNING: GROQ_API_KEY set nahi hai. /api/interviews/analyze tab tak kaam nahi karega.",
    );
  }
}
