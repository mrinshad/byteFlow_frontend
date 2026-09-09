'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  X,
  KeyRound,
  Lock,
  Unlock,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api, type Role, type AdminUser } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { AdminResetPasswordDialog } from '@/components/admin/admin-reset-password-dialog';
import { AdminCreateUserDialog } from '@/components/admin/admin-create-user-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users', { includeDeleted: showDeactivated }],
    queryFn: () => api.admin.getUsers({ includeDeleted: showDeactivated }),
  });

  const rawUsers = usersData?.data || [];
  const allUsers = isSuperAdmin ? rawUsers : rawUsers.filter((u) => u.role !== 'SUPER_ADMIN');
  const activeUsers = allUsers.filter((u) => !u.isDeleted);
  const deactivatedUsers = allUsers.filter((u) => u.isDeleted);

  const filteredUsers = (showDeactivated ? allUsers : activeUsers).filter((u) => {
    const q = debouncedSearch.toLowerCase().trim();
    return !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

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
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Users</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage user accounts, roles, and project allocations.
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

          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          Showing {filteredUsers.length} of {showDeactivated ? allUsers.length : activeUsers.length} users
        </span>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/40 bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-6 py-3">Assigned Projects</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
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
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  const isTargetAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

                  return (
                    <tr
                      key={user.id}
                      className={`transition-colors ${
                        user.isDeleted
                          ? 'bg-destructive/[0.02] opacity-75'
                          : user.isLocked
                          ? 'bg-amber-500/[0.02]'
                          : 'hover:bg-muted/20'
                      }`}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-semibold shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-foreground text-sm">{user.name}</span>
                              {isSelf && (
                                <span className="text-[11px] text-muted-foreground font-normal">(You)</span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">@{user.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            user.role === 'SUPER_ADMIN'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : user.role === 'ADMIN'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                              : user.role === 'MANAGER'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-muted text-muted-foreground border border-border/50'
                          }`}
                        >
                          {user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Admin' : user.role === 'MANAGER' ? 'Manager' : 'Member'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {user.isDeleted ? (
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">Deactivated</span>
                        ) : user.isLocked ? (
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Lock className="h-3 w-3" />Locked
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        {user.assignedProjects.length === 0 ? (
                          <span className="text-muted-foreground/60 text-xs italic">None</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {user.assignedProjects.map((p) => (
                              <Link key={p.id} href={`/projects/${p.slug || p.id}`} className="inline-flex items-center rounded bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium text-foreground hover:bg-muted transition-colors">
                                {p.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {user.isDeleted ? (
                            <Button size="xs" variant="outline" onClick={() => restoreMutation.mutate(user.id)} disabled={restoreMutation.isPending || (!isSuperAdmin && user.role === 'ADMIN')} className="gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer disabled:opacity-40" title={!isSuperAdmin && user.role === 'ADMIN' ? 'Only Super Admin can restore Administrators' : 'Restore user'}>
                              <RotateCcw className="h-3 w-3" /><span>Restore</span>
                            </Button>
                          ) : (
                            <>
                              <select value={user.role} onChange={(e) => updateRoleMutation.mutate({ userId: user.id, role: e.target.value as Role })} disabled={updateRoleMutation.isPending || isSelf || user.role === 'SUPER_ADMIN' || (!isSuperAdmin && isTargetAdmin)} className="h-7 rounded border border-border/50 bg-background px-2 text-[11px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed" title={user.role === 'SUPER_ADMIN' ? 'Super Administrator role cannot be changed' : isSelf ? 'You cannot change your own role' : !isSuperAdmin && isTargetAdmin ? 'Only Super Admin can change Administrator roles' : 'Change user role'}>
                                {user.role === 'SUPER_ADMIN' ? (
                                  <option value="SUPER_ADMIN">Super Admin</option>
                                ) : isSuperAdmin ? (
                                  <><option value="ADMIN">Admin</option><option value="MANAGER">Manager</option><option value="MEMBER">Member</option></>
                                ) : isTargetAdmin ? (
                                  <option value={user.role}>Admin</option>
                                ) : (
                                  <><option value="MANAGER">Manager</option><option value="MEMBER">Member</option></>
                                )}
                              </select>
                              {!isSelf && user.role !== 'SUPER_ADMIN' && (
                                <Button size="icon-xs" variant="ghost" onClick={() => lockMutation.mutate({ userId: user.id, isLocked: !user.isLocked })} disabled={lockMutation.isPending || (!isSuperAdmin && user.role === 'ADMIN')} className={`h-7 w-7 cursor-pointer disabled:opacity-40 ${user.isLocked ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10' : 'text-muted-foreground hover:text-foreground'}`} title={!isSuperAdmin && user.role === 'ADMIN' ? 'Only Super Admin can lock/unlock Administrators' : user.isLocked ? 'Unlock account' : 'Lock account'}>
                                  {user.isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                                </Button>
                              )}
                              <Button size="icon-xs" variant="ghost" onClick={() => setResetUser(user)} disabled={!isSuperAdmin && isTargetAdmin && !isSelf} className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-40" title={!isSuperAdmin && isTargetAdmin && !isSelf ? 'Only Super Admin can reset password of Administrators' : 'Reset password'}>
                                <KeyRound className="h-3.5 w-3.5" />
                              </Button>
                              {!isSelf && user.role !== 'SUPER_ADMIN' && (
                                <Button size="icon-xs" variant="ghost" onClick={() => { if (confirm(`Are you sure you want to deactivate @${user.username}?`)) { deleteMutation.mutate(user.id); } }} disabled={deleteMutation.isPending || (!isSuperAdmin && user.role === 'ADMIN')} className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer disabled:opacity-40" title={!isSuperAdmin && user.role === 'ADMIN' ? 'Only Super Admin can deactivate Administrators' : 'Deactivate user'}>
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

        {/* Mobile Cards */}
        <div data-role="responsive-table-cards" className="md:hidden p-3 space-y-2.5 bg-muted/15">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card p-4 space-y-3 shadow-xs">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-card px-4 py-12 text-center text-sm text-muted-foreground">No users found</div>
          ) : (
            filteredUsers.map((user) => {
              const isSelf = user.id === currentUser?.id;
              const isTargetAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

              return (
                <div
                  key={user.id}
                  className={`rounded-xl border border-border/60 bg-card p-4 space-y-3 shadow-xs transition-colors hover:border-border ${
                    user.isDeleted ? 'opacity-75 bg-destructive/[0.02]' : user.isLocked ? 'bg-amber-500/[0.02]' : ''
                  }`}
                >
                  {/* User Info + Badges */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">{user.name}</span>
                        {isSelf && <span className="text-[11px] text-muted-foreground">(You)</span>}
                      </div>
                      <span className="text-xs text-muted-foreground">@{user.username}</span>

                      {/* Badges Row */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            user.role === 'SUPER_ADMIN'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : user.role === 'ADMIN'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                              : user.role === 'MANAGER'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-muted text-muted-foreground border border-border/50'
                          }`}
                        >
                          {user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Admin' : user.role === 'MANAGER' ? 'Manager' : 'Member'}
                        </span>
                        {user.isDeleted ? (
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">Deactivated</span>
                        ) : user.isLocked ? (
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Lock className="h-3 w-3" />Locked
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Active</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Joined + Projects */}
                  <div className="space-y-2 pl-12">
                    <div className="text-[11px] text-muted-foreground">
                      Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    {user.assignedProjects.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {user.assignedProjects.map((p) => (
                          <Link key={p.id} href={`/projects/${p.slug || p.id}`} className="inline-flex items-center rounded bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium text-foreground hover:bg-muted transition-colors">
                            {p.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pl-12 pt-1">
                    {user.isDeleted ? (
                      <Button size="xs" variant="outline" onClick={() => restoreMutation.mutate(user.id)} disabled={restoreMutation.isPending || (!isSuperAdmin && user.role === 'ADMIN')} className="gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer disabled:opacity-40">
                        <RotateCcw className="h-3 w-3" /><span>Restore</span>
                      </Button>
                    ) : (
                      <>
                        <select value={user.role} onChange={(e) => updateRoleMutation.mutate({ userId: user.id, role: e.target.value as Role })} disabled={updateRoleMutation.isPending || isSelf || user.role === 'SUPER_ADMIN' || (!isSuperAdmin && isTargetAdmin)} className="h-7 rounded border border-border/50 bg-background px-2 text-[11px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                          {user.role === 'SUPER_ADMIN' ? (
                            <option value="SUPER_ADMIN">Super Admin</option>
                          ) : isSuperAdmin ? (
                            <><option value="ADMIN">Admin</option><option value="MANAGER">Manager</option><option value="MEMBER">Member</option></>
                          ) : isTargetAdmin ? (
                            <option value={user.role}>Admin</option>
                          ) : (
                            <><option value="MANAGER">Manager</option><option value="MEMBER">Member</option></>
                          )}
                        </select>
                        {!isSelf && user.role !== 'SUPER_ADMIN' && (
                          <Button size="icon-xs" variant="ghost" onClick={() => lockMutation.mutate({ userId: user.id, isLocked: !user.isLocked })} disabled={lockMutation.isPending || (!isSuperAdmin && user.role === 'ADMIN')} className={`h-7 w-7 cursor-pointer disabled:opacity-40 ${user.isLocked ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10' : 'text-muted-foreground hover:text-foreground'}`}>
                            {user.isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                        <Button size="icon-xs" variant="ghost" onClick={() => setResetUser(user)} disabled={!isSuperAdmin && isTargetAdmin && !isSelf} className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-40">
                          <KeyRound className="h-3.5 w-3.5" />
                        </Button>
                        {!isSelf && user.role !== 'SUPER_ADMIN' && (
                          <Button size="icon-xs" variant="ghost" onClick={() => { if (confirm(`Are you sure you want to deactivate @${user.username}?`)) { deleteMutation.mutate(user.id); } }} disabled={deleteMutation.isPending || (!isSuperAdmin && user.role === 'ADMIN')} className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer disabled:opacity-40">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Admin Create User Dialog */}
      <AdminCreateUserDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {/* Admin Reset Password Dialog */}
      <AdminResetPasswordDialog
        user={resetUser}
        open={!!resetUser}
        onOpenChange={(open) => !open && setResetUser(null)}
      />
    </div>
  );
}
