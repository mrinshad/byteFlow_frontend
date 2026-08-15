'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  History,
  Search,
  Filter,
  FolderKanban,
  User,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Activity,
  Layers,
} from 'lucide-react';
import { api, type ActivityLog } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminActivitiesPage() {
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [search, setSearch] = useState('');

  // Fetch projects for filter dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: () => api.admin.getProjects(),
  });

  // Fetch paginated activities
  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ['admin', 'activities', { page, projectId: selectedProject, action: selectedAction }],
    queryFn: () =>
      api.admin.getActivities({
        page,
        limit: 25,
        projectId: selectedProject || undefined,
        action: selectedAction || undefined,
      }),
  });

  const projects = projectsData?.data || [];
  const activities = activitiesData?.data || [];
  const meta = activitiesData?.meta || { total: 0, page: 1, limit: 25, totalPages: 1 };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getActionBadge = (action: string) => {
    if (action.startsWith('CREATE')) {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
    if (action.startsWith('DELETE') || action.includes('LOCK')) {
      return 'bg-destructive/10 text-destructive border-destructive/20';
    }
    if (action.startsWith('RESTORE') || action.includes('UNLOCK')) {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
    if (action.includes('MOVE') || action.includes('UPDATE')) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
    return 'bg-muted text-muted-foreground border-border/50';
  };

  const formatActionText = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatActivitySummary = (log: ActivityLog) => {
    const cardTitle = log.card?.title || log.newValue?.title || log.oldValue?.title;
    const laneName = log.lane?.name || log.newValue?.laneName;

    switch (log.action) {
      case 'CREATE_CARD':
        return `Created card "${cardTitle || 'Untitled'}"`;
      case 'MOVE_CARD':
        return `Moved card "${cardTitle || 'Card'}" to ${log.newValue?.targetLaneName || laneName || 'another lane'}`;
      case 'UPDATE_CARD':
        return `Updated card details on "${cardTitle || 'Card'}"`;
      case 'DELETE_CARD':
        return `Deleted card "${cardTitle || 'Card'}"`;
      case 'RESTORE_CARD':
        return `Restored card "${cardTitle || 'Card'}"`;
      case 'ASSIGN_USER':
        return `Assigned user ${log.newValue?.assigneeName || ''} to "${cardTitle || 'Card'}"`;
      case 'UNASSIGN_USER':
        return `Unassigned user from "${cardTitle || 'Card'}"`;
      case 'CREATE_COMMENT':
        return `Commented on "${cardTitle || 'Card'}"`;
      case 'CREATE_PROJECT':
        return `Created project "${log.newValue?.name || log.project?.name || 'Project'}"`;
      case 'DELETE_PROJECT':
        return `Deleted project "${log.oldValue?.name || log.project?.name || 'Project'}"`;
      case 'RESTORE_PROJECT':
        return `Restored project "${log.newValue?.name || log.project?.name || 'Project'}"`;
      case 'CREATE_LANE':
        return `Created lane "${log.newValue?.name || 'Lane'}"`;
      case 'DELETE_LANE':
        return `Deleted lane "${log.oldValue?.name || 'Lane'}"`;
      default:
        return log.action.replace(/_/g, ' ').toLowerCase();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Workspace Audit Logs</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Complete transparency and history trail of all team actions, changes, and governance events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs">
            <span className="text-primary font-bold">{meta.total}</span> Total Events Logged
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Project Filter */}
          <div className="flex items-center gap-1.5">
            <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-lg border border-border/60 bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isDeleted ? '(Deleted)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Action Type Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-lg border border-border/60 bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="">All Actions</option>
              <option value="CREATE_CARD">Create Card</option>
              <option value="MOVE_CARD">Move Card</option>
              <option value="DELETE_CARD">Delete Card</option>
              <option value="RESTORE_CARD">Restore Card</option>
              <option value="ASSIGN_USER">Assign User</option>
              <option value="CREATE_COMMENT">Create Comment</option>
              <option value="CREATE_PROJECT">Create Project</option>
              <option value="DELETE_PROJECT">Delete Project</option>
              <option value="RESTORE_PROJECT">Restore Project</option>
              <option value="CREATE_LANE">Create Lane</option>
              <option value="DELETE_LANE">Delete Lane</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-medium text-muted-foreground">
          Page {meta.page} of {meta.totalPages || 1}
        </span>
      </div>

      {/* Activities Table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/40 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Actor</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-6 py-3.5">Event Details</th>
                <th className="px-6 py-3.5">Project</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <History className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-semibold text-foreground">No activity logs recorded</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Try clearing selected filters</p>
                  </td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id} className="hover:bg-muted/20 transition-colors">
                    {/* Timestamp */}
                    <td className="px-6 py-3.5 text-muted-foreground whitespace-nowrap text-[11px] font-mono">
                      {formatTimestamp(act.createdAt)}
                    </td>

                    {/* Actor */}
                    <td className="px-4 py-3.5 font-semibold text-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                          {(act.performedBy || 'System').charAt(0).toUpperCase()}
                        </span>
                        <span>{act.performedBy || 'System'}</span>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${getActionBadge(
                          act.action
                        )}`}
                      >
                        {formatActionText(act.action)}
                      </span>
                    </td>

                    {/* Details */}
                    <td className="px-6 py-3.5 text-foreground">
                      <p className="line-clamp-1 font-medium">{formatActivitySummary(act)}</p>
                    </td>

                    {/* Project */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {act.project ? (
                        <Link
                          href={`/projects/${act.project.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          <FolderKanban className="h-3 w-3" />
                          <span>{act.project.name}</span>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground/60 text-[11px]">Workspace</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/40 px-6 py-3 bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Showing {(meta.page - 1) * meta.limit + 1} to{' '}
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} events
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.page <= 1 || isLoading}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={meta.page >= meta.totalPages || isLoading}
                className="h-7 px-2 text-xs"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
