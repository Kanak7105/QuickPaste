"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import ShareBox from "@/components/ShareBox";
import {
  createPaste,
  EXPIRY_OPTIONS,
  LANGUAGES,
  MAX_CONTENT_BYTES,
  type CreatePasteResult,
  type Expiry,
} from "@/lib/api";

const inputClass =
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [expiresIn, setExpiresIn] = useState<Expiry>("1d");
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatePasteResult | null>(null);

  // The limit is in bytes, so count bytes rather than characters
  const sizeBytes = new TextEncoder().encode(content).length;
  const tooBig = sizeBytes > MAX_CONTENT_BYTES;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await createPaste({
        content,
        language,
        expiresIn,
        burnAfterRead,
        password: password || undefined,
      });
      setCreated(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setCreated(null);
    setContent("");
    setPassword("");
    setBurnAfterRead(false);
  }

  if (created) {
    return <ShareBox id={created.id} expiresAt={created.expiresAt} onNew={reset} />;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your code or text here..."
        required
        spellCheck={false}
        className={`${inputClass} min-h-80 resize-y font-mono leading-relaxed`}
      />
      <p className={`-mt-2 text-right text-xs ${tooBig ? "text-red-400" : "text-zinc-500"}`}>
        {(sizeBytes / 1024).toFixed(1)} KB / 100 KB
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-zinc-400">
          Language
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-400">
          Expires after
          <select
            value={expiresIn}
            onChange={(e) => setExpiresIn(e.target.value as Expiry)}
            className={inputClass}
          >
            {EXPIRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-400">
          Password (optional)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={4}
            maxLength={64}
            placeholder="4-64 characters"
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={burnAfterRead}
            onChange={(e) => setBurnAfterRead(e.target.checked)}
            className="h-4 w-4 accent-emerald-500"
          />
          Burn after read
          <span className="text-zinc-500">(deleted after the first view)</span>
        </label>

        <button
          type="submit"
          disabled={submitting || tooBig || !content.trim()}
          className="rounded-md bg-emerald-500 px-6 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create paste"}
        </button>
      </div>
    </form>
  );
}
