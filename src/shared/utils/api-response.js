export function sendSuccess(res, data = null, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendPaginated(res, { items, total, page, limit, hasMore }) {
  return res.status(200).json({
    success: true,
    data: { items, pagination: { total, page, limit, hasMore } },
  });
}

export function sendError(res, error) {
  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || "Internal server error",
    code: error.code || "INTERNAL_ERROR",
  };
  if (error.errors) response.errors = error.errors;
  if (process.env.NODE_ENV === "development" && !error.isOperational) {
    response.stack = error.stack;
  }
  return res.status(statusCode).json(response);
}
