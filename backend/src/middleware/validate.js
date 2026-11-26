import { ApiError } from "../utils/ApiError.js";

// Zod schema se req.body validate + clean karta hai
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return next(new ApiError(400, details[0]?.message || "Invalid input", details));
  }
  req.body = result.data;
  next();
};
