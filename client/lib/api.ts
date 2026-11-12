const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// Must match the allowlist in server/src/middleware/validate.js
export const LANGUAGES = [
  "plaintext", "javascript", "typescript", "python", "java", "c", "cpp",
  "csharp", "go", "rust", "php", "ruby", "kotlin", "swift", "sql",
  "bash", "json", "yaml", "markdown", "html", "css",
] as const;

export const EXPIRY_OPTIONS = [
  { value: "10m", label: "10 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "1d", label: "1 day" },
  { value: "1w", label: "1 week" },
  { value: "never", label: "Never" },
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
