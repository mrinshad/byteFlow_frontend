'use client';

import React from 'react';
import Link from 'next/link';
import { MoreVertical, Layers, CheckSquare, Clock, Edit2, Trash2, ArrowUpRight } from 'lucide-react';
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
          <Link
            href={`/projects/${project.id}`}
            className="flex-1 font-semibold text-foreground tracking-tight transition-colors group-hover:text-primary"
          >
            <h3 className="line-clamp-1 text-base font-semibold">{project.name}</h3>
          </Link>

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
          href={`/projects/${project.id}`}
          className="flex items-center gap-1 font-medium text-foreground transition-colors hover:text-primary"
        >
          <span>Open</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
