import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import NewPasteButton from "@/components/NewPasteButton";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuickPaste",
  description: "Share code and text with a short link.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
            <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
              <span
                aria-hidden="true"
                className="grid size-7 place-items-center rounded-lg bg-emerald-500 font-mono text-sm font-bold text-zinc-950"
              >
                {"{}"}
              </span>
              <span>
                Quick<span className="text-emerald-400">Paste</span>
              </span>
            </Link>
            {/* usePathname() needs a Suspense boundary with Cache Components enabled */}
            <Suspense fallback={null}>
              <NewPasteButton />
            </Suspense>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">{children}</main>

        <footer className="border-t border-zinc-800/80">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 sm:px-6 lg:px-8 py-5 text-xs text-zinc-500 sm:flex-row sm:justify-between">
            <span>QuickPaste: share code and text with a short link.</span>
            <span>Auto-expiry · Password protection · Burn after read</span>
          </div>
        </footer>

        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#f4f4f5",
              border: "1px solid #27272a",
              fontSize: "0.875rem",
            },
          }}
        />
      </body>
    </html>
  );
}
