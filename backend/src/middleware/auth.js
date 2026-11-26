import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/token.js";

// Har protected route se pehle chalta hai: "Authorization: Bearer <token>" verify karta hai
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new ApiError(401, "Login required: token missing");

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, "Session expire ho gaya ya token invalid hai. Dobara login karo");
  }

  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, "User ab exist nahi karta");
  req.user = user;
  next();
});
