"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, setToken } from "./api";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  loginWithTokens: (access: string, remember?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loginWithTokens = useCallback(
    async (access: string, remember = true) => {
      setToken(access, remember);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, loginWithTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
