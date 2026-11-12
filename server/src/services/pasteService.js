import Paste from "../models/Paste.js";
import { withUniqueId } from "./idService.js";
import { getExpiryDate, notExpiredFilter } from "./expiryService.js";
import { hashPassword, verifyPassword } from "./passwordService.js";
import { HttpError } from "../middleware/errorHandler.js";

function toPublic(paste) {
  return {
    id: paste._id,
    content: paste.content,
    language: paste.language,
    burnAfterRead: paste.burnAfterRead,
    views: paste.views,
    expiresAt: paste.expiresAt,
    createdAt: paste.createdAt,
  };
}

// Small lookup (no content) to decide how a read should be handled
function findMeta(id) {
  return Paste.findOne({ _id: id, ...notExpiredFilter() })
    .select("passwordHash burnAfterRead")
    .lean();
}

// Returns the paste and records the view. Each branch is a single atomic
// query, so concurrent requests can't both read a burned paste or lose a view.
async function readAndCount(id, burnAfterRead) {
  const filter = { _id: id, ...notExpiredFilter() };

  if (burnAfterRead) {
    // Only one caller gets the document back; everyone else gets null (404)
    const paste = await Paste.findOneAndDelete(filter).lean();
    return paste ? { ...toPublic(paste), views: paste.views + 1 } : null;
  }

  const paste = await Paste.findOneAndUpdate(
    filter,
    { $inc: { views: 1 } },
    { returnDocument: "after" }
  ).lean();
  return paste ? toPublic(paste) : null;
}

export async function createPaste({ content, language, expiresIn, burnAfterRead, password }) {
  const passwordHash = password ? await hashPassword(password) : null;

  const paste = await withUniqueId((id) =>
    Paste.create({
      _id: id,
      content,
      language,
      burnAfterRead,
      passwordHash,
      expiresAt: getExpiryDate(expiresIn),
    })
  );
  return { id: paste._id, expiresAt: paste.expiresAt };
}

export async function getPaste(id) {
  const meta = await findMeta(id);
  if (!meta) return null;

  // Don't reveal content, count the view, or burn until the password is given
  if (meta.passwordHash) return { locked: true };

  return readAndCount(id, meta.burnAfterRead);
}

export async function unlockPaste(id, password) {
  const meta = await findMeta(id);
  if (!meta) return null;
  if (!meta.passwordHash) throw new HttpError(400, "This paste is not password protected");

  const ok = await verifyPassword(password, meta.passwordHash);
  if (!ok) throw new HttpError(401, "Incorrect password");

  return readAndCount(id, meta.burnAfterRead);
}

export async function getRawPaste(id) {
  const meta = await findMeta(id);
  if (!meta) return null;
  if (meta.passwordHash) {
    throw new HttpError(401, "Raw view is not available for password-protected pastes");
  }

  // Same read path, so raw views are counted and burn-after-read still applies
  const paste = await readAndCount(id, meta.burnAfterRead);
  return paste ? paste.content : null;
}
