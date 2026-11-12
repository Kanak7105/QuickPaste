// Error with an HTTP status code. Thrown for expected errors (e.g. 400, 401).
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500;
  let message = err.message;

  // Errors thrown by express.json()
  if (err.type === "entity.too.large") message = "Paste is too large (max 100 KB)";
  if (err.type === "entity.parse.failed") message = "Invalid JSON body";

  // Never leak internals or stack traces for unexpected errors
  if (status >= 500) {
    console.error(err);
    status = 500;
    message = "Internal server error";
  }

  res.status(status).json({ error: message });
}
