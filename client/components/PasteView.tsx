"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import CodeView from "@/components/CodeView";
import CopyButton from "@/components/CopyButton";
import PasswordPrompt from "@/components/PasswordPrompt";
import NotFound from "@/app/not-found";
import {
  AlertIcon,
  ClockIcon,
  DownloadIcon,
  ExternalIcon,
  EyeIcon,
  FlameIcon,
  LockIcon,
} from "@/components/icons";
import { ApiError, getPaste, languageInfo, rawUrl, unlockPaste, type Paste } from "@/lib/api";
import { formatExpiry } from "@/lib/format";
import { ui } from "@/lib/ui";

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

  if (state.status === "loading") return <PasteSkeleton />;
  if (state.status === "notFound") return <NotFound />;
  if (state.status === "error") return <ErrorCard message={state.message} />;
  if (state.status === "locked") return <PasswordPrompt onUnlock={handleUnlock} />;

  const { paste, wasLocked } = state;
  const info = languageInfo(paste.language);
  // Raw view isn't available for password-protected pastes, and a burned paste is already gone
  const showRaw = !wasLocked && !paste.burnAfterRead;

  function download() {
    const blob = new Blob([paste.content], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `paste-${paste.id}.${info.ext}`;
    a.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="flex flex-col gap-5">
      {paste.burnAfterRead && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-900/60 bg-orange-950/30 px-4 py-3 text-sm text-orange-200">
          <FlameIcon className="mt-0.5 size-4 shrink-0 text-orange-400" />
          <span>
            This paste has been deleted from the server. Copy or download it now, it won&apos;t be
            available again.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-mono text-xl font-semibold tracking-tight">
            <span className="text-zinc-500">/p/</span>
            {paste.id}
          </h1>
          <div className="flex flex-wrap gap-2">
            <span className={ui.badge}>
              <EyeIcon className="size-3.5 text-zinc-500" />
              {paste.views} {paste.views === 1 ? "view" : "views"}
            </span>
            <span
              className={ui.badge}
              title={paste.expiresAt ? new Date(paste.expiresAt).toLocaleString() : undefined}
            >
              <ClockIcon className="size-3.5 text-zinc-500" />
              {paste.expiresAt ? `Expires ${formatExpiry(paste.expiresAt)}` : "Never expires"}
            </span>
            {wasLocked && (
              <span className={ui.badge}>
                <LockIcon className="size-3.5 text-zinc-500" /> Password protected
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {showRaw && (
            <a href={rawUrl(paste.id)} target="_blank" rel="noopener noreferrer" className={`${ui.btnSecondary} px-3 py-2`}>
              <ExternalIcon className="size-4" /> Raw
            </a>
          )}
          <button type="button" onClick={download} className={`${ui.btnSecondary} px-3 py-2`}>
            <DownloadIcon className="size-4" /> Download
          </button>
          <CopyButton text={paste.content} className="px-3 py-2" />
        </div>
      </div>

      <CodeView content={paste.content} language={paste.language} label={info.label} />

      <div className="flex justify-center pt-2">
        <Link href="/" className="text-sm text-zinc-400 transition-colors hover:text-emerald-400">
          Create your own paste →
        </Link>
      </div>
    </div>
  );
}

function PasteSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-5" aria-busy="true" aria-label="Loading paste">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-48 rounded-md bg-zinc-800" />
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-md bg-zinc-800/70" />
          <div className="h-6 w-32 rounded-md bg-zinc-800/70" />
        </div>
      </div>
      <div className={`${ui.panel} flex flex-col gap-3 p-5`}>
        {[85, 60, 72, 40, 90, 55, 30].map((w, i) => (
          <div key={i} className="h-3.5 rounded bg-zinc-800/70" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-red-500/10 text-red-400">
        <AlertIcon className="size-6" />
      </div>
      <div>
        <h1 className="text-xl font-semibold">Couldn&apos;t load this paste</h1>
        <p className="mt-1 text-sm text-zinc-400">{message}</p>
        <p className="mt-1 text-xs text-zinc-500">
          The server may be waking up, which can take up to a minute.
        </p>
      </div>
      <button type="button" onClick={() => window.location.reload()} className={`${ui.btnPrimary} px-4 py-2`}>
        Try again
      </button>
    </div>
  );
}
