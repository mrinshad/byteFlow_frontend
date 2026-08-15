'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageSquare, RotateCcw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, type Card, type Priority } from '@/lib/api';
import { useBoardStore } from '@/lib/store/use-board-store';
import { TagBadge } from '@/components/tags/tag-badge';
import { Button } from '@/components/ui/button';

interface CardItemProps {
  card: Card;
}

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; bg: string; text: string; border: string }
> = {
  LOW: {
    label: 'Low',
    bg: 'bg-slate-500/10 dark:bg-slate-400/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
  },
  MEDIUM: {
    label: 'Medium',
    bg: 'bg-blue-500/10 dark:bg-blue-400/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
  },
  HIGH: {
    label: 'High',
    bg: 'bg-amber-500/10 dark:bg-amber-400/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
  },
  CRITICAL: {
    label: 'Critical',
    bg: 'bg-rose-500/10 dark:bg-rose-400/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20',
  },
};

export function CardItem({ card }: CardItemProps) {
  const openCardDrawer = useBoardStore((state) => state.openCardDrawer);
  const queryClient = useQueryClient();

  const isDeleted = !!card.deletedAt;

  const restoreMutation = useMutation({
    mutationFn: () => api.cards.restore(card.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.projectId] });
      queryClient.invalidateQueries({ queryKey: ['lanes', card.projectId] });
      toast.success('Card restored successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to restore card');
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: isDeleted,
    data: {
      type: 'Card',
      card,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const priorityInfo = PRIORITY_CONFIG[card.priority] || PRIORITY_CONFIG.MEDIUM;

  const isOverdue =
    card.dueDate &&
    new Date(card.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  const formattedDueDate = card.dueDate
    ? new Date(card.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const commentCount = card._count?.comments ?? 0;
  const tags = card.tags?.map((t) => t.tag) || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => openCardDrawer(card.id)}
      className={`group relative flex flex-col gap-2 rounded-lg border p-3 shadow-xs transition-all duration-150 cursor-pointer select-none ${
        isDeleted
          ? 'border-dashed border-destructive/40 bg-muted/40 opacity-75'
          : 'border-border/70 bg-card hover:border-border hover:shadow-sm'
      } ${isDragging ? 'opacity-30 ring-2 ring-primary/50' : ''}`}
    >
      {/* Header: Deleted Banner or Tag Badges */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        {isDeleted ? (
          <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold text-rose-500 uppercase tracking-wider border border-rose-500/20">
            Deleted / Archived
          </span>
        ) : (
          tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} size="xs" />
              ))}
            </div>
          )
        )}

        {isDeleted && (
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              restoreMutation.mutate();
            }}
            disabled={restoreMutation.isPending}
            className="h-5 px-1.5 gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            title="Restore deleted card"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Restore</span>
          </Button>
        )}
      </div>

      {/* Title */}
      <h4
        className={`text-xs font-medium leading-snug line-clamp-3 transition-colors ${
          isDeleted
            ? 'line-through text-muted-foreground'
            : 'text-foreground group-hover:text-primary'
        }`}
      >
        {card.title}
      </h4>

      {/* Description Preview */}
      {card.description && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed whitespace-pre-wrap break-words">
          {card.description}
        </p>
      )}

      {/* Metadata Badges Footer */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5 text-[11px]">
        <div className="flex items-center gap-1.5">
          {/* Priority Badge */}
          <span
            className={`inline-flex items-center rounded px-1.5 py-0.5 font-medium border text-[10px] leading-none ${priorityInfo.bg} ${priorityInfo.text} ${priorityInfo.border}`}
          >
            {priorityInfo.label}
          </span>

          {/* Due Date */}
          {formattedDueDate && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] ${
                isOverdue
                  ? 'font-medium text-destructive'
                  : 'text-muted-foreground'
              }`}
              title={isOverdue ? 'Overdue' : 'Due date'}
            >
              <Calendar className="h-3 w-3" />
              <span>{formattedDueDate}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Comments Count */}
          {commentCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{commentCount}</span>
            </span>
          )}

          {/* Assignee Avatar */}
          {card.assigneeId && (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary ring-1 ring-primary/20"
              title={`Assigned to ${card.assigneeId}`}
            >
              {card.assigneeId.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
