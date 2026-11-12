"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckIcon, CopyIcon } from "@/components/icons";
import { ui } from "@/lib/ui";

interface Props {
  text: string;
  label?: string;
  /** Padding/size classes; the base style has none */
  className?: string;
}

// Copies text and briefly swaps to a "Copied" state so the click is visibly confirmed
export default function CopyButton({ text, label = "Copy", className = "px-4 py-2" }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      toast.error("Could not copy, please copy it manually");
    }
  }

  return (
    <button type="button" onClick={copy} className={`${ui.btnPrimary} ${className}`} aria-live="polite">
      {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      {copied ? "Copied" : label}
    </button>
  );
}
