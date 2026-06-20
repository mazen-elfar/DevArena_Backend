import { sendError } from "../utils/api-response.js";

export function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  if (err.isOperational) return sendError(res, err);
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return sendError(res, { statusCode: 401, message: "Invalid token", code: "UNAUTHORIZED", isOperational: true });
  }
  if (err.name === "SyntaxError") {
    return sendError(res, { statusCode: 400, message: "Invalid JSON", code: "BAD_REQUEST", isOperational: true });
  }
  return sendError(res, { statusCode: 500, message: "Internal server error", code: "INTERNAL_ERROR", isOperational: true });
}
