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
  PanelLeftClose,
  PanelLeftOpen,
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
      label: 'Dashboard & Reports',
      href: '/admin',
      icon: TrendingUp,
      active: pathname === '/admin',
    },
    {
      label: 'Projects & Assignments',
      href: '/admin/projects',
      icon: FolderKanban,
      active: pathname === '/admin/projects',
    },
    {
      label: 'Users & Allocations',
      href: '/admin/users',
      icon: Users,
      active: pathname === '/admin/users',
    },
    {
      label: 'Roles & Permissions',
      href: '/admin/roles',
      icon: ShieldCheck,
      active: pathname === '/admin/roles',
    },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Static Collapsible Admin Sidebar */}
      <aside
        className={`sticky top-0 h-screen shrink-0 border-r border-border/50 bg-card/60 flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out z-40 relative ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Floating Vertical Center Collapse/Expand Toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-xs hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        <div className="overflow-y-auto flex-1">
          {/* Sidebar Header */}
          <div className="h-14 flex items-center px-4 border-b border-border/40">
            {!collapsed ? (
              <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold tracking-tight text-foreground leading-none truncate">ByteFlow</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">Admin Portal</span>
                </div>
              </Link>
            ) : (
              <Link href="/admin" className="mx-auto" title="ByteFlow Admin Portal">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                  <Layers className="h-4 w-4" />
                </div>
              </Link>
            )}
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1.5">
            {!collapsed && (
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Management
              </div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                    collapsed ? 'justify-center px-2' : 'px-3'
                  } ${
                    item.active
                      ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border/40 space-y-2">
          {/* Switch to User Portal Button */}
          <Link
            href="/projects"
            title={collapsed ? 'Switch to User Portal (Kanban Boards)' : undefined}
            className={`flex items-center rounded-lg border border-border/50 bg-muted/30 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all group ${
              collapsed ? 'justify-center px-2' : 'justify-between px-3'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <LayoutGrid className="h-4 w-4 text-primary shrink-0" />
              {!collapsed && <span className="truncate font-medium">User Portal (Boards)</span>}
            </div>
            {!collapsed && (
              <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            )}
          </Link>

          {/* User Info */}
          {!collapsed ? (
            <div className="flex items-center gap-2.5 px-2 py-1 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground leading-tight">{user.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">@{user.username}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold"
                title={`${user.name} (@${user.username})`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Uniform Top Header */}
        <header className="sticky top-0 z-30 h-14 border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Logo */}
            <Link href="/admin" className="flex md:hidden items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold uppercase text-primary">Admin</span>
            </Link>

            <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
              Admin Management Console
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

            {/* Uniform Theme Toggle */}
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

            {/* Dedicated Account Menu */}
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
              {item.label}
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
