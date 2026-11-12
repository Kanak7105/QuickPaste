import rateLimit from "express-rate-limit";

function limiter(limit, message) {
  return rateLimit({
    windowMs: 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: message },
  });
}

export const createLimiter = limiter(10, "Too many pastes created, try again in a minute");
// Shared by the JSON view and the raw view
export const readLimiter = limiter(60, "Too many requests, try again in a minute");
export const unlockLimiter = limiter(5, "Too many unlock attempts, try again in a minute");
