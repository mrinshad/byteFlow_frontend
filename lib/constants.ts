import type { Priority, Role } from './api';

export const APP_CONFIG = {
  NAME: 'ByteFlow',
  DESCRIPTION: 'Modern Real-Time Kanban Workflow Management',
  STORAGE_TOKEN_KEY: 'byteflow_token',
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
} as const;

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bg: string; dot: string; border: string }
> = {
  LOW: {
    label: 'Low',
    color: 'text-blue-500 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    dot: 'bg-blue-500',
    border: 'border-blue-500/20',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    dot: 'bg-amber-500',
    border: 'border-amber-500/20',
  },
  HIGH: {
    label: 'High',
    color: 'text-orange-500 dark:text-orange-400',
    bg: 'bg-orange-500/10',
    dot: 'bg-orange-500',
    border: 'border-orange-500/20',
  },
  CRITICAL: {
    label: 'Critical',
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-500/10',
    dot: 'bg-red-500',
    border: 'border-red-500/20',
  },
};

export const ROLE_CONFIG: Record<
  Role,
  { label: string; badge: string; description: string }
> = {
  ADMIN: {
    label: 'Administrator',
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    description: 'Full workspace and system governance',
  },
  MANAGER: {
    label: 'Project Manager',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    description: 'Project creation, board management, and task coordination',
  },
  MEMBER: {
    label: 'Team Member',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    description: 'Task execution, collaboration, and comments',
  },
};

export const SOCKET_EVENTS = {
  // User
  JOIN_USER: 'join:user',
  LEAVE_USER: 'leave:user',
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_READ_ALL: 'notification:read:all',

  // Project
  JOIN_PROJECT: 'join:project',
  LEAVE_PROJECT: 'leave:project',
  LANE_CREATED: 'lane:created',
  LANE_UPDATED: 'lane:updated',
  LANE_REORDERED: 'lane:reordered',
  LANE_DELETED: 'lane:deleted',
  CARD_CREATED: 'card:created',
  CARD_UPDATED: 'card:updated',
  CARD_MOVED: 'card:moved',
  CARD_REORDERED: 'card:reordered',
  CARD_DELETED: 'card:deleted',
  CARD_RESTORED: 'card:restored',
  COMMENT_CREATED: 'comment:created',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',
  TAG_CREATED: 'tag:created',
  TAG_UPDATED: 'tag:updated',
  TAG_DELETED: 'tag:deleted',
  CARD_TAG_ADDED: 'card:tag:added',
  CARD_TAG_REMOVED: 'card:tag:removed',
} as const;
