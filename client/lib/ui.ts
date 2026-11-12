// Shared Tailwind class strings. Kept in TS (not @apply in CSS) so Tailwind
// picks them up identically in `next dev` and `next build`.
// Base styles carry no padding/colour that callers override, so adding
// e.g. "px-3 py-2" never conflicts with a value already in the base.

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400";

const btnBase = `inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ${focusRing} disabled:cursor-not-allowed disabled:opacity-50`;

const badgeBase = "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs";

export const ui = {
  panel: "rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-lg shadow-black/20 backdrop-blur-sm",
  field:
    "rounded-lg border border-zinc-700/80 bg-zinc-950/60 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
  btnPrimary: `${btnBase} bg-emerald-500 text-zinc-950 hover:bg-emerald-400`,
  btnSecondary: `${btnBase} border border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800`,
  btnWarn: `${btnBase} border border-orange-900/70 bg-orange-950/30 text-orange-200 hover:border-orange-800 hover:bg-orange-950/60`,
  badge: `${badgeBase} border-zinc-800 bg-zinc-900 text-zinc-300`,
  badgeWarn: `${badgeBase} border-orange-900/60 bg-orange-950/30 text-orange-300`,
  label: "text-xs font-medium uppercase tracking-wider text-zinc-500",
} as const;
