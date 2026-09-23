'use client';

import React from 'react';
import Link from 'next/link';
import { MoreVertical, Layers, CheckSquare, Edit2, Trash2, ArrowUpRight } from 'lucide-react';
import type { Project, AuthUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  currentUser?: AuthUser | null;
}

export function ProjectCard({ project, onEdit, onDelete, currentUser }: ProjectCardProps) {
  const lanesCount = project._count?.lanes ?? 0;
  const cardsCount = project._count?.cards ?? 0;

  const totalLanes = project.totalLanes ?? lanesCount;
  const totalCards = project.totalCards ?? cardsCount;
  const completedCards = project.completedCards ?? 0;
  const completionPercentage =
    project.completionPercentage ??
    (totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';
  const isCreator = project.createdBy === currentUser?.id;
  const isManager = currentUser?.role === 'MANAGER';

  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin || (isManager && isCreator);
  const showMenu = canEdit || canDelete;

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/projects/${project.slug || project.id}`}
                className="font-semibold text-foreground tracking-tight transition-colors group-hover:text-primary"
              >
                <h3 className="line-clamp-1 text-base font-semibold">{project.name}</h3>
              </Link>

              {/* Status Badge */}
              {completionPercentage === 100 && totalCards > 0 ? (
                <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Completed
                </span>
              ) : completionPercentage > 0 ? (
                <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  In Progress
                </span>
              ) : totalCards === 0 ? (
                <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border/50">
                  Empty
                </span>
              ) : (
                <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Not Started
                </span>
              )}
            </div>
          </div>

          {showMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  />
                }
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Project options</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit(project)} className="gap-2 cursor-pointer">
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(project)}
                    className="gap-2 text-destructive cursor-pointer focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs text-muted-foreground leading-relaxed">
          {project.description || 'No description provided.'}
        </p>

        {/* Progress & Report Metrics */}
        <div className="mt-4 rounded-lg bg-muted/40 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Progress Report</span>
            <span className="font-bold text-foreground">{completionPercentage}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                completionPercentage === 100 ? 'bg-emerald-500' : 'bg-primary'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span>{totalLanes} {totalLanes === 1 ? 'Lane' : 'Lanes'}</span>
            <span>{totalCards} Total {totalCards === 1 ? 'Task' : 'Tasks'}</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {completedCards} Done
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            <span>{lanesCount} {lanesCount === 1 ? 'lane' : 'lanes'}</span>
          </span>
          <span className="flex items-center gap-1">
            <CheckSquare className="h-3.5 w-3.5" />
            <span>{cardsCount} {cardsCount === 1 ? 'card' : 'cards'}</span>
          </span>
        </div>

        <Link
          href={`/projects/${project.slug || project.id}`}
          className="flex items-center gap-1 font-medium text-foreground transition-colors hover:text-primary"
        >
          <span>Open</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
