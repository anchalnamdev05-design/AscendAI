import multer from "multer";

export const notFound = (req, res) =>
  res
    .status(404)
    .json({ success: false, message: `Route nahi mila: ${req.method} ${req.originalUrl}` });

export function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.message || "Server error";
  let details = err.details;

  if (err instanceof multer.MulterError) {
    status = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? `File bahut badi hai (max ${process.env.MAX_FILE_SIZE_MB || 5}MB)`
        : err.code === "LIMIT_UNEXPECTED_FILE"
          ? 'File ko "resume" field name se bhejo'
          : err.message;
  } else if (err.name === "ValidationError") {
    status = 400;
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    message = details[0]?.message || "Validation error";
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID";
  } else if (err.code === 11000) {
    status = 409;
    message = "Ye email already registered hai";
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Request body valid JSON nahi hai";
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request bahut badi hai";
  }

  if (status >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === "production") message = "Server error. Baad mein try karo";
  }

  res.status(status).json({ success: false, message, ...(details ? { details } : {}) });
}
