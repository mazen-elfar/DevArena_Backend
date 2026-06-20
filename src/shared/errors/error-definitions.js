import { AppError } from "./app-error.js";

export const Errors = {
  NotFound: (resource = "Resource") => new AppError(`${resource} not found`, 404, "NOT_FOUND"),
  Unauthorized: (msg = "Authentication required") => new AppError(msg, 401, "UNAUTHORIZED"),
  Forbidden: (msg = "Insufficient permissions") => new AppError(msg, 403, "FORBIDDEN"),
  BadRequest: (msg = "Bad request") => new AppError(msg, 400, "BAD_REQUEST"),
  Conflict: (msg = "Resource already exists") => new AppError(msg, 409, "CONFLICT"),
  TooMany: (msg = "Too many requests") => new AppError(msg, 429, "TOO_MANY_REQUESTS"),
  Validation: (errors) => {
    const err = new AppError("Validation failed", 422, "VALIDATION_ERROR");
    err.errors = errors;
    return err;
  },
};
