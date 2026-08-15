'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FolderKanban,
  UserPlus,
  Trash2,
  ExternalLink,
  Plus,
  Search,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api, type AdminProject } from '@/lib/api';
import { AssignMembersDialog } from '@/components/admin/assign-members-dialog';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { DeleteProjectDialog } from '@/components/projects/delete-project-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminProjectsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [assigningProject, setAssigningProject] = useState<AdminProject | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<any | null>(null);

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['admin', 'projects', { includeDeleted: true }],
    queryFn: () => api.admin.getProjects({ includeDeleted: true }),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => api.admin.restoreProject(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(res.message || 'Project restored successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to restore project');
    },
  });

  const allProjects = projectsData?.data || [];
  const activeProjects = allProjects.filter((p) => !p.isDeleted);
  const deletedProjects = allProjects.filter((p) => p.isDeleted);

  const displayedProjects = (showDeleted ? allProjects : activeProjects).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects & User Assignments</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Oversee all workspace projects, monitor task completion reports, and assign user access to projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleted(!showDeleted)}
            className={`gap-1.5 text-xs font-semibold ${
              showDeleted ? 'border-destructive/40 bg-destructive/10 text-destructive' : ''
            }`}
          >
            {showDeleted ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{showDeleted ? 'Hide Deleted' : `Show Deleted (${deletedProjects.length})`}</span>
          </Button>

          <Button
            onClick={() => setCreateOpen(true)}
            size="sm"
            className="gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search projects by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          Showing {displayedProjects.length} of {showDeleted ? allProjects.length : activeProjects.length} projects
        </span>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))
        ) : displayedProjects.length === 0 ? (
          <div className="col-span-full py-16 text-center rounded-xl border border-dashed border-border/60 bg-card/40">
            <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-semibold text-foreground">No projects found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? 'Try clearing your search query' : 'Create your first project to get started'}
            </p>
          </div>
        ) : (
          displayedProjects.map((project) => (
            <div
              key={project.id}
              className={`flex flex-col justify-between rounded-xl border p-5 shadow-xs transition-all ${
                project.isDeleted
                  ? 'border-destructive/30 bg-destructive/[0.02] opacity-80'
                  : 'border-border/60 bg-card hover:border-border hover:shadow-sm'
              }`}
            >
              <div>
                {/* Project Header */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-foreground text-base line-clamp-1">{project.name}</h3>
                  {project.isDeleted ? (
                    <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">
                      Deleted
                    </span>
                  ) : project.completionPercentage === 100 && project.totalCards > 0 ? (
                    <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Completed
                    </span>
                  ) : project.completionPercentage > 0 ? (
                    <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      In Progress
                    </span>
                  ) : project.totalCards === 0 ? (
                    <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border/50">
                      Empty
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Not Started
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {project.description || 'No description provided.'}
                </p>

                {/* Progress & Report Metrics */}
                <div className="mt-4 rounded-lg bg-muted/40 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Progress Report</span>
                    <span className="font-bold text-foreground">{project.completionPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        project.completionPercentage === 100 ? 'bg-emerald-500' : 'bg-primary'
                      }`}
                      style={{ width: `${project.completionPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span>{project.totalLanes} Lanes</span>
                    <span>{project.totalCards} Total Tasks</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {project.completedCards} Done
                    </span>
                  </div>
                </div>

                {/* Assigned Members Section */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Assigned Team ({project.members.length})
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {project.members.length === 0 ? (
                      <span className="text-[11px] text-muted-foreground/60 italic">
                        No users assigned (Administrators only)
                      </span>
                    ) : (
                      project.members.map((m) => (
                        <span
                          key={m.userId}
                          className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                        >
                          {m.user.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between gap-2">
                {project.isDeleted ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => restoreMutation.mutate(project.id)}
                    disabled={restoreMutation.isPending}
                    className="w-full gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Restore Project</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setAssigningProject(project)}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <UserPlus className="h-3.5 w-3.5 text-primary" />
                      <span>Assign Users</span>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => setDeletingProject(project)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>

                      <Link href={`/projects/${project.id}`}>
                        <Button size="xs" variant="ghost" className="h-7 gap-1 text-xs font-semibold">
                          <span>Open Board</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assign Members Dialog */}
      <AssignMembersDialog
        project={assigningProject}
        open={!!assigningProject}
        onOpenChange={(open) => !open && setAssigningProject(null)}
      />

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
          }
        }}
      />

      {/* Delete Project Dialog */}
      <DeleteProjectDialog
        project={deletingProject}
        open={!!deletingProject}
        onOpenChange={(open) => {
          if (!open) setDeletingProject(null);
          queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
          queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
        }}
      />
    </div>
  );
}
