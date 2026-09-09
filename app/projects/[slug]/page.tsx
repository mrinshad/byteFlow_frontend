'use client';

import React, { use, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Layers, History, BarChart3, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useBoardStore } from '@/lib/store/use-board-store';
import { useProjectSocket } from '@/lib/use-project-socket';
import { Navbar } from '@/components/navbar';
import { AuthGuard } from '@/components/auth-guard';
import { BoardFilterBar } from '@/components/board/board-filter-bar';
import { LaneContainer } from '@/components/lanes/lane-container';
import { CardDetailDrawer } from '@/components/cards/card-detail-drawer';
import { ProjectActivityDialog } from '@/components/activities/project-activity-dialog';
import { ProjectInsightsDialog } from '@/components/dashboard/project-insights-dialog';
import { ProjectMembersSection } from '@/components/projects/project-members-section';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { toast } from 'sonner';

function CardUrlSync({ projectSlug }: { projectSlug?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const openCardDrawer = useBoardStore((state) => state.openCardDrawer);
  const closeCardDrawer = useBoardStore((state) => state.closeCardDrawer);

  useEffect(() => {
    const cardId = searchParams.get('cardId');
    if (!cardId) return;

    let isMounted = true;

    const checkAndOpen = async () => {
      try {
        const res = await api.cards.getById(cardId);
        const card = res.data;
        if (!isMounted) return;

        if (!card) {
          closeCardDrawer();
          toast.error('Card not available');
          const cleanUrl = projectSlug ? `/projects/${projectSlug}` : window.location.pathname;
          router.replace(cleanUrl);
        } else {
          openCardDrawer(cardId);
          if (card.deletedAt) {
            toast.warning('This card has been deleted');
          }
        }
      } catch {
        if (!isMounted) return;
        closeCardDrawer();
        toast.error('Card not available');
        const cleanUrl = projectSlug ? `/projects/${projectSlug}` : window.location.pathname;
        router.replace(cleanUrl);
      }
    };

    checkAndOpen();

    return () => {
      isMounted = false;
    };
  }, [searchParams, openCardDrawer, closeCardDrawer, router, projectSlug]);

  return null;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const identifier = resolvedParams.slug;
  const router = useRouter();
  const { user } = useAuth();
  const { showDeleted, setShowDeleted, setCurrentProject } = useBoardStore();
  const [activityOpen, setActivityOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);

  const canManageCards = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN';

  const { data: projectData, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ['project', identifier],
    queryFn: () => api.projects.getById(identifier),
  });

  const project = projectData?.data;
  const projectId = project?.id ?? '';

  // Synchronize current project with board store (avoids child sections needing route params)
  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
    return () => {
      setCurrentProject(null);
    };
  }, [project, setCurrentProject]);

  // Backward compatibility: If accessed via UUID, update URL to clean slug smoothly
  useEffect(() => {
    if (project?.slug && identifier !== project.slug) {
      router.replace(`/projects/${project.slug}`);
    }
  }, [project?.slug, identifier, router]);

  // Connect project real-time socket room
  const { isConnected } = useProjectSocket(projectId);

  const { data: lanesData } = useQuery({
    queryKey: ['lanes', projectId],
    queryFn: () => api.lanes.listByProject(projectId),
    enabled: Boolean(projectId),
  });

  const lanesCount = lanesData?.data?.length ?? project?.lanes?.length ?? 0;

  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <CardUrlSync projectSlug={project?.slug || identifier} />
      </Suspense>
      <div className="min-h-screen bg-background flex flex-col w-full max-w-full overflow-x-clip">
        <Navbar />

        <main className="flex-1 flex flex-col mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 min-w-0 overflow-x-clip">
          {/* Navigation & Header */}
          <div className="flex flex-col gap-4 pb-5 border-b border-border/40">
            <div className="flex items-center justify-between">
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Projects</span>
              </Link>

              {/* Live Socket Connection Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                  isConnected
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-muted text-muted-foreground border-border/50'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'
                  }`}
                />
                <span>{isConnected ? 'Live Sync' : 'Connecting...'}</span>
              </div>
            </div>

            {projectLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-64 rounded-md" />
                <Skeleton className="h-4 w-96 rounded-md" />
              </div>
            ) : projectError || !project ? (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-destructive">Project not found or removed</p>
                <Link href="/projects">
                  <Button variant="outline" size="sm" className="mt-4">
                    Return to Projects
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {project.name}
                  </h1>
                  {project.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-foreground">{lanesCount}</span> {lanesCount === 1 ? 'lane' : 'lanes'}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInsightsOpen(true)}
                    className="gap-1.5 text-xs h-8"
                  >
                    <BarChart3 className="h-3.5 w-3.5 text-primary" />
                    <span>Insights</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActivityOpen(true)}
                    className="gap-1.5 text-xs h-8"
                  >
                    <History className="h-3.5 w-3.5" />
                    <span>Activity</span>
                  </Button>

                  {projectId && <ProjectMembersSection projectId={projectId} />}

                  {/* Show/Hide Deleted Cards (for Managers & Admins) */}
                  {canManageCards && (
                    <Button
                      variant={showDeleted ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowDeleted(!showDeleted)}
                      className={`gap-1.5 text-xs h-8 ${
                        showDeleted
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title={showDeleted ? 'Hide deleted cards' : 'Show deleted cards'}
                    >
                      {showDeleted ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{showDeleted ? 'Hide Deleted' : 'Show Deleted'}</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Filter Bar */}
          {!projectLoading && project && projectId && (
            <div className="pt-4 pb-2">
              <BoardFilterBar projectId={projectId} />
            </div>
          )}

          {/* Board Canvas – breaks out of max-w container so horizontal scroll reaches viewport edges */}
          {!projectLoading && project && projectId && (
            <div className="flex-1 mt-4 flex flex-col min-w-0 -mx-4 sm:-mx-6 overflow-hidden">
              <LaneContainer projectId={projectId} />
            </div>
          )}
        </main>

        {/* Card Details Drawer */}
        {projectId && <CardDetailDrawer projectId={projectId} />}

        {/* Project Activity History Dialog */}
        {project && projectId && (
          <ProjectActivityDialog
            projectId={projectId}
            projectName={project.name}
            open={activityOpen}
            onOpenChange={setActivityOpen}
          />
        )}

        {/* Project Insights Analytics Dialog */}
        {project && projectId && (
          <ProjectInsightsDialog
            projectId={projectId}
            projectName={project.name}
            open={insightsOpen}
            onOpenChange={setInsightsOpen}
          />
        )}
      </div>
    </AuthGuard>
  );
}
