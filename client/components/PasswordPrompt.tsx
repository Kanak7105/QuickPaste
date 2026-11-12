"use client";

import { useState } from "react";

interface Props {
  onUnlock: (password: string) => Promise<void>;
}

export default function PasswordPrompt({ onUnlock }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onUnlock(password);
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-6"
    >
      <h1 className="font-semibold">This paste is password protected</h1>
      <p className="mt-1 text-sm text-zinc-400">Enter the password to view it.</p>

      <input
        type="password"
        autoFocus
        required
        minLength={4}
        maxLength={64}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="mt-4 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="mt-3 w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? "Unlocking..." : "Unlock"}
      </button>
    </form>
  );
}
