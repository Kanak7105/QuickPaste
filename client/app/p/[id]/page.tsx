import { Suspense } from "react";
import PasteView from "@/components/PasteView";

// The paste is fetched in the browser (inside PasteView), not on the server.
// That way link-preview bots and prefetching can't burn a burn-after-read paste.
export default function PastePage({ params }: PageProps<"/p/[id]">) {
  return (
    <Suspense fallback={<p className="text-zinc-400">Loading...</p>}>
      <PasteView params={params} />
    </Suspense>
  );
}
