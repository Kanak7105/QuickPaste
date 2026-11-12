const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// Must match the allowlist in server/src/middleware/validate.js
export const LANGUAGES = [
  "plaintext", "javascript", "typescript", "python", "java", "c", "cpp",
  "csharp", "go", "rust", "php", "ruby", "kotlin", "swift", "sql",
  "bash", "json", "yaml", "markdown", "html", "css",
] as const;

// Display name and download file extension for each language
export const LANGUAGE_INFO: Record<(typeof LANGUAGES)[number], { label: string; ext: string }> = {
  plaintext: { label: "Plain text", ext: "txt" },
  javascript: { label: "JavaScript", ext: "js" },
  typescript: { label: "TypeScript", ext: "ts" },
  python: { label: "Python", ext: "py" },
  java: { label: "Java", ext: "java" },
  c: { label: "C", ext: "c" },
  cpp: { label: "C++", ext: "cpp" },
  csharp: { label: "C#", ext: "cs" },
  go: { label: "Go", ext: "go" },
  rust: { label: "Rust", ext: "rs" },
  php: { label: "PHP", ext: "php" },
  ruby: { label: "Ruby", ext: "rb" },
  kotlin: { label: "Kotlin", ext: "kt" },
  swift: { label: "Swift", ext: "swift" },
  sql: { label: "SQL", ext: "sql" },
  bash: { label: "Bash", ext: "sh" },
  json: { label: "JSON", ext: "json" },
  yaml: { label: "YAML", ext: "yaml" },
  markdown: { label: "Markdown", ext: "md" },
  html: { label: "HTML", ext: "html" },
  css: { label: "CSS", ext: "css" },
};

export function languageInfo(lang: string) {
  return LANGUAGE_INFO[lang as keyof typeof LANGUAGE_INFO] ?? LANGUAGE_INFO.plaintext;
}

export const EXPIRY_OPTIONS = [
  { value: "10m", label: "10 minutes", short: "10 min" },
  { value: "1h", label: "1 hour", short: "1 hour" },
  { value: "1d", label: "1 day", short: "1 day" },
  { value: "1w", label: "1 week", short: "1 week" },
  { value: "never", label: "Never", short: "Never" },
] as const;

export const MAX_CONTENT_BYTES = 100 * 1024;

export type Expiry = (typeof EXPIRY_OPTIONS)[number]["value"];

export interface CreatePasteInput {
  content: string;
  language: string;
  expiresIn: Expiry;
  burnAfterRead: boolean;
  password?: string;
}

export interface CreatePasteResult {
  id: string;
  expiresAt: string | null;
}

export interface Paste {
  id: string;
  content: string;
  language: string;
  burnAfterRead: boolean;
  views: number;
  expiresAt: string | null;
  createdAt: string;
}

export type GetPasteResult = Paste | { locked: true };

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Could not reach the server");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? "Something went wrong");
  return data as T;
}

export function createPaste(input: CreatePasteInput) {
  return request<CreatePasteResult>("/api/pastes", input);
}

export function getPaste(id: string) {
  return request<GetPasteResult>(`/api/pastes/${id}`);
}

export function unlockPaste(id: string, password: string) {
  return request<Paste>(`/api/pastes/${id}/unlock`, { password });
}

export function rawUrl(id: string) {
  return `${API_URL}/raw/${id}`;
}
