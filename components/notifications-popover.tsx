'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CheckCheck,
  AtSign,
  FolderPlus,
  UserCheck,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, type Notification, type NotificationType } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useUserNotificationsSocket } from '@/lib/use-project-socket';
import { useBoardStore } from '@/lib/store/use-board-store';
import { Button } from '@/components/ui/button';

export function NotificationsPopover() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'mentions'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const openCardDrawer = useBoardStore((state) => state.openCardDrawer);

  // Connect user-level socket for real-time notification alerts
  useUserNotificationsSocket(user?.id);

  // Fetch unread count
  const { data: countData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.notifications.unreadCount(),
    enabled: isAuthenticated && !!user,
    refetchInterval: 60000,
  });

  // Fetch notifications list
  const { data: listData, isLoading } = useQuery({
    queryKey: ['notifications', activeTab],
    queryFn: () =>
      api.notifications.list({
        type: activeTab === 'mentions' ? 'MENTION' : 'ALL',
        limit: 30,
      }),
    enabled: isAuthenticated && !!user && isOpen,
  });

  const unreadCount = countData?.data?.unreadCount || 0;
  const notifications = listData?.data || [];

  // Close on outside click or escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('All notifications marked as read');
    },
  });

  const handleNotificationClick = (item: Notification) => {
    if (!item.isRead) {
      markAsReadMutation.mutate(item.id);
    }

    setIsOpen(false);

    if (item.projectId) {
      const targetUrl = item.cardId
        ? `/projects/${item.projectId}?cardId=${item.cardId}`
        : `/projects/${item.projectId}`;
      router.push(targetUrl);
      if (item.cardId) {
        openCardDrawer(item.cardId);
      }
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'MENTION':
        return (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <AtSign className="h-3.5 w-3.5" />
          </div>
        );
      case 'ASSIGNED_TO_PROJECT':
        return (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <FolderPlus className="h-3.5 w-3.5" />
          </div>
        );
      case 'ASSIGNED_TO_CARD':
        return (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <UserCheck className="h-3.5 w-3.5" />
          </div>
        );
      case 'CARD_COMMENT':
        return (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <MessageSquare className="h-3.5 w-3.5" />
          </div>
        );
      case 'CARD_UPDATED':
        return (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        );
      default:
        return (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Bell className="h-3.5 w-3.5" />
          </div>
        );
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-xs animate-in zoom-in-50">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-96 max-w-sm sm:max-w-none mx-auto sm:mx-0 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md p-0 shadow-xl text-popover-foreground z-50 animate-in fade-in-0 zoom-in-95 origin-top-right">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="h-6 px-2 text-[11px] font-medium gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="h-3 w-3 text-primary" />
                <span>Mark all read</span>
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-border/40 px-3 pt-2 gap-2 bg-muted/20">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`pb-2 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mentions')}
              className={`flex items-center gap-1 pb-2 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'mentions'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <AtSign className="h-3 w-3" />
              <span>Mentions</span>
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/30">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-2">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-foreground">All caught up!</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {activeTab === 'mentions'
                    ? 'No @mentions found for your account.'
                    : 'You have no new updates right now.'}
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-muted/50 ${
                    !item.isRead ? 'bg-primary/[0.04]' : ''
                  }`}
                >
                  {getNotificationIcon(item.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs truncate ${
                          !item.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground/90'
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words">
                      {item.message}
                    </p>
                  </div>

                  {!item.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
