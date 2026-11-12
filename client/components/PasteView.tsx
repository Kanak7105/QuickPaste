"use client";

import { use, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import CodeView from "@/components/CodeView";
import PasswordPrompt from "@/components/PasswordPrompt";
import NotFound from "@/app/not-found";
import { ApiError, getPaste, rawUrl, unlockPaste, type Paste } from "@/lib/api";
import { formatExpiry } from "@/lib/format";

type State =
  | { status: "loading" }
  | { status: "locked" }
  | { status: "ready"; paste: Paste; wasLocked: boolean }
  | { status: "notFound" }
  | { status: "error"; message: string };

export default function PasteView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [state, setState] = useState<State>({ status: "loading" });

  // Every GET counts a view (and may burn the paste), so fetch exactly once.
  // React Strict Mode runs effects twice in development; this ref prevents that.
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    getPaste(id)
      .then((result) => {
        if ("locked" in result) setState({ status: "locked" });
        else setState({ status: "ready", paste: result, wasLocked: false });
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setState({ status: "notFound" });
        else setState({ status: "error", message: err.message });
      });
  }, [id]);

  async function handleUnlock(password: string) {
    try {
      const paste = await unlockPaste(id, password);
      setState({ status: "ready", paste, wasLocked: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setState({ status: "notFound" });
      else toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function copyContent(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  }

  if (state.status === "loading") return <p className="text-zinc-400">Loading...</p>;
  if (state.status === "notFound") return <NotFound />;
  if (state.status === "error") return <p className="text-red-400">{state.message}</p>;
  if (state.status === "locked") return <PasswordPrompt onUnlock={handleUnlock} />;

  const { paste, wasLocked } = state;
  // Raw view isn't available for password-protected pastes, and a burned paste is already gone
  const showRaw = !wasLocked && !paste.burnAfterRead;

  return (
    <div className="flex flex-col gap-4">
      {paste.burnAfterRead && (
        <div className="rounded-md border border-amber-700 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
          This paste has been deleted from the server. Copy it now, it won&apos;t be available again.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
          <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-zinc-200">{paste.language}</span>
          <span>
            {paste.views} {paste.views === 1 ? "view" : "views"}
          </span>
          <span title={paste.expiresAt ? new Date(paste.expiresAt).toLocaleString() : undefined}>
            Expires: {formatExpiry(paste.expiresAt)}
          </span>
        </div>

        <div className="flex gap-2">
          {showRaw && (
            <a
              href={rawUrl(paste.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-800"
            >
              Raw
            </a>
          )}
          <button
            onClick={() => copyContent(paste.content)}
            className="rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
          >
            Copy
          </button>
        </div>
      </div>

      <CodeView content={paste.content} language={paste.language} />
    </div>
  );
}
