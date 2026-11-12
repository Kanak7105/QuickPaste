"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ui } from "@/lib/ui";

interface Props {
  content: string;
  language: string;
  label: string;
}

export default function CodeView({ content, language, label }: Props) {
  const lines = content.split("\n").length;
  const kb = new TextEncoder().encode(content).length / 1024;

  return (
    <div className={`${ui.panel} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 text-xs text-zinc-500">
        <span className="font-medium text-zinc-300">{label}</span>
        <span>
          {lines} {lines === 1 ? "line" : "lines"} · {kb < 0.1 ? "<0.1" : kb.toFixed(1)} KB
        </span>
      </div>
      <SyntaxHighlighter
        language={language === "plaintext" ? "text" : language}
        style={oneDark}
        showLineNumbers
        lineNumberStyle={{ color: "#52525b", minWidth: "2.5em", paddingRight: "1.25em" }}
        customStyle={{
          margin: 0,
          padding: "1rem 0.75rem",
          borderRadius: 0,
          background: "transparent",
          fontSize: "0.875rem",
          lineHeight: 1.65,
        }}
        codeTagProps={{
          style: { fontFamily: "var(--font-geist-mono), monospace", background: "transparent" },
        }}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
}
