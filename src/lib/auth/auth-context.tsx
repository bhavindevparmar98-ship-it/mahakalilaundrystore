import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { authApi, type Credentials } from "@/lib/api/auth";
import type { AuthUser } from "@/lib/laundry/types";

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  signIn: (credentials: Credentials) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(authApi.current());
    setReady(true);
  }, []);

  const signIn = useCallback(async (credentials: Credentials) => {
    const next = await authApi.signIn(credentials);
    setUser(next);
    return next;
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
