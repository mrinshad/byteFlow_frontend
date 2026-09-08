'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  LogOut,
  KeyRound,
  ShieldCheck,
  LayoutGrid,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ChangePasswordDialog } from '@/components/change-password-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AccountMenu() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [passwordOpen, setPasswordOpen] = useState(false);

  if (!user) return null;

  const isAdminPortal = pathname.startsWith('/admin');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 px-2 text-xs font-medium hover:bg-muted/80 focus-visible:ring-1"
            />
          }
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="max-w-[120px] truncate hidden sm:inline text-xs font-semibold text-foreground">
            {user.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal py-2 px-3">
              <div className="flex flex-col space-y-0.5">
                <p className="text-xs font-bold text-foreground leading-tight">{user.name}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">@{user.username}</p>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Portal Switcher – visible in dropdown on mobile only (desktop has standalone button) */}
          {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
            <div className="sm:hidden">
              {isAdminPortal ? (
                <DropdownMenuItem
                  render={<Link href="/projects" className="gap-2.5 cursor-pointer text-xs font-medium" />}
                >
                  <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                  <span>Kanban Boards</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  render={<Link href="/admin" className="gap-2.5 cursor-pointer text-xs font-medium" />}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>Admin Portal</span>
                </DropdownMenuItem>
              )}
            </div>
          )}

          {/* Change Password */}
          <DropdownMenuItem
            onClick={() => setPasswordOpen(true)}
            className="gap-2.5 cursor-pointer text-xs font-medium"
          >
            <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Change Password</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuItem
            onClick={logout}
            className="gap-2.5 cursor-pointer text-xs font-medium text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
      />
    </>
  );
}
