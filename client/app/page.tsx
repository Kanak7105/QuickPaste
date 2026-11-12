"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import ShareBox, { type CreatedPaste } from "@/components/ShareBox";
import { ClockIcon, EyeIcon, EyeOffIcon, FlameIcon, LinkIcon, LockIcon } from "@/components/icons";
import {
  createPaste,
  EXPIRY_OPTIONS,
  LANGUAGES,
  LANGUAGE_INFO,
  MAX_CONTENT_BYTES,
  type Expiry,
} from "@/lib/api";
import { ui } from "@/lib/ui";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [expiresIn, setExpiresIn] = useState<Expiry>("1d");
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedPaste | null>(null);

  // The limit is in bytes, so count bytes rather than characters
  const sizeBytes = new TextEncoder().encode(content).length;
  const tooBig = sizeBytes > MAX_CONTENT_BYTES;
  const usage = Math.min(sizeBytes / MAX_CONTENT_BYTES, 1);
  const lineCount = content ? content.split("\n").length : 0;
  const canSubmit = !submitting && !tooBig && content.trim() !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const result = await createPaste({
        content,
        language,
        expiresIn,
        burnAfterRead,
        password: password || undefined,
      });
      setCreated({ ...result, burnAfterRead, hasPassword: Boolean(password) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // Ctrl/Cmd + Enter submits from anywhere in the form
  function handleKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.currentTarget.requestSubmit();
    }
  }

  function reset() {
    setCreated(null);
    setContent("");
    setPassword("");
    setShowPassword(false);
    setBurnAfterRead(false);
  }

  if (created) {
    return <ShareBox paste={created} onNew={reset} />;
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Share code in <span className="text-emerald-400">seconds</span>.
        </h1>
        <p className="max-w-2xl text-zinc-400">
          Paste it, pick when it expires, and send the link. Add a password or make it disappear
          after the first read.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"
      >
        {/* Editor */}
        <div className="flex flex-col gap-2">
          <div className={`${ui.panel} overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-3 py-2">
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="sr-only sm:not-sr-only">Language</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`${ui.field} py-1`}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {LANGUAGE_INFO[lang].label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span>
                  {lineCount} {lineCount === 1 ? "line" : "lines"}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800"
                    role="progressbar"
                    aria-label="Paste size"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(usage * 100)}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${
                        tooBig ? "bg-red-500" : usage > 0.8 ? "bg-amber-400" : "bg-emerald-500"
                      }`}
                      style={{ width: `${usage * 100}%` }}
                    />
                  </div>
                  <span className={tooBig ? "text-red-400" : undefined}>
                    {(sizeBytes / 1024).toFixed(1)} / 100 KB
                  </span>
                </div>
              </div>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your code or text here..."
              aria-label="Paste content"
              required
              autoFocus
              spellCheck={false}
              className="block min-h-88 w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none lg:min-h-120"
            />
          </div>

          {tooBig && (
            <p className="text-sm text-red-400">
              This paste is over the 100 KB limit. Trim it down to create a link.
            </p>
          )}
        </div>

        {/* Settings sidebar (stacks under the editor on small screens) */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-20">
          <div className={`${ui.panel} divide-y divide-zinc-800`}>
            <fieldset className="flex flex-col gap-3 p-4">
              <legend className="sr-only">Expiry</legend>
              <span className={`${ui.label} flex items-center gap-1.5`}>
                <ClockIcon className="size-3.5" /> Expires after
              </span>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3">
                {EXPIRY_OPTIONS.map((opt) => {
                  const active = expiresIn === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`cursor-pointer rounded-lg border px-2 py-1.5 text-center text-sm transition-colors has-focus-visible:ring-2 has-focus-visible:ring-emerald-500/40 ${
                        active
                          ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                          : "border-zinc-700/80 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="expiresIn"
                        value={opt.value}
                        checked={active}
                        onChange={() => setExpiresIn(opt.value)}
                        className="sr-only"
                      />
                      {opt.short}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex flex-col gap-3 p-4">
              <label htmlFor="password" className={`${ui.label} flex items-center gap-1.5`}>
                <LockIcon className="size-3.5" /> Password
                <span className="normal-case tracking-normal text-zinc-600">(optional)</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={4}
                  maxLength={64}
                  placeholder="4-64 characters"
                  autoComplete="new-password"
                  className={`${ui.field} w-full py-2 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 grid w-10 place-items-center text-zinc-500 hover:text-zinc-200"
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 p-4">
              <span className="relative mt-0.5 inline-flex shrink-0">
                <input
                  type="checkbox"
                  role="switch"
                  checked={burnAfterRead}
                  onChange={(e) => setBurnAfterRead(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="h-5 w-9 rounded-full bg-zinc-700 transition-colors peer-checked:bg-orange-500 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-400/50" />
                <span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </span>
              <span className="flex flex-col">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <FlameIcon className={`size-4 ${burnAfterRead ? "text-orange-400" : "text-zinc-500"}`} />
                  Burn after read
                </span>
                <span className="text-xs text-zinc-500">Deleted forever after the first view.</span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-linear-to-b from-emerald-400 to-emerald-500 px-6 py-3.5 text-base font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 ring-1 ring-inset ring-white/20 transition-all hover:shadow-emerald-500/40 hover:brightness-110 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-400 disabled:shadow-none disabled:ring-0 disabled:brightness-100"
          >
            {submitting ? (
              <span className="size-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />
            ) : (
              <LinkIcon className="size-4.5" />
            )}
            {submitting ? "Creating link..." : "Create paste"}
            {!submitting && (
              <kbd className="ml-1 hidden rounded-md bg-zinc-950/15 px-1.5 py-0.5 font-sans text-xs font-medium group-disabled:bg-zinc-950/30 sm:inline">
                Ctrl ↵
              </kbd>
            )}
          </button>
        </aside>
      </form>
    </div>
  );
}
