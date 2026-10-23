import { apiFetch, setToken, usingRemoteApi } from "./client";
import type { AuthUser } from "@/lib/laundry/types";

const USER_KEY = "bl.user";

function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export interface Credentials {
  name?: string;
  phone: string;
  email?: string;
}

export const authApi = {
  current(): AuthUser | null {
    return readUser();
  },

  async signIn(credentials: Credentials): Promise<AuthUser> {
    if (usingRemoteApi) {
      const result = await apiFetch<{ user: AuthUser; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      setToken(result.token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      return result.user;
    }

    const user: AuthUser = {
      id: readUser()?.id ?? crypto.randomUUID(),
      name: credentials.name?.trim() || "Guest customer",
      phone: credentials.phone,
      ...(credentials.email ? { email: credentials.email } : {}),
      role: "customer",
    };
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  async signOut(): Promise<void> {
    if (usingRemoteApi) {
      try {
        await apiFetch<null>("/auth/logout", { method: "POST" });
      } catch {
        /* token already invalid — clear locally anyway */
      }
    }
    setToken(null);
    if (typeof window !== "undefined") window.localStorage.removeItem(USER_KEY);
  },
};
