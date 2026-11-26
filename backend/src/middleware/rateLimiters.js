import rateLimit from "express-rate-limit";

const make = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

export const apiLimiter = make(
  15 * 60 * 1000,
  300,
  "Bahut zyada requests. Thodi der baad try karo",
);
export const authLimiter = make(
  15 * 60 * 1000,
  20,
  "Bahut zyada login/register attempts. 15 minute baad try karo",
);
export const analyzeLimiter = make(
  60 * 60 * 1000,
  15,
  "Ek ghante mein 15 se zyada analysis allowed nahi hain",
);
