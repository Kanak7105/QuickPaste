"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon, LockIcon } from "@/components/icons";
import { ui } from "@/lib/ui";

interface Props {
  onUnlock: (password: string) => Promise<void>;
}

export default function PasswordPrompt({ onUnlock }: Props) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onUnlock(password);
    setLoading(false);
  }

  return (
    <div className="flex justify-center py-8">
      <form onSubmit={handleSubmit} className={`${ui.panel} flex w-full max-w-sm flex-col items-center gap-5 p-6 text-center sm:p-8`}>
        <div className="grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-400 ring-8 ring-emerald-500/5">
          <LockIcon className="size-6" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">This paste is password protected</h1>
          <p className="mt-1 text-sm text-zinc-400">Enter the password to view it.</p>
        </div>

        <div className="relative w-full">
          <input
            type={show ? "text" : "password"}
            autoFocus
            required
            minLength={4}
            maxLength={64}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            className={`${ui.field} w-full py-2.5 pr-10`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center text-zinc-500 hover:text-zinc-200"
          >
            {show ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>

        <button type="submit" disabled={loading} className={`${ui.btnPrimary} w-full px-4 py-2.5`}>
          {loading && (
            <span className="size-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />
          )}
          {loading ? "Unlocking..." : "Unlock"}
        </button>
      </form>
    </div>
  );
}
