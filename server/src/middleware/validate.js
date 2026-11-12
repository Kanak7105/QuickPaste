import { HttpError } from "./errorHandler.js";
import { EXPIRY_OPTIONS } from "../services/expiryService.js";

const MAX_CONTENT_BYTES = 100 * 1024;
const ID_PATTERN = /^[A-Za-z0-9]{8}$/;

export const LANGUAGES = [
  "plaintext", "javascript", "typescript", "python", "java", "c", "cpp",
  "csharp", "go", "rust", "php", "ruby", "kotlin", "swift", "sql",
  "bash", "json", "yaml", "markdown", "html", "css",
];

function checkPassword(password) {
  if (typeof password !== "string" || password.length < 4 || password.length > 64) {
    throw new HttpError(400, "Password must be 4-64 characters");
  }
}

export function validateCreate(req, res, next) {
  const { content, language, expiresIn, burnAfterRead, password } = req.body ?? {};

  if (typeof content !== "string" || content.trim() === "") {
    throw new HttpError(400, "Content is required");
  }
  // Measure bytes, not characters (emoji and non-ASCII take more than 1 byte)
  if (Buffer.byteLength(content, "utf8") > MAX_CONTENT_BYTES) {
    throw new HttpError(413, "Paste is too large (max 100 KB)");
  }
  if (!EXPIRY_OPTIONS.includes(expiresIn)) {
    throw new HttpError(400, `expiresIn must be one of: ${EXPIRY_OPTIONS.join(", ")}`);
  }
  // An empty password field means "no password"
  const hasPassword = password !== undefined && password !== null && password !== "";
  if (hasPassword) checkPassword(password);

  // Replace the body with clean, known fields only
  req.body = {
    content,
    language: LANGUAGES.includes(language) ? language : "plaintext",
    expiresIn,
    burnAfterRead: burnAfterRead === true,
    password: hasPassword ? password : null,
  };
  next();
}

export function validateId(req, res, next) {
  if (!ID_PATTERN.test(req.params.id)) {
    throw new HttpError(404, "Paste not found or expired");
  }
  next();
}

export function validateUnlock(req, res, next) {
  checkPassword(req.body?.password);
  next();
}
