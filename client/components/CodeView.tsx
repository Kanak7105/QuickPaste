"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  content: string;
  language: string;
}

export default function CodeView({ content, language }: Props) {
  return (
    <SyntaxHighlighter
      language={language === "plaintext" ? "text" : language}
      style={oneDark}
      showLineNumbers
      customStyle={{ margin: 0, borderRadius: "0.5rem", fontSize: "0.875rem" }}
      codeTagProps={{ style: { fontFamily: "var(--font-geist-mono), monospace" } }}
    >
      {content}
    </SyntaxHighlighter>
  );
}
