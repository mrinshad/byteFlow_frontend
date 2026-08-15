'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, FolderKanban, Layers, CheckCircle2 } from 'lucide-react';
import { api, type Project } from '@/lib/api';
import { Navbar } from '@/components/navbar';
import { ProjectCard } from '@/components/projects/project-card';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { EditProjectDialog } from '@/components/projects/edit-project-dialog';
import { DeleteProjectDialog } from '@/components/projects/delete-project-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onNewProject={() => setCreateOpen(true)} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/40">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Projects</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your workflows, track tasks, and collaborate across teams.
            </p>
          </div>

          <Button onClick={() => setCreateOpen(true)} className="gap-2 shadow-xs">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
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
              className="pl-9 h-10 bg-background/50 focus:bg-background"
            />
          </div>

          <div className="hidden text-xs text-muted-foreground sm:block">
            {isLoading ? 'Loading...' : `${total} ${total === 1 ? 'project' : 'projects'}`}
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col justify-between rounded-xl border border-border/50 p-5 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                  </div>
                  <div className="pt-4 border-t border-border/40 flex justify-between">
                    <Skeleton className="h-3 w-20 rounded-md" />
                    <Skeleton className="h-3 w-12 rounded-md" />
                  </div>
                </div>
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
                  : 'Get started by creating your first project to organize lanes and track cards.'}
              </p>
              {!search && (
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
                  onEdit={(p) => setEditingProject(p)}
                  onDelete={(p) => setDeletingProject(p)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Dialogs */}
      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />

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
  );
}
