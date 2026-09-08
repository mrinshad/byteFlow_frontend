'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  History,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AuthGuard } from '@/components/auth-guard';
import { AccountMenu } from '@/components/account-menu';
import { NotificationsPopover } from '@/components/notifications-popover';
import { PortalSwitchButton } from '@/components/portal-switch-button';
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
  // Sidebar collapsed by default
  const [collapsed, setCollapsed] = useState(true);

  // If user is not an ADMIN or SUPER_ADMIN, show access denied
  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
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
      label: 'Activity Logs',
      shortLabel: 'Activities',
      href: '/admin/activities',
      icon: History,
      active: pathname === '/admin/activities',
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
        className={`sticky top-0 h-screen shrink-0 border-r border-border/40 bg-card/40 flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out z-40 relative ${
          collapsed ? 'w-[68px] overflow-visible' : 'w-60'
        }`}
      >
        {/* Collapse Toggle with Tooltip */}
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 group/toggle">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </button>
          <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover/toggle:flex items-center z-50 animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="rounded-md border border-border bg-popover px-2 py-0.5 text-[11px] font-semibold text-popover-foreground shadow-md whitespace-nowrap">
              {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </div>
          </div>
        </div>

        {/* Top: Logo + Nav */}
        <div className={`flex flex-col flex-1 ${collapsed ? 'overflow-visible' : 'min-h-0'}`}>
          {/* Logo */}
          <div className={`h-14 flex items-center border-b border-border/40 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
            <div className="relative group/logo">
              <Link
                href="/admin"
                className="flex items-center gap-2.5 min-w-0"
                title={collapsed ? 'ByteFlow Admin' : undefined}
              >
                <Image
                  src="/logo.png"
                  alt="ByteFlow"
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-lg object-contain shadow-2xs"
                  priority
                />
                {!collapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold tracking-tight text-foreground leading-none truncate">ByteFlow</span>
                    <span className="text-[10px] font-semibold text-primary mt-0.5">Admin</span>
                  </div>
                )}
              </Link>
              {collapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3.5 hidden group-hover/logo:flex items-center z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                  <div className="rounded-md border border-border bg-popover px-2.5 py-1 text-xs font-semibold text-popover-foreground shadow-md whitespace-nowrap">
                    ByteFlow Admin
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation with Floating Tooltips */}
          <nav className={`flex-1 px-3 py-4 ${collapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.href} className="relative group/nav">
                    <Link
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

                    {/* Floating Tooltip when collapsed */}
                    {collapsed && (
                      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3.5 hidden group-hover/nav:flex items-center z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                        <div className="rounded-md border border-border bg-popover px-2.5 py-1 text-xs font-semibold text-popover-foreground shadow-md whitespace-nowrap">
                          {item.label}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Bottom: Portal Switch + User with Tooltips */}
        <div className={`border-t border-border/40 ${collapsed ? 'px-2 py-3 overflow-visible' : 'px-3 py-3'} space-y-3`}>
          {/* Switch to User Portal */}
          <div className="relative group/portal">
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
            {collapsed && (
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3.5 hidden group-hover/portal:flex items-center z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="rounded-md border border-border bg-popover px-2.5 py-1 text-xs font-semibold text-popover-foreground shadow-md whitespace-nowrap">
                  Kanban Boards
                </div>
              </div>
            )}
          </div>

          {/* User */}
          <div className="relative group/user">
            <div
              className={`flex items-center rounded-lg ${collapsed ? 'justify-center' : 'gap-2.5 px-3'} py-1.5`}
              title={collapsed ? `${user.name} (@${user.username})` : undefined}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary text-xs font-bold ring-1 ring-primary/15"
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
            {collapsed && (
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3.5 hidden group-hover/user:flex items-center z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md whitespace-nowrap">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground">@{user.username} • {user.role}</p>
                </div>
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
            <PortalSwitchButton />

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
