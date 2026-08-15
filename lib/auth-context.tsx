'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, type AuthUser } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'byteflow_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // On mount, check for existing token and validate it
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    setToken(savedToken);

    api.auth
      .me()
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        // Token invalid/expired — clear it
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.auth.login({ username, password });
    const { user: userData, token: newToken } = res.data;
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(userData);
  }, []);

  const register = useCallback(async (name: string, username: string, password: string) => {
    const res = await api.auth.register({ name, username, password });
    const { user: userData, token: newToken } = res.data;
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
