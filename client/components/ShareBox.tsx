"use client";

import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { AlertIcon, CheckIcon, ClockIcon, ExternalIcon, FlameIcon, LockIcon, PlusIcon } from "@/components/icons";
import type { CreatePasteResult } from "@/lib/api";
import { formatExpiry } from "@/lib/format";
import { ui } from "@/lib/ui";

export interface CreatedPaste extends CreatePasteResult {
  burnAfterRead: boolean;
  hasPassword: boolean;
}

interface Props {
  paste: CreatedPaste;
  onNew: () => void;
}

export default function ShareBox({ paste, onNew }: Props) {
  const url = `${window.location.origin}/p/${paste.id}`;

  return (
    <div className="mx-auto w-full max-w-2xl py-4 sm:py-8">
      <div className={`${ui.panel} overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-zinc-800 p-5 sm:p-6">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 ring-4 ring-emerald-500/5">
            <CheckIcon className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Your paste is ready</h1>
            <p className="text-sm text-zinc-400">Anyone with this link can view it.</p>
          </div>
        </div>

        {/* Link + details */}
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={url}
              aria-label="Paste link"
              onFocus={(e) => e.target.select()}
              className={`${ui.field} min-w-0 flex-1 py-2.5 font-mono`}
            />
            <CopyButton text={url} label="Copy link" className="px-5 py-2.5" />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={ui.badge}>
              <ClockIcon className="size-3.5 text-zinc-500" />
              {paste.expiresAt ? `Expires ${formatExpiry(paste.expiresAt)}` : "Never expires"}
            </span>
            {paste.hasPassword && (
              <span className={ui.badge}>
                <LockIcon className="size-3.5 text-zinc-500" /> Password protected
              </span>
            )}
            {paste.burnAfterRead && (
              <span className={ui.badgeWarn}>
                <FlameIcon className="size-3.5" /> Burn after read
              </span>
            )}
          </div>

          {paste.burnAfterRead && (
            <div className="flex items-start gap-3 rounded-lg border border-orange-900/60 bg-orange-950/30 px-4 py-3 text-sm text-orange-200">
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              <span>
                This paste is deleted after its first view. If you open it yourself, the person you
                share it with won&apos;t be able to see it.
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid gap-3 border-t border-zinc-800 bg-zinc-950/40 p-4 sm:grid-cols-2 sm:p-5">
          <Link
            href={`/p/${paste.id}`}
            className={`${paste.burnAfterRead ? ui.btnWarn : ui.btnSecondary} px-4 py-2.5`}
          >
            {paste.burnAfterRead ? <FlameIcon className="size-4" /> : <ExternalIcon className="size-4" />}
            {paste.burnAfterRead ? "Open and burn it" : "Open paste"}
          </Link>
          <button type="button" onClick={onNew} className={`${ui.btnSecondary} px-4 py-2.5`}>
            <PlusIcon className="size-4" />
            Create another
          </button>
        </div>
      </div>
    </div>
  );
}
