'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Layers, Moon, Sun, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight transition-opacity hover:opacity-90">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold">ByteFlow</span>
          </Link>

          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && user && (
            <>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground">{user.name}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                  {user.role}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  );
}
