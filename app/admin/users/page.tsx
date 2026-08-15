'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users,
  ShieldCheck,
  FolderKanban,
  Search,
  KeyRound,
  Lock,
  Unlock,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
  UserX,
} from 'lucide-react';
import { api, type Role, type AdminUser } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AdminResetPasswordDialog } from '@/components/admin/admin-reset-password-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users', { includeDeleted: true }],
    queryFn: () => api.admin.getUsers({ includeDeleted: true }),
  });

  const allUsers = usersData?.data || [];
  const activeUsers = allUsers.filter((u) => !u.isDeleted);
  const deactivatedUsers = allUsers.filter((u) => u.isDeleted);

  const filteredUsers = (showDeactivated ? allUsers : activeUsers).filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      api.admin.updateRole(userId, role),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success(`Role updated to ${res.data.role} for @${res.data.username}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user role');
    },
  });

  const lockMutation = useMutation({
    mutationFn: ({ userId, isLocked }: { userId: string; isLocked: boolean }) =>
      api.admin.toggleLock(userId, isLocked),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(
        res.data.isLocked
          ? `Account @${res.data.username} locked`
          : `Account @${res.data.username} unlocked`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update account lock state');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => api.admin.deleteUser(userId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success(res.message || 'User deactivated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to deactivate user');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (userId: string) => api.admin.restoreUser(userId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success(res.message || 'User restored');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to restore user');
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Directory & Governance</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage user accounts, assign permission roles, lock/unlock access, and inspect project allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeactivated(!showDeactivated)}
            className={`gap-1.5 text-xs font-semibold ${
              showDeactivated ? 'border-destructive/40 bg-destructive/10 text-destructive' : ''
            }`}
          >
            {showDeactivated ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{showDeactivated ? 'Hide Deactivated' : `Show Deactivated (${deactivatedUsers.length})`}</span>
          </Button>

          <span className="rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs">
            <span className="text-primary font-bold">{activeUsers.length}</span> Active Users
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          Showing {filteredUsers.length} of {showDeactivated ? allUsers.length : activeUsers.length} users
        </span>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
        <div className="border-b border-border/40 px-6 py-4">
          <h2 className="text-sm font-bold text-foreground">Registered User Roster</h2>
          <p className="text-xs text-muted-foreground">Detailed view of user roles, status, and governance controls</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/40 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-4 py-3.5">Username</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-6 py-3.5">Assigned Projects</th>
                <th className="px-4 py-3.5">Date Joined</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No users match your query
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr
                      key={user.id}
                      className={`transition-colors ${
                        user.isDeleted
                          ? 'bg-destructive/[0.02] opacity-75'
                          : user.isLocked
                          ? 'bg-amber-500/[0.03]'
                          : 'hover:bg-muted/20'
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 ring-1 ring-primary/20">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-foreground text-sm">{user.name}</span>
                              {isSelf && (
                                <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                        @{user.username}
                      </td>

                      {/* Account Status Badge */}
                      <td className="px-4 py-4">
                        {user.isDeleted ? (
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">
                            Deactivated
                          </span>
                        ) : user.isLocked ? (
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Lock className="h-3 w-3" />
                            Locked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            user.role === 'ADMIN'
                              ? 'bg-primary text-primary-foreground'
                              : user.role === 'MANAGER'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Assigned Projects */}
                      <td className="px-6 py-4">
                        {user.assignedProjects.length === 0 ? (
                          <span className="text-muted-foreground/60 italic text-[11px]">
                            No projects assigned
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 max-w-md">
                            {user.assignedProjects.map((p) => (
                              <Link
                                key={p.id}
                                href={`/projects/${p.id}`}
                                className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-muted hover:border-border transition-colors"
                              >
                                <FolderKanban className="h-3 w-3 text-muted-foreground" />
                                <span>{p.name}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Date Joined */}
                      <td className="px-4 py-4 text-muted-foreground text-xs">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.isDeleted ? (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => restoreMutation.mutate(user.id)}
                              disabled={restoreMutation.isPending}
                              className="gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Restore User</span>
                            </Button>
                          ) : (
                            <>
                              {/* Lock / Unlock Toggle Button */}
                              {!isSelf && (
                                <Button
                                  size="icon-xs"
                                  variant="ghost"
                                  onClick={() =>
                                    lockMutation.mutate({
                                      userId: user.id,
                                      isLocked: !user.isLocked,
                                    })
                                  }
                                  disabled={lockMutation.isPending}
                                  className={`h-8 w-8 cursor-pointer ${
                                    user.isLocked
                                      ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                                      : 'text-muted-foreground hover:text-foreground'
                                  }`}
                                  title={user.isLocked ? 'Unlock account' : 'Lock account'}
                                >
                                  {user.isLocked ? (
                                    <Lock className="h-3.5 w-3.5" />
                                  ) : (
                                    <Unlock className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              )}

                              {/* Reset Password Button */}
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => setResetUser(user)}
                                className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
                                title="Reset password for this user"
                              >
                                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="hidden sm:inline">Reset</span>
                              </Button>

                              {/* Role Selector */}
                              <select
                                value={user.role}
                                onChange={(e) =>
                                  updateRoleMutation.mutate({
                                    userId: user.id,
                                    role: e.target.value as Role,
                                  })
                                }
                                disabled={updateRoleMutation.isPending || isSelf}
                                className="h-8 rounded-lg border border-border/60 bg-background px-2 text-xs font-semibold text-foreground shadow-2xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isSelf ? 'You cannot change your own role' : 'Change user role'}
                              >
                                <option value="ADMIN">ADMIN</option>
                                <option value="MANAGER">MANAGER</option>
                                <option value="MEMBER">MEMBER</option>
                              </select>

                              {/* Deactivate User Button */}
                              {!isSelf && (
                                <Button
                                  size="icon-xs"
                                  variant="ghost"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to deactivate @${user.username}?`)) {
                                      deleteMutation.mutate(user.id);
                                    }
                                  }}
                                  disabled={deleteMutation.isPending}
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                                  title="Deactivate User"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Reset Password Dialog */}
      <AdminResetPasswordDialog
        user={resetUser}
        open={!!resetUser}
        onOpenChange={(open) => !open && setResetUser(null)}
      />
    </div>
  );
}
