import mongoose from "mongoose";

const pasteSchema = new mongoose.Schema(
  {
    _id: { type: String }, // the 8-char short ID used in the URL
    content: { type: String, required: true },
    language: { type: String, default: "plaintext" },
    burnAfterRead: { type: Boolean, default: false },
    passwordHash: { type: String, default: null },
    views: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null }, // null = never expires
  },
  { timestamps: true }
);

// MongoDB deletes the document once expiresAt has passed.
// Documents with expiresAt = null are ignored by the TTL monitor.
pasteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Paste", pasteSchema);
