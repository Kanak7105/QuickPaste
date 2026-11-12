import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-semibold">Paste not found</h1>
      <p className="mt-2 text-zinc-400">
        It may have expired, been burned after reading, or never existed.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
      >
        Create a new paste
      </Link>
    </div>
  );
}
