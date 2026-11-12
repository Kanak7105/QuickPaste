"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { formatExpiry } from "@/lib/format";

interface Props {
  id: string;
  expiresAt: string | null;
  onNew: () => void;
}

export default function ShareBox({ id, expiresAt, onNew }: Props) {
  const url = `${window.location.origin}/p/${id}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy, please copy it manually");
    }
  }

  return (
    <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-5">
      <h2 className="font-semibold text-emerald-300">Paste created</h2>
      <p className="mt-1 text-sm text-zinc-400">Expires: {formatExpiry(expiresAt)}</p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
        />
        <button
          onClick={copy}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
        >
          Copy link
        </button>
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        <Link href={`/p/${id}`} className="text-emerald-400 hover:underline">
          Open paste
        </Link>
        <button onClick={onNew} className="text-zinc-400 hover:text-zinc-100">
          Create another
        </button>
      </div>
    </div>
  );
}
