'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  PlusCircle,
  ArrowRight,
  AlertCircle,
  Calendar,
  UserCheck,
  UserX,
  Tag as TagIcon,
  MessageSquare,
  Edit,
  Trash2,
  Layers,
  History,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { api, type ActivityLog } from '@/lib/api';

interface ActivityTimelineProps {
  cardId?: string;
  projectId?: string;
  limit?: number;
}

export function ActivityTimeline({ cardId, projectId, limit = 20 }: ActivityTimelineProps) {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: cardId
      ? ['activities', 'card', cardId]
      : ['activities', 'project', projectId],
    queryFn: async ({ pageParam = 1 }) => {
      if (cardId) return api.activities.listByCard(cardId, { page: pageParam as number, limit });
      if (projectId) return api.activities.listByProject(projectId, { page: pageParam as number, limit });
      return { success: true, data: [], meta: { total: 0, page: 1, limit, totalPages: 0, hasMore: false } };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.meta) return undefined;
      const { page, totalPages, hasMore } = lastPage.meta;
      if (typeof hasMore === 'boolean') {
        return hasMore ? page + 1 : undefined;
      }
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!cardId || !!projectId,
  });

  const activities = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data]
  );
  const totalActivities = data?.pages[0]?.meta?.total ?? activities.length;

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const scrollContainer = sentinel.closest('.overflow-y-auto') || null;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: scrollContainer,
        rootMargin: '120px',
        threshold: 0.05,
      }
    );

    observer.observe(sentinel);

    const handleScroll = () => {
      if (!scrollContainer) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer as HTMLElement;
      if (scrollTop + clientHeight >= scrollHeight - 120) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      observer.disconnect();
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderActionContent = (activity: ActivityLog) => {
    const { action, oldValue, newValue, lane, tag, card } = activity;
    const cardTitle = card?.title || (newValue as any)?.title || (oldValue as any)?.title;
    const cardLabel = cardTitle ? (
      <strong className="font-semibold text-foreground">&quot;{cardTitle}&quot;</strong>
    ) : (
      'this card'
    );

    switch (action) {
      case 'CREATE_CARD':
        return (
          <span>
            created card {cardTitle ? <strong className="font-semibold text-foreground">&quot;{cardTitle}&quot;</strong> : ''}{' '}
            {lane?.name && (
              <>
                in <strong className="font-semibold text-foreground">{lane.name}</strong>
              </>
            )}
          </span>
        );
      case 'MOVE_CARD':
        return (
          <span>
            moved card {cardLabel}{' '}
            to <strong className="font-semibold text-foreground">{lane?.name || (newValue as any)?.laneId || 'another lane'}</strong>
          </span>
        );
      case 'CHANGE_PRIORITY':
        return (
          <span>
            changed priority of card {cardLabel} from{' '}
            <span className="font-medium text-muted-foreground line-through">
              {(oldValue as any)?.priority || 'None'}
            </span>{' '}
            to{' '}
            <strong className="font-semibold text-foreground">
              {(newValue as any)?.priority}
            </strong>
          </span>
        );
      case 'CHANGE_DUE_DATE':
        const newDue = (newValue as any)?.dueDate
          ? new Date((newValue as any).dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
          : 'None';
        return (
          <span>
            changed due date of card {cardLabel} to <strong className="font-semibold text-foreground">{newDue}</strong>
          </span>
        );
      case 'ASSIGN_USER':
        const assignee = (newValue as any)?.assigneeName || (newValue as any)?.assigneeId || 'a team member';
        return (
          <span>
            assigned card {cardLabel} to <strong className="font-semibold text-foreground">{assignee}</strong>
          </span>
        );
      case 'UNASSIGN_USER':
        return <span>removed assignment from card {cardLabel}</span>;
      case 'ADD_TAG_TO_CARD':
        return (
          <span>
            added tag <strong className="font-semibold text-foreground">{tag?.name || (newValue as any)?.tagName || 'tag'}</strong> to card {cardLabel}
          </span>
        );
      case 'REMOVE_TAG_FROM_CARD':
        return (
          <span>
            removed tag <strong className="font-semibold text-foreground">{tag?.name || (oldValue as any)?.tagName || 'tag'}</strong> from card {cardLabel}
          </span>
        );
      case 'CREATE_COMMENT':
        return <span>commented on card {cardLabel}</span>;
      case 'UPDATE_COMMENT':
        return <span>edited a comment on card {cardLabel}</span>;
      case 'DELETE_COMMENT':
        return <span>deleted a comment from card {cardLabel}</span>;
      case 'UPDATE_CARD':
        return <span>updated card details for {cardLabel}</span>;
      case 'DELETE_CARD':
        return <span>deleted card {cardLabel}</span>;
      case 'RESTORE_CARD':
        return <span>restored card {cardLabel}</span>;
      case 'CREATE_LANE':
        return (
          <span>
            created lane <strong className="font-semibold text-foreground">{(newValue as any)?.name}</strong>
          </span>
        );
      case 'UPDATE_LANE':
        return (
          <span>
            updated lane <strong className="font-semibold text-foreground">{lane?.name || (newValue as any)?.name || 'settings'}</strong>
          </span>
        );
      case 'DELETE_LANE':
        return <span>deleted a lane</span>;
      case 'CREATE_TAG':
        return (
          <span>
            created project tag <strong className="font-semibold text-foreground">{(newValue as any)?.name}</strong>
          </span>
        );
      case 'UPDATE_PROJECT':
        return <span>updated project details</span>;
      default:
        return <span>performed {action.toLowerCase().replace(/_/g, ' ')}</span>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE_CARD':
      case 'CREATE_LANE':
      case 'CREATE_TAG':
        return <PlusCircle className="h-3.5 w-3.5 text-emerald-500" />;
      case 'MOVE_CARD':
        return <ArrowRight className="h-3.5 w-3.5 text-blue-500" />;
      case 'CHANGE_PRIORITY':
        return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
      case 'CHANGE_DUE_DATE':
        return <Calendar className="h-3.5 w-3.5 text-purple-500" />;
      case 'ASSIGN_USER':
        return <UserCheck className="h-3.5 w-3.5 text-cyan-500" />;
      case 'UNASSIGN_USER':
        return <UserX className="h-3.5 w-3.5 text-slate-500" />;
      case 'ADD_TAG_TO_CARD':
      case 'REMOVE_TAG_FROM_CARD':
        return <TagIcon className="h-3.5 w-3.5 text-indigo-500" />;
      case 'CREATE_COMMENT':
      case 'UPDATE_COMMENT':
        return <MessageSquare className="h-3.5 w-3.5 text-sky-500" />;
      case 'DELETE_CARD':
      case 'DELETE_LANE':
      case 'DELETE_COMMENT':
      case 'DELETE_TAG':
        return <Trash2 className="h-3.5 w-3.5 text-rose-500" />;
      case 'RESTORE_CARD':
        return <RotateCcw className="h-3.5 w-3.5 text-emerald-500" />;
      default:
        return <Edit className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>Loading activity history...</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 py-6 text-center text-xs text-muted-foreground/70">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-border/60">
      {activities.map((act) => {
        const performer = act.performedBy || 'Team Member';

        return (
          <div key={act.id} className="relative flex items-start gap-2.5 text-xs text-muted-foreground">
            {/* Timeline Dot Icon */}
            <span className="absolute -left-4 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-background ring-2 ring-background">
              {getActionIcon(act.action)}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="leading-snug break-words">
                <span className="font-semibold text-foreground mr-1.5">{performer}</span>
                {renderActionContent(act)}
              </div>
              <span className="mt-0.5 block text-[10px] text-muted-foreground/70">
                {formatTimestamp(act.createdAt)}
              </span>
            </div>
          </div>
        );
      })}

      {/* Infinite Scroll Sentinel */}
      {hasNextPage && <div ref={sentinelRef} className="h-4 w-full" />}

      {/* Loading More Spinner */}
      {isFetchingNextPage && (
        <div className="py-2.5 flex items-center justify-center gap-2 text-xs text-muted-foreground animate-in fade-in duration-200">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span>Loading older activities...</span>
        </div>
      )}

      {/* Manual Fallback Button (visible if user stops scrolling or observer didn't trigger) */}
      {hasNextPage && !isFetchingNextPage && (
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors py-1 px-3 rounded cursor-pointer"
          >
            Load older activities
          </button>
        </div>
      )}

      {/* End of Activity Log Indicator */}
      {!hasNextPage && activities.length > 0 && (
        <div className="py-3 text-center text-[11px] text-muted-foreground/60 border-t border-dashed border-border/40 mt-3">
          All {totalActivities} {totalActivities === 1 ? 'activity' : 'activities'} loaded
        </div>
      )}
    </div>
  );
}
