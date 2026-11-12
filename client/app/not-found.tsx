import Link from "next/link";
import { PlusIcon, SearchXIcon } from "@/components/icons";
import { ui } from "@/lib/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-full bg-zinc-800/80 text-zinc-400 ring-8 ring-zinc-800/30">
        <SearchXIcon className="size-7" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paste not found</h1>
        <p className="mt-2 text-zinc-400">
          It may have expired, been burned after reading, or never existed.
        </p>
      </div>
      <Link href="/" className={`${ui.btnPrimary} mt-2 px-4 py-2.5`}>
        <PlusIcon className="size-4" />
        Create a new paste
      </Link>
    </div>
  );
}
