'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface User {
  id: number;
  nickname: string;
  email?: string;
  has_seen_onboarding?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isGuest: boolean;
  login: (nickname: string, password: string) => Promise<void>;
  register: (nickname: string, password: string, email: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: { id: number; nickname: string }) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isGuest: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('token');
    if (!saved) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${saved}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setToken(saved);
        setUser({ id: data.id, nickname: data.nickname, has_seen_onboarding: data.has_seen_onboarding });
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  const isGuest = !loading && !user;

  const login = useCallback(async (nickname: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (nickname: string, password: string, email: string) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, password, email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.replace('/');
  }, [router]);

  const updateUser = useCallback((u: { id: number; nickname: string }) => setUser(u), []);

  return (
    <AuthContext.Provider value={{ user, token, loading, isGuest, login, register, logout, updateUser }}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
