'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, FolderKanban, Layers, CheckCircle2 } from 'lucide-react';
import { api, type Project } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { AuthGuard } from '@/components/auth-guard';
import { ProjectCard } from '@/components/projects/project-card';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { EditProjectDialog } from '@/components/projects/edit-project-dialog';
import { DeleteProjectDialog } from '@/components/projects/delete-project-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', search],
    queryFn: () => api.projects.list({ search: search.trim() || undefined }),
  });

  const { data: globalStatsData } = useQuery({
    queryKey: ['global-stats'],
    queryFn: () => api.dashboard.getGlobalStats(),
  });

  const projects = data?.data || [];
  const total = data?.meta?.total ?? 0;
  const globalStats = globalStatsData?.data;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/40">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Projects</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your workflows, track tasks, and collaborate across teams.
              </p>
            </div>

            {/* Only show New Project button to ADMIN and MANAGER */}
            {canCreate && (
              <Button onClick={() => setCreateOpen(true)} className="gap-2 shadow-xs">
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </Button>
            )}
          </div>

          {/* Global Summary Stats Banner */}
          {globalStats && (
            <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <FolderKanban className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground block">Active Projects</span>
                  <span className="text-base font-bold text-foreground">{globalStats.totalProjects}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground block">Active Lanes</span>
                  <span className="text-base font-bold text-foreground">{globalStats.totalLanes}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground block">Total Tasks</span>
                  <span className="text-base font-bold text-foreground">{globalStats.totalCards}</span>
                </div>
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {total} {total === 1 ? 'project' : 'projects'}
            </span>
          </div>

          {/* Projects List Content */}
          <div className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 py-16 px-4 text-center">
                <p className="text-sm font-medium text-destructive">Failed to load projects</p>
                <p className="mt-1 text-xs text-muted-foreground">{(error as Error).message}</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-20 px-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FolderKanban className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {search ? 'No matching projects found' : 'No projects yet'}
                </h3>
                <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
                  {search
                    ? `No projects matched "${search}". Try adjusting your search query.`
                    : canCreate
                    ? 'Get started by creating your first project to organize lanes and track cards.'
                    : 'You do not have any projects assigned yet. Contact an administrator to receive project access.'}
                </p>
                {!search && canCreate && (
                  <Button onClick={() => setCreateOpen(true)} className="mt-6 gap-2 shadow-xs">
                    <Plus className="h-4 w-4" />
                    <span>Create Project</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    currentUser={user}
                    onEdit={(p) => setEditingProject(p)}
                    onDelete={(p) => setDeletingProject(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Dialogs */}
        {canCreate && (
          <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
        )}

        <EditProjectDialog
          project={editingProject}
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
        />

        <DeleteProjectDialog
          project={deletingProject}
          open={!!deletingProject}
          onOpenChange={(open) => !open && setDeletingProject(null)}
        />
      </div>
    </AuthGuard>
  );
}
