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
  Check,
  Shield,
  Clock,
  KeyRound,
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
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.admin.getUsers(),
  });

  const users = usersData?.data || [];

  const filteredUsers = users.filter((u) =>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Directory & Allocations</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage user accounts, assign permission roles, reset credentials, and inspect all projects allocated to each user.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs">
            <span className="text-primary font-bold">{users.length}</span> of 10 Users Registered
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
          Showing {filteredUsers.length} of {users.length} users
        </span>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
        <div className="border-b border-border/40 px-6 py-4">
          <h2 className="text-sm font-bold text-foreground">Registered User Roster</h2>
          <p className="text-xs text-muted-foreground">Detailed view of user roles and their associated projects</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/40 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-4 py-3.5">Username</th>
                <th className="px-4 py-3.5">Current Role</th>
                <th className="px-6 py-3.5">Assigned Projects</th>
                <th className="px-4 py-3.5">Date Registered</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No users match your query
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
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

                      {/* Role Badge */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            user.role === 'ADMIN'
                              ? 'bg-primary text-primary-foreground'
                              : user.role === 'MANAGER'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold'
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

                      {/* Actions (Role Selector + Reset Password) */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => setResetUser(user)}
                            className="h-8 gap-1.5 text-xs font-semibold"
                            title="Reset password for this user"
                          >
                            <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="hidden sm:inline">Reset Password</span>
                          </Button>

                          <select
                            value={user.role}
                            onChange={(e) =>
                              updateRoleMutation.mutate({
                                userId: user.id,
                                role: e.target.value as Role,
                              })
                            }
                            disabled={updateRoleMutation.isPending || isSelf}
                            className="h-8 rounded-lg border border-border/60 bg-background px-2.5 text-xs font-semibold text-foreground shadow-2xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isSelf ? 'You cannot change your own role' : 'Change user role'}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="MEMBER">MEMBER</option>
                          </select>
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
