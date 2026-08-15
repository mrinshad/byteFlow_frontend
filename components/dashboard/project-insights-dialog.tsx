'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Clock,
  Flame,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProjectInsightsDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectInsightsDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
}: ProjectInsightsDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['project-stats', projectId],
    queryFn: () => api.dashboard.getProjectStats(projectId),
    enabled: open,
  });

  const stats = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader className="border-b border-border/50 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span>Project Insights & Metrics</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Real-time status overview and task distributions for{' '}
            <span className="font-semibold text-foreground">{projectName}</span>.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !stats ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Calculating project metrics...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Total Cards */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">Total Tasks</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-foreground">{stats.totalCards}</span>
                  <span className="text-[10px] text-muted-foreground">{stats.totalLanes} lanes</span>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">Completion</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-primary">{stats.completionPercentage}%</span>
                  <span className="text-[10px] text-muted-foreground">
                    {stats.completedCards}/{stats.totalCards}
                  </span>
                </div>
              </div>

              {/* Overdue Tasks */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">Overdue</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span
                    className={`text-xl font-bold ${
                      stats.overdueCards > 0 ? 'text-destructive' : 'text-emerald-500'
                    }`}
                  >
                    {stats.overdueCards}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {stats.overdueCards > 0 ? 'Action needed' : 'All on track'}
                  </span>
                </div>
              </div>

              {/* Critical Tasks */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">Critical</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span
                    className={`text-xl font-bold ${
                      stats.cardsByPriority.CRITICAL > 0 ? 'text-rose-500' : 'text-muted-foreground'
                    }`}
                  >
                    {stats.cardsByPriority.CRITICAL}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Highest priority</span>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span>Overall Project Progress</span>
                </span>
                <span className="font-semibold text-foreground">{stats.completionPercentage}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Lane Distribution Breakdown */}
            <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Task Distribution by Lane</span>
              </span>

              {/* Proportional Stacked Bar */}
              {stats.totalCards > 0 && (
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted gap-0.5">
                  {stats.cardsByLane.map((lane) =>
                    lane.count > 0 ? (
                      <div
                        key={lane.laneId}
                        style={{
                          width: `${lane.percentage}%`,
                          backgroundColor: lane.color || '#64748b',
                        }}
                        className="h-full first:rounded-l-full last:rounded-r-full"
                        title={`${lane.laneName}: ${lane.count} cards (${lane.percentage}%)`}
                      />
                    ) : null
                  )}
                </div>
              )}

              {/* Lane list items */}
              <div className="space-y-1.5 pt-1">
                {stats.cardsByLane.map((lane) => (
                  <div
                    key={lane.laneId}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-md hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: lane.color || '#64748b' }}
                      />
                      <span className="font-medium text-foreground">{lane.laneName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                      <span>{lane.count} tasks</span>
                      <span className="w-10 text-right font-semibold text-foreground">
                        {lane.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Distribution Breakdown */}
            <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Tasks by Priority</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* Low */}
                <div className="rounded-lg border border-border/40 bg-muted/20 p-2.5 text-center">
                  <span className="text-[10px] text-muted-foreground block">Low</span>
                  <span className="text-base font-bold text-slate-600 dark:text-slate-400">
                    {stats.cardsByPriority.LOW}
                  </span>
                </div>

                {/* Medium */}
                <div className="rounded-lg border border-border/40 bg-muted/20 p-2.5 text-center">
                  <span className="text-[10px] text-muted-foreground block">Medium</span>
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                    {stats.cardsByPriority.MEDIUM}
                  </span>
                </div>

                {/* High */}
                <div className="rounded-lg border border-border/40 bg-muted/20 p-2.5 text-center">
                  <span className="text-[10px] text-muted-foreground block">High</span>
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                    {stats.cardsByPriority.HIGH}
                  </span>
                </div>

                {/* Critical */}
                <div className="rounded-lg border border-border/40 bg-muted/20 p-2.5 text-center">
                  <span className="text-[10px] text-muted-foreground block">Critical</span>
                  <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                    {stats.cardsByPriority.CRITICAL}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
