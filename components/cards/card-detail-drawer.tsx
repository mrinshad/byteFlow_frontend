'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Trash2,
  Calendar,
  User,
  Layers,
  Tag as TagIcon,
  Plus,
  Check,
  History,
  Search,
  Share2,
  Route,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { api, type Card, type Priority, type Lane, type Tag } from '@/lib/api';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useBoardStore } from '@/lib/store/use-board-store';
import { CommentSection } from '@/components/cards/comment-section';
import { CardJourney } from '@/components/cards/card-journey';
import { TagBadge } from '@/components/tags/tag-badge';
import { ActivityTimeline } from '@/components/activities/activity-timeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const TAG_COLOR_PRESETS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#a855f7', // Purple
  '#64748b', // Slate
];

interface CardDetailDrawerProps {
  projectId: string;
}

export function CardDetailDrawer({ projectId }: CardDetailDrawerProps) {
  const { user } = useAuth();
  const canManageCards = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN';
  const { selectedCardId, isDrawerOpen, closeCardDrawer } = useBoardStore();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareDeletedModalOpen, setShareDeletedModalOpen] = useState(false);

  const restoreMutation = useMutation({
    mutationFn: () => (card ? api.cards.restore(card.id) : Promise.reject('No card')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', selectedCardId] });
      queryClient.invalidateQueries({ queryKey: ['cards', projectId] });
      toast.success('Card restored successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to restore card');
    },
  });

  // Tag Popover State
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const debouncedTagSearch = useDebounce(tagSearch, 200);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLOR_PRESETS[0]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // Local state & refs for instantaneous tag selection & debounced backend sync
  const [localTagIds, setLocalTagIds] = useState<string[] | null>(null);
  const pendingTogglesRef = useRef<Map<string, boolean>>(new Map());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch card details
  const { data, isLoading } = useQuery({
    queryKey: ['card', selectedCardId],
    queryFn: () => (selectedCardId ? api.cards.getById(selectedCardId) : null),
    enabled: !!selectedCardId && isDrawerOpen,
  });

  const notifiedDeletedCardRef = useRef<string | null>(null);

  useEffect(() => {
    if (data?.data?.id && data?.data?.deletedAt && notifiedDeletedCardRef.current !== data.data.id) {
      notifiedDeletedCardRef.current = data.data.id;
      toast.warning('This card has been deleted');
    }
  }, [data?.data?.id, data?.data?.deletedAt]);

  useEffect(() => {
    if (!isDrawerOpen) {
      notifiedDeletedCardRef.current = null;
    }
  }, [isDrawerOpen]);

  // Fetch lanes for moving lane selector
  const { data: lanesData } = useQuery({
    queryKey: ['lanes', projectId],
    queryFn: () => api.lanes.listByProject(projectId),
    enabled: isDrawerOpen,
  });

  // Fetch project tags
  const { data: tagsData } = useQuery({
    queryKey: ['tags', projectId],
    queryFn: () => api.tags.listByProject(projectId),
    enabled: isDrawerOpen,
  });

  // Fetch project details for members
  const { data: projectData } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.projects.getById(projectId),
    enabled: isDrawerOpen,
  });

  const card = data?.data;
  const lanes = lanesData?.data || [];
  const projectTags = tagsData?.data || [];
  const rawMembers = projectData?.data?.members || [];
  const projectMembers = rawMembers.filter(
    (m) => m.user?.role !== 'SUPER_ADMIN'
  );

  const serverTagIds = useMemo(
    () => (card?.tags || []).map((t) => t.tag?.id || t.tagId).filter(Boolean) as string[],
    [card?.tags]
  );

  const currentAssignedIds = localTagIds ?? serverTagIds;
  const isTagAssigned = useCallback(
    (tagId: string) => currentAssignedIds.includes(tagId),
    [currentAssignedIds]
  );

  const assignedTags = useMemo(() => {
    const tagMap = new Map<string, Tag>();
    projectTags.forEach((t) => tagMap.set(t.id, t));
    (card?.tags || []).forEach((ct) => {
      if (ct.tag) tagMap.set(ct.tag.id, ct.tag);
    });
    return currentAssignedIds
      .map((id) => tagMap.get(id))
      .filter((t): t is Tag => !!t);
  }, [currentAssignedIds, projectTags, card?.tags]);

  // Reset local state when server data updates if no pending toggles
  useEffect(() => {
    if (pendingTogglesRef.current.size === 0) {
      setLocalTagIds(null);
    }
  }, [card?.tags]);

  const [prevCard, setPrevCard] = useState(card);
  if (card !== prevCard) {
    setPrevCard(card);
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setPriority(card.priority);
      setDueDate(card.dueDate ? card.dueDate.split('T')[0] : '');
      setAssigneeId(card.assigneeId || '');
    }
  }

  // Sync cardId in URL when drawer opens
  useEffect(() => {
    if (isDrawerOpen && selectedCardId) {
      const url = new URL(window.location.href);
      if (url.searchParams.get('cardId') !== selectedCardId) {
        url.searchParams.set('cardId', selectedCardId);
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [isDrawerOpen, selectedCardId]);

  // Close drawer on Escape key press
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (updateData: {
      title?: string;
      description?: string;
      priority?: Priority;
      dueDate?: string | null;
      assigneeId?: string | null;
    }) => {
      if (!selectedCardId) throw new Error('No card selected');
      return api.cards.update(selectedCardId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', projectId] });
      queryClient.invalidateQueries({ queryKey: ['card', selectedCardId] });
      queryClient.invalidateQueries({ queryKey: ['lanes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activities', 'card', selectedCardId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update card');
    },
  });

  // Move Lane Mutation
  const moveMutation = useMutation({
    mutationFn: (targetLaneId: string) => {
      if (!selectedCardId) throw new Error('No card selected');
      return api.cards.move(selectedCardId, { targetLaneId, position: 65536 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', projectId] });
      queryClient.invalidateQueries({ queryKey: ['card', selectedCardId] });
      queryClient.invalidateQueries({ queryKey: ['lanes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activities', 'card', selectedCardId] });
      toast.success('Card moved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to move card');
    },
  });

  // Flush pending tag operations to server
  const flushPendingTagToggles = useCallback(async () => {
    if (pendingTogglesRef.current.size === 0 || !selectedCardId) return;

    const entries = Array.from(pendingTogglesRef.current.entries());
    pendingTogglesRef.current.clear();

    try {
      await Promise.all(
        entries.map(([tagId, shouldAssign]) =>
          shouldAssign
            ? api.tags.assignToCard(selectedCardId, tagId)
            : api.tags.removeFromCard(selectedCardId, tagId)
        )
      );

      queryClient.invalidateQueries({ queryKey: ['card', selectedCardId] });
      queryClient.invalidateQueries({ queryKey: ['cards', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tags', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activities', 'card', selectedCardId] });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update tags');
      setLocalTagIds(null);
    }
  }, [selectedCardId, projectId, queryClient]);

  // Clean up debounce timer and flush on unmount or card switch
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        flushPendingTagToggles();
      }
    };
  }, [selectedCardId, flushPendingTagToggles]);

  // Instant tag toggle handler with 350ms debounce
  const toggleTag = useCallback(
    (tagId: string) => {
      if (!selectedCardId) return;

      const isAssigned = currentAssignedIds.includes(tagId);
      const nextAssigned = isAssigned
        ? currentAssignedIds.filter((id) => id !== tagId)
        : [...currentAssignedIds, tagId];

      // 1. Instantly update UI (zero latency)
      setLocalTagIds(nextAssigned);

      // 2. Track pending mutation vs server baseline
      const isAssignedOnServer = serverTagIds.includes(tagId);
      const willBeAssigned = !isAssigned;

      if (willBeAssigned === isAssignedOnServer) {
        pendingTogglesRef.current.delete(tagId);
      } else {
        pendingTogglesRef.current.set(tagId, willBeAssigned);
      }

      // 3. Debounce network sync
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        flushPendingTagToggles();
      }, 350);
    },
    [selectedCardId, currentAssignedIds, serverTagIds, flushPendingTagToggles]
  );

  // Create Tag Mutation
  const createTagMutation = useMutation({
    mutationFn: (data: { name: string; color: string }) =>
      api.tags.create({ projectId, name: data.name, color: data.color }),
    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ['tags', projectId] });
      if (res.data?.id && selectedCardId) {
        try {
          await api.tags.assignToCard(selectedCardId, res.data.id);
          queryClient.invalidateQueries({ queryKey: ['card', selectedCardId] });
          queryClient.invalidateQueries({ queryKey: ['cards', projectId] });
        } catch (e: any) {
          toast.error(e?.message || 'Failed to assign new tag');
        }
      }
      setNewTagName('');
      setIsCreatingTag(false);
      toast.success('Tag created and assigned');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create tag');
    },
  });

  // Delete Card Mutation
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!selectedCardId) throw new Error('No card selected');
      return api.cards.delete(selectedCardId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', projectId] });
      queryClient.invalidateQueries({ queryKey: ['lanes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Card deleted');
      setDeleteOpen(false);
      closeCardDrawer();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete card');
    },
  });

  if (!isDrawerOpen || !selectedCardId) return null;

  const handleTitleBlur = () => {
    if (title.trim() && title.trim() !== card?.title) {
      updateMutation.mutate({ title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description.trim() !== (card?.description || '')) {
      updateMutation.mutate({ description: description.trim() || undefined });
    }
  };

  const handlePriorityChange = (newPriority: Priority) => {
    setPriority(newPriority);
    updateMutation.mutate({ priority: newPriority });
  };

  const handleDueDateChange = (newDate: string) => {
    setDueDate(newDate);
    updateMutation.mutate({ dueDate: newDate ? new Date(newDate).toISOString() : null });
  };


  const handleCloseDrawer = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      flushPendingTagToggles();
    }
    const url = new URL(window.location.href);
    if (url.searchParams.has('cardId')) {
      url.searchParams.delete('cardId');
      window.history.replaceState({}, '', url.toString());
    }
    closeCardDrawer();
  };

  const handleShareCard = async () => {
    if (!selectedCardId) return;
    if (card?.deletedAt) {
      setShareDeletedModalOpen(true);
      return;
    }
    const projectSlug = useBoardStore.getState().currentProject?.slug;
    const projectIdentifier = projectSlug || projectId;
    const url = `${window.location.origin}/projects/${projectIdentifier}?cardId=${selectedCardId}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast.success('Card link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleCreateTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTagName.trim();
    if (!trimmed) return;

    // Reuse existing project tag if name matches (case-insensitive)
    const existing = projectTags.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (existing) {
      if (!isTagAssigned(existing.id)) {
        toggleTag(existing.id);
        toast.success(`Tag "${existing.name}" assigned`);
      } else {
        toast.info(`Tag "${existing.name}" is already assigned`);
      }
      setNewTagName('');
      setIsCreatingTag(false);
      return;
    }

    createTagMutation.mutate({ name: trimmed, color: newTagColor });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleCloseDrawer}
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Card Details"
        data-role="card-detail-drawer"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-background shadow-2xl transition-transform duration-200"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-3.5">
          <div className="flex items-center gap-2">
            {card?.number && (
              <span className="flex items-center rounded-md bg-muted/80 border border-border/50 px-2.5 py-1 text-sm font-mono font-bold text-muted-foreground">
                #{card.number}
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              <Layers className="h-3.5 w-3.5" />
              <span>{card?.lane?.name || 'Lane'}</span>
            </span>
            {card?.deletedAt && (
              <span
                data-role="deleted-badge"
                className="rounded bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-500 border border-rose-500/30 uppercase tracking-wider"
              >
                Deleted
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {card?.deletedAt && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => restoreMutation.mutate()}
                disabled={restoreMutation.isPending}
                className="h-7 px-2.5 gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                title="Restore deleted card"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restore</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleShareCard}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              title={card?.deletedAt ? 'Cannot share deleted card' : 'Share card link'}
              aria-label="Share card link"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            {!card?.deletedAt && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setDeleteOpen(true)}
                className="text-muted-foreground hover:text-destructive"
                title="Delete card"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleCloseDrawer}
              aria-label="Close drawer"
              data-role="close-card-drawer"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Drawer Body */}
        {isLoading || !card ? (
          <div className="flex flex-1 items-center justify-center p-8 text-xs text-muted-foreground">
            Loading card details...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Deleted Card Banner */}
            {card.deletedAt && (
              <div
                data-role="deleted-card-banner"
                className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive dark:text-rose-400"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                  <div className="min-w-0">
                    <span className="font-semibold">This card has been deleted</span>
                    <span className="ml-1.5 text-[11px] opacity-80">
                      ({new Date(card.deletedAt).toLocaleDateString()})
                    </span>
                  </div>
                </div>
                {canManageCards && (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => restoreMutation.mutate()}
                    disabled={restoreMutation.isPending}
                    className="h-6 px-2.5 gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{restoreMutation.isPending ? 'Restoring...' : 'Restore Card'}</span>
                  </Button>
                )}
              </div>
            )}

            {/* Title Section */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                disabled={Boolean(card.deletedAt)}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className={`mt-1 h-9 text-base font-semibold border-transparent hover:border-border focus:border-border px-2 ${
                  card.deletedAt ? 'cursor-not-allowed opacity-75' : ''
                }`}
                placeholder="Card title..."
              />
            </div>

            {/* Tags Section */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <TagIcon className="h-3.5 w-3.5" />
                  <span>Tags</span>
                </label>
                {!card.deletedAt && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setTagPickerOpen(!tagPickerOpen)}
                      className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      <span>Tag</span>
                    </Button>

                  {/* Tag Selector Popover */}
                  {tagPickerOpen && (
                    <div className="absolute right-0 top-7 z-50 w-72 rounded-xl border border-border bg-popover p-3 shadow-xl">
                      <div className="flex items-center justify-between pb-2 border-b border-border/50">
                        <span className="text-xs font-semibold">Select or Create Tag</span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setTagPickerOpen(false)}
                          className="h-4 w-4 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Tag Search / Filter Input */}
                      {projectTags.length > 2 && (
                        <div className="pt-2 pb-1 relative">
                          <Search className="absolute left-2 top-3.5 h-3 w-3 text-muted-foreground pointer-events-none" />
                          <Input
                            placeholder="Filter project tags..."
                            value={tagSearch}
                            onChange={(e) => setTagSearch(e.target.value)}
                            className="h-6 text-[11px] pl-6 pr-5"
                          />
                          {tagSearch && (
                            <button
                              type="button"
                              onClick={() => setTagSearch('')}
                              className="absolute right-1.5 top-3 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Clear tag search"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Existing Project Tags - Compact Tag Cloud */}
                      <div className="py-2 max-h-44 overflow-y-auto">
                        {projectTags.length === 0 ? (
                          <div className="text-[11px] text-muted-foreground/70 py-1">
                            No tags yet. Create one below.
                          </div>
                        ) : (() => {
                            const filtered = projectTags.filter((t) =>
                              t.name.toLowerCase().includes(debouncedTagSearch.trim().toLowerCase())
                            );
                            if (filtered.length === 0) {
                              return (
                                <div className="text-[11px] text-muted-foreground/70 py-1 text-center">
                                  No tags matching &quot;{debouncedTagSearch}&quot;
                                </div>
                              );
                            }
                            return (
                              <div
                                data-role="tag-picker-cloud"
                                className="flex flex-wrap items-center gap-1.5 py-1"
                              >
                                {filtered.map((tag) => {
                                  const assigned = isTagAssigned(tag.id);
                                  return (
                                    <button
                                      key={tag.id}
                                      type="button"
                                      onClick={() => toggleTag(tag.id)}
                                      className="rounded-md transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
                                      title={
                                        assigned
                                          ? `Remove tag "${tag.name}"`
                                          : `Add tag "${tag.name}"`
                                      }
                                    >
                                      <TagBadge tag={tag} size="xs" selected={assigned} />
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })()
                        }
                      </div>

                      {/* Create New Tag */}
                      <div className="pt-2 border-t border-border/50">
                        {!isCreatingTag ? (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setIsCreatingTag(true)}
                            className="w-full justify-center text-xs h-7"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Create new tag
                          </Button>
                        ) : (
                          <form onSubmit={handleCreateTagSubmit} className="space-y-2">
                            <Input
                              placeholder="Tag name..."
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              autoFocus
                              className="h-7 text-xs"
                            />
                            {/* Color presets */}
                            <div className="flex items-center gap-1">
                              {TAG_COLOR_PRESETS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setNewTagColor(color)}
                                  className="h-4 w-4 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                                  style={{ backgroundColor: color }}
                                >
                                  {newTagColor === color && (
                                    <Check className="h-2.5 w-2.5 text-white" />
                                  )}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-1 justify-end pt-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => setIsCreatingTag(false)}
                                className="h-6 px-2 text-xs"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                size="xs"
                                disabled={createTagMutation.isPending || !newTagName.trim()}
                                className="h-6 px-2 text-xs"
                              >
                                Create
                              </Button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

              {/* Assigned Tags List */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5 min-h-[28px]">
                {assignedTags.length === 0 ? (
                  <span className="text-xs text-muted-foreground/60 italic">No tags assigned</span>
                ) : (
                  assignedTags.map((tag) => (
                    <TagBadge
                      key={tag.id}
                      tag={tag}
                      size="sm"
                      onRemove={card.deletedAt ? undefined : () => toggleTag(tag.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
              {/* Lane Selector */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Lane</label>
                <select
                  value={card.laneId}
                  disabled={Boolean(card.deletedAt)}
                  onChange={(e) => moveMutation.mutate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {lanes.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Priority</label>
                <select
                  value={priority}
                  disabled={Boolean(card.deletedAt)}
                  onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Due Date</span>
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  disabled={Boolean(card.deletedAt)}
                  onChange={(e) => handleDueDateChange(e.target.value)}
                  className="mt-1 h-8 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* Assignee */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>Assignee</span>
                </label>
                <select
                  value={assigneeId}
                  disabled={Boolean(card.deletedAt)}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setAssigneeId(newId);
                    updateMutation.mutate({ assigneeId: newId || null });
                  }}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user?.name || m.user?.username || m.userId} (@{m.user?.username || 'member'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Description</label>
              <Textarea
                placeholder="Add more details or acceptance criteria..."
                value={description}
                disabled={Boolean(card.deletedAt)}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                className="mt-1.5 min-h-[120px] text-xs resize-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Comments Section (Phase 4 Active) */}
            <div className="pt-4 border-t border-border/40">
              <CommentSection cardId={card.id} projectId={projectId} readOnly={Boolean(card.deletedAt)} />
            </div>

            {/* Card Journey Section */}
            <div className="pt-4 border-t border-border/40">
              <div className="flex items-center justify-between pb-2.5">
                <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <Route className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Card Journey</span>
                </span>
              </div>
              <CardJourney cardId={card.id} currentLaneName={card?.lane?.name} />
            </div>

            {/* Activity History Section (Phase 6 Active) */}
            <div data-role="activity-timeline" className="pt-4 border-t border-border/40">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <History className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Activity History</span>
                </span>
              </div>
              <ActivityTimeline cardId={card.id} limit={30} />
            </div>
          </div>
        )}
      </aside>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{card?.title}&quot;</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Share Deleted Card Dialog */}
      <Dialog open={shareDeletedModalOpen} onOpenChange={setShareDeletedModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span>Card is Deleted</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm text-muted-foreground">
              This card has been deleted. In order for others to access it, you have to restore it first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShareDeletedModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={restoreMutation.isPending}
              onClick={() => {
                restoreMutation.mutate(undefined, {
                  onSuccess: () => {
                    setShareDeletedModalOpen(false);
                    const projectSlug = useBoardStore.getState().currentProject?.slug;
                    const projectIdentifier = projectSlug || projectId;
                    const url = `${window.location.origin}/projects/${projectIdentifier}?cardId=${selectedCardId}`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(url);
                      toast.success('Card restored & link copied to clipboard!');
                    }
                  },
                });
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {restoreMutation.isPending ? 'Restoring...' : 'Restore Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
