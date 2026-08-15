'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ShieldCheck,
  FolderKanban,
  Users,
  CheckCircle2,
  Layers,
  ArrowLeft,
  UserPlus,
  UserCog,
  TrendingUp,
  Clock,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { api, type Role, type AdminProject, type AdminUser } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AuthGuard } from '@/components/auth-guard';
import { Navbar } from '@/components/navbar';
import { AssignMembersDialog } from '@/components/admin/assign-members-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  );
}

function AdminContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'users'>('overview');
  const [assigningProject, setAssigningProject] = useState<AdminProject | null>(null);

  // Queries
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.admin.getStats(),
    enabled: user?.role === 'ADMIN',
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: () => api.admin.getProjects(),
    enabled: user?.role === 'ADMIN',
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.admin.getUsers(),
    enabled: user?.role === 'ADMIN',
  });

  // Role Update Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      api.admin.updateRole(userId, role),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success(`Role updated for @${res.data.username}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user role');
    },
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Access Restricted</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            The Admin Panel is only accessible to users with the Administrator role.
          </p>
          <Link href="/" className="mt-5">
            <Button size="sm" variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = statsData?.data;
  const projects = projectsData?.data || [];
  const users = usersData?.data || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Workspace</h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Coordinate projects, manage team members, assign project access, and oversee workspace metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs font-medium">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Projects</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex border-b border-border/40">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Overview & Reports</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'projects'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FolderKanban className="h-3.5 w-3.5" />
            <span>Projects & Assignments ({projects.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'users'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Users & Roles ({users.length}/10)</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & REPORTS */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Total Projects</span>
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalProjects ?? 0}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Active workspace boards</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Registered Users</span>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : `${stats?.totalUsers ?? 0}/10`}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {stats?.roleCounts.ADMIN ?? 0} Admins • {stats?.roleCounts.MANAGER ?? 0} Managers • {stats?.roleCounts.MEMBER ?? 0} Members
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Total Tasks</span>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalCards ?? 0}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Across {stats?.totalLanes ?? 0} workflow lanes
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Task Completion Rate</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : `${stats?.completionRate ?? 0}%`}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {stats?.totalCompletedCards ?? 0} tasks completed
                </p>
              </div>
            </div>

            {/* Project Summary Breakdown */}
            <div className="rounded-xl border border-border/60 bg-card shadow-xs">
              <div className="border-b border-border/40 px-5 py-4">
                <h3 className="text-sm font-semibold text-foreground">Project Summary & Performance</h3>
                <p className="text-xs text-muted-foreground">Overview of progress and member assignments across all projects</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/40 bg-muted/30 text-muted-foreground font-medium">
                    <tr>
                      <th className="px-5 py-3">Project Name</th>
                      <th className="px-4 py-3">Lanes</th>
                      <th className="px-4 py-3">Cards</th>
                      <th className="px-4 py-3">Completed</th>
                      <th className="px-4 py-3">Progress</th>
                      <th className="px-4 py-3">Assigned Team</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {projectsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={7} className="px-5 py-3">
                            <Skeleton className="h-5 w-full" />
                          </td>
                        </tr>
                      ))
                    ) : projects.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                          No projects created yet
                        </td>
                      </tr>
                    ) : (
                      projects.map((project) => (
                        <tr key={project.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-3 font-semibold text-foreground">
                            {project.name}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{project.totalLanes}</td>
                          <td className="px-4 py-3 text-muted-foreground">{project.totalCards}</td>
                          <td className="px-4 py-3 text-emerald-600 font-medium">{project.completedCards}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${project.completionPercentage}%` }}
                                />
                              </div>
                              <span className="font-medium text-foreground">{project.completionPercentage}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {project.members.length === 0 ? (
                              <span className="text-muted-foreground italic">No members assigned</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {project.members.map((m) => (
                                  <span
                                    key={m.userId}
                                    className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                                  >
                                    <span>{m.user.name}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => setAssigningProject(project)}
                                className="h-7 text-[11px] gap-1"
                              >
                                <UserPlus className="h-3 w-3" />
                                <span>Assign</span>
                              </Button>
                              <Link href={`/projects/${project.id}`}>
                                <Button size="xs" variant="ghost" className="h-7 text-[11px] gap-1">
                                  <span>Open</span>
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROJECTS & ASSIGNMENTS */}
        {activeTab === 'projects' && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projectsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-xl" />
                ))
              ) : projects.length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
                  No projects available.
                </div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-5 shadow-xs hover:border-border transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-sm line-clamp-1">{project.name}</h3>
                        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {project.memberCount} {project.memberCount === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                        {project.description || 'No description provided.'}
                      </p>

                      <div className="mt-4 pt-3 border-t border-border/40">
                        <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                          Assigned Members:
                        </span>
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                          {project.members.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground/60 italic">Unassigned (Admins only)</span>
                          ) : (
                            project.members.map((m) => (
                              <span
                                key={m.userId}
                                className="inline-flex items-center gap-1 rounded bg-muted/80 px-2 py-0.5 text-[11px] font-medium text-foreground"
                              >
                                {m.user.name}
                                <span className="text-[9px] text-muted-foreground uppercase">({m.user.role})</span>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setAssigningProject(project)}
                        className="gap-1.5 text-xs font-medium"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Manage Access</span>
                      </Button>

                      <Link href={`/projects/${project.id}`}>
                        <Button size="xs" variant="ghost" className="gap-1 text-xs">
                          <span>View Board</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: USERS & ROLES */}
        {activeTab === 'users' && (
          <div className="mt-6">
            <div className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
              <div className="border-b border-border/40 px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">User Directory & Roles</h3>
                  <p className="text-xs text-muted-foreground">Manage user permissions and view their assigned projects</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {users.length} of 10 users registered
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/40 bg-muted/30 text-muted-foreground font-medium">
                    <tr>
                      <th className="px-5 py-3">User</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Assigned Projects</th>
                      <th className="px-4 py-3">Joined Date</th>
                      <th className="px-5 py-3 text-right">Change Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {usersLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={6} className="px-5 py-3">
                            <Skeleton className="h-6 w-full" />
                          </td>
                        </tr>
                      ))
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                          No users registered
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-foreground">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">@{u.username}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                u.role === 'ADMIN'
                                  ? 'bg-primary text-primary-foreground'
                                  : u.role === 'MANAGER'
                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {u.assignedProjects.length === 0 ? (
                              <span className="text-muted-foreground italic">None</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {u.assignedProjects.map((p) => (
                                  <span
                                    key={p.id}
                                    className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                                  >
                                    {p.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <select
                              value={u.role}
                              onChange={(e) =>
                                updateRoleMutation.mutate({
                                  userId: u.id,
                                  role: e.target.value as Role,
                                })
                              }
                              disabled={updateRoleMutation.isPending || u.id === user.id}
                              className="h-7 rounded border border-border/60 bg-background px-2 text-xs font-medium text-foreground shadow-2xs focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="MANAGER">MANAGER</option>
                              <option value="MEMBER">MEMBER</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Assign Members Modal */}
      <AssignMembersDialog
        project={assigningProject}
        open={!!assigningProject}
        onOpenChange={(open) => !open && setAssigningProject(null)}
      />
    </div>
  );
}
