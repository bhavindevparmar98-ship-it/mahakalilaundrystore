/**
 * HTTP client for the Laravel 12 backend.
 *
 * Set VITE_API_BASE_URL (e.g. https://api.jaymahakalilaundry.in/api) to point the app
 * at the real backend. When it is unset, the repositories in this folder fall
 * back to a browser-local adapter so the whole UI stays clickable in dev/demo.
 */
export const API_BASE_URL: string = (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "";

export const usingRemoteApi = API_BASE_URL.length > 0;

const TOKEN_KEY = "bl.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : null) ?? `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return (payload && typeof payload === "object" && "data" in payload
    ? (payload as { data: T }).data
    : (payload as T));
}
