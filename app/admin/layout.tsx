'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  TrendingUp,
  FolderKanban,
  Users,
  ShieldCheck,
  ShieldAlert,
  Moon,
  Sun,
  Layers,
  ArrowLeft,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AuthGuard } from '@/components/auth-guard';
import { AccountMenu } from '@/components/account-menu';
import { NotificationsPopover } from '@/components/notifications-popover';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthGuard>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // If user is not an ADMIN, show access denied
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4 shadow-xs">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Admin Portal Access Restricted</h2>
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
          This portal is reserved for system administrators. You are currently logged in as <span className="font-semibold text-foreground">@{user?.username}</span>.
        </p>
        <Link href="/projects" className="mt-6">
          <Button size="sm" variant="outline" className="gap-2 text-xs font-medium">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Kanban Boards</span>
          </Button>
        </Link>
      </div>
    );
  }

  const navItems = [
    {
      label: 'Dashboard',
      shortLabel: 'Dashboard',
      href: '/admin',
      icon: TrendingUp,
      active: pathname === '/admin',
    },
    {
      label: 'Projects',
      shortLabel: 'Projects',
      href: '/admin/projects',
      icon: FolderKanban,
      active: pathname === '/admin/projects',
    },
    {
      label: 'Users',
      shortLabel: 'Users',
      href: '/admin/users',
      icon: Users,
      active: pathname === '/admin/users',
    },
    {
      label: 'Roles',
      shortLabel: 'Roles',
      href: '/admin/roles',
      icon: ShieldCheck,
      active: pathname === '/admin/roles',
    },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 h-screen shrink-0 border-r border-border/40 bg-card/40 flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out z-40 relative ${
          collapsed ? 'w-[68px]' : 'w-60'
        }`}
      >
        {/* Collapse Toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>

        {/* Top: Logo + Nav */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className={`h-14 flex items-center border-b border-border/40 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
            <Link href="/admin" className="flex items-center gap-2.5 min-w-0" title="ByteFlow Admin">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Layers className="h-4 w-4" />
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold tracking-tight text-foreground leading-none truncate">ByteFlow</span>
                  <span className="text-[10px] font-semibold text-primary mt-0.5">Admin</span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`group flex items-center rounded-lg transition-colors ${
                      collapsed ? 'justify-center h-10 w-10 mx-auto' : 'gap-3 px-3 h-9'
                    } ${
                      item.active
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    <Icon className={`shrink-0 ${collapsed ? 'h-4.5 w-4.5' : 'h-4 w-4'}`} />
                    {!collapsed && <span className="text-[13px] truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Bottom: Portal Switch + User */}
        <div className={`border-t border-border/40 ${collapsed ? 'px-2 py-3' : 'px-3 py-3'} space-y-3`}>
          {/* Switch to User Portal */}
          <Link
            href="/projects"
            title={collapsed ? 'Kanban Boards' : undefined}
            className={`flex items-center rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors ${
              collapsed ? 'justify-center h-10 w-10 mx-auto' : 'gap-2.5 px-3 h-9'
            }`}
          >
            <LayoutGrid className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="truncate flex-1">Kanban Boards</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
              </>
            )}
          </Link>

          {/* User */}
          <div className={`flex items-center rounded-lg ${collapsed ? 'justify-center' : 'gap-2.5 px-3'} py-1.5`}>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary text-xs font-bold ring-1 ring-primary/15"
              title={collapsed ? `${user.name} (@${user.username})` : undefined}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground leading-tight">{user.name}</p>
                <p className="truncate text-[10px] text-muted-foreground leading-tight">@{user.username}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-14 border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Logo */}
            <Link href="/admin" className="flex md:hidden items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold uppercase text-primary">Admin</span>
            </Link>

            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
              Admin Console
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Switch to User Portal (Quick Action) */}
            <Link href="/projects">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs font-semibold border-border/60 hover:bg-muted"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="hidden sm:inline">Kanban Boards</span>
              </Button>
            </Link>

            {/* Notifications Popover */}
            <NotificationsPopover />

            {/* Theme Toggle */}
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

            {/* Account Menu */}
            <AccountMenu />
          </div>
        </header>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden border-b border-border/40 bg-card/40 flex overflow-x-auto px-2 py-1.5 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                item.active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.shortLabel}
            </Link>
          ))}
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
