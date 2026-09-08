'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  FolderKanban,
  Users,
  CheckCircle2,
  Layers,
  ArrowRight,
  UserPlus,
  ShieldCheck,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.admin.getStats(),
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: () => api.admin.getProjects(),
  });

  const stats = statsData?.data;
  const projects = projectsData?.data || [];

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Workspace Overview & Reports</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Real-time analytics, task completion tracking, and executive summaries across all projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/projects">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold">
              <FolderKanban className="h-3.5 w-3.5" />
              <span>Manage Projects</span>
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button size="sm" className="gap-1.5 text-xs font-semibold">
              <Users className="h-3.5 w-3.5" />
              <span>Manage Users</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Projects */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-xs transition-colors hover:border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Projects</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
            {statsLoading ? <Skeleton className="h-9 w-16" /> : stats?.totalProjects ?? 0}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Active organizational boards</p>
        </div>

        {/* Registered Users */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-xs transition-colors hover:border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team Capacity</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">
              {statsLoading ? <Skeleton className="h-9 w-16" /> : stats?.totalUsers ?? 0}
            </span>
            <span className="text-xs text-muted-foreground font-medium">/ 10 max users</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Total registered workspace members
          </p>
        </div>

        {/* Total Tasks */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-xs transition-colors hover:border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Tasks</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
            {statsLoading ? <Skeleton className="h-9 w-16" /> : stats?.totalCards ?? 0}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Across {stats?.totalLanes ?? 0} workflow lanes
          </p>
        </div>

        {/* Completion Rate */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-xs transition-colors hover:border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completion Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
            {statsLoading ? <Skeleton className="h-9 w-16" /> : `${stats?.completionRate ?? 0}%`}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats?.totalCompletedCards ?? 0} of {stats?.totalCards ?? 0} tasks resolved
          </p>
        </div>
      </div>

      {/* Project Performance & Reports Table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
        <div className="border-b border-border/40 px-6 py-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-foreground">Project Performance Reports</h2>
            <p className="text-xs text-muted-foreground">Status, progress indicators, and team allocation per project</p>
          </div>
          <Link href="/admin/projects">
            <Button size="xs" variant="ghost" className="gap-1 text-xs font-semibold text-primary">
              <span>View All Projects</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/40 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Project Name</th>
                <th className="px-4 py-3.5">Lanes</th>
                <th className="px-4 py-3.5">Total Tasks</th>
                <th className="px-4 py-3.5">Completed</th>
                <th className="px-4 py-3.5">Progress</th>
                <th className="px-4 py-3.5">Assigned Members</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {projectsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                    No projects found in system
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground text-sm">{project.name}</div>
                      {project.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{project.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 font-medium text-muted-foreground">{project.totalLanes}</td>
                    <td className="px-4 py-4 font-medium text-foreground">{project.totalCards}</td>
                    <td className="px-4 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      {project.completedCards}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${project.completionPercentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-foreground text-xs">{project.completionPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {project.members.length === 0 ? (
                        <span className="text-muted-foreground/70 italic text-[11px]">No assigned users</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {project.members.map((m) => (
                            <span
                              key={m.userId}
                              className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                            >
                              {m.user.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/projects/${project.id}`}>
                          <Button size="xs" variant="outline" className="h-7 text-xs gap-1">
                            <span>Open Board</span>
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

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border/40">
          {projectsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          ) : projects.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No projects found in system
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-foreground text-sm">{project.name}</div>
                    {project.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{project.description}</p>
                    )}
                  </div>
                  <Link href={`/projects/${project.id}`} className="shrink-0">
                    <Button size="xs" variant="outline" className="h-7 text-xs gap-1">
                      <span>Open</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2.5">
                  <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${project.completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground shrink-0">{project.completionPercentage}%</span>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{project.totalLanes}</span> lanes
                  </span>
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{project.totalCards}</span> tasks
                  </span>
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{project.completedCards}</span> done
                  </span>
                </div>

                {/* Members */}
                {project.members.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.members.map((m) => (
                      <span
                        key={m.userId}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                      >
                        {m.user.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
