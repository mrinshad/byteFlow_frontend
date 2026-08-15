'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { api, type ActivityLog } from '@/lib/api';

interface ActivityTimelineProps {
  cardId?: string;
  projectId?: string;
  limit?: number;
}

export function ActivityTimeline({ cardId, projectId, limit = 50 }: ActivityTimelineProps) {
  const { data, isLoading } = useQuery({
    queryKey: cardId
      ? ['activities', 'card', cardId]
      : ['activities', 'project', projectId],
    queryFn: () => {
      if (cardId) return api.activities.listByCard(cardId, limit);
      if (projectId) return api.activities.listByProject(projectId, limit);
      return { success: true, data: [] };
    },
    enabled: !!cardId || !!projectId,
  });

  const activities = data?.data || [];

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

    switch (action) {
      case 'CREATE_CARD':
        return (
          <span>
            created this card{' '}
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
            moved {card?.title ? <strong className="font-semibold text-foreground">&quot;{card.title}&quot;</strong> : 'this card'}{' '}
            to <strong className="font-semibold text-foreground">{lane?.name || (newValue as any)?.laneId || 'another lane'}</strong>
          </span>
        );
      case 'CHANGE_PRIORITY':
        return (
          <span>
            changed priority from{' '}
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
            changed due date to <strong className="font-semibold text-foreground">{newDue}</strong>
          </span>
        );
      case 'ASSIGN_USER':
        return (
          <span>
            assigned to <strong className="font-semibold text-foreground">{(newValue as any)?.assigneeId || 'a team member'}</strong>
          </span>
        );
      case 'UNASSIGN_USER':
        return <span>removed assignment</span>;
      case 'ADD_TAG_TO_CARD':
        return (
          <span>
            added tag <strong className="font-semibold text-foreground">{tag?.name || (newValue as any)?.tagName || 'tag'}</strong>
          </span>
        );
      case 'REMOVE_TAG_FROM_CARD':
        return (
          <span>
            removed tag <strong className="font-semibold text-foreground">{tag?.name || (oldValue as any)?.tagName || 'tag'}</strong>
          </span>
        );
      case 'CREATE_COMMENT':
        return <span>commented on this card</span>;
      case 'UPDATE_COMMENT':
        return <span>edited a comment</span>;
      case 'DELETE_COMMENT':
        return <span>deleted a comment</span>;
      case 'UPDATE_CARD':
        return <span>updated card details</span>;
      case 'DELETE_CARD':
        return <span>deleted this card</span>;
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
      default:
        return <Edit className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center text-xs text-muted-foreground">Loading activity history...</div>;
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
        const initials = performer.slice(0, 2).toUpperCase();

        return (
          <div key={act.id} className="relative flex items-start gap-2.5 text-xs text-muted-foreground">
            {/* Timeline Dot Icon */}
            <span className="absolute -left-4 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-background ring-2 ring-background">
              {getActionIcon(act.action)}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="leading-snug">
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
    </div>
  );
}
