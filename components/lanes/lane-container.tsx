'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { api, type Lane, type Card } from '@/lib/api';
import { isDoneLane } from '@/lib/utils';
import { useBoardStore } from '@/lib/store/use-board-store';
import { LaneColumn } from '@/components/lanes/lane-column';
import { CardItem } from '@/components/cards/card-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface LaneContainerProps {
  projectId: string;
}

export function LaneContainer({ projectId }: LaneContainerProps) {
  const [isAddingLane, setIsAddingLane] = useState(false);
  const [newLaneName, setNewLaneName] = useState('');
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const queryClient = useQueryClient();

  const { search, priority, tagId, assigneeId, dueDateFilter, showDeleted } = useBoardStore();

  const activeFilters = {
    search: search.trim() || undefined,
    priority: priority !== 'ALL' ? priority : undefined,
    tagId: tagId !== 'ALL' ? tagId : undefined,
    assigneeId: assigneeId !== 'ALL' ? assigneeId : undefined,
    dueDateFilter: dueDateFilter !== 'all' ? dueDateFilter : undefined,
    includeDeleted: showDeleted || undefined,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  // Fetch Lanes
  const { data: lanesData, isLoading: lanesLoading } = useQuery({
    queryKey: ['lanes', projectId],
    queryFn: () => api.lanes.listByProject(projectId),
  });

  // Fetch Cards with backend-first filters
  const { data: cardsData, isLoading: cardsLoading } = useQuery({
    queryKey: ['cards', projectId, activeFilters],
    queryFn: () => api.cards.listByProject(projectId, activeFilters),
  });

  const lanes = lanesData?.data || [];
  const cards = cardsData?.data || [];

  // Group cards by laneId
  const cardsByLane = lanes.reduce<Record<string, Card[]>>((acc, lane) => {
    acc[lane.id] = cards
      .filter((c) => c.laneId === lane.id)
      .sort((a, b) => a.position - b.position);
    return acc;
  }, {});

  // Create Lane Mutation
  const createLaneMutation = useMutation({
    mutationFn: (name: string) => api.lanes.create({ projectId, name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Lane added');
      setNewLaneName('');
      setIsAddingLane(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create lane');
    },
  });

  // Reorder Lanes Mutation
  const reorderLanesMutation = useMutation({
    mutationFn: (items: Array<{ id: string; position: number }>) =>
      api.lanes.reorder({ projectId, items }),
    onSuccess: (response) => {
      queryClient.setQueryData(['lanes', projectId], {
        success: true,
        data: response.data,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reorder lanes');
      queryClient.invalidateQueries({ queryKey: ['lanes', projectId] });
    },
  });

  // Move / Reorder Card Mutation
  const moveCardMutation = useMutation({
    mutationFn: (data: { id: string; targetLaneId: string; position: number }) =>
      api.cards.move(data.id, {
        targetLaneId: data.targetLaneId,
        position: data.position,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', projectId] });
      queryClient.invalidateQueries({ queryKey: ['lanes', projectId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to move card');
      queryClient.invalidateQueries({ queryKey: ['cards', projectId] });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === 'Card') {
      setActiveCard(activeData.card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || activeData.type !== 'Card') return;

    const activeCardId = active.id as string;
    const overId = over.id as string;

    const currentCard = cards.find((c) => c.id === activeCardId);
    if (!currentCard) return;

    // Find destination lane
    let targetLaneId: string | null = null;
    if (overData?.type === 'Lane') {
      targetLaneId = overData.lane.id;
    } else if (overData?.type === 'Card') {
      targetLaneId = overData.card.laneId;
    }

    if (targetLaneId && currentCard.laneId !== targetLaneId) {
      // Optimistically move card to target lane in local cache
      const updatedCards = cards.map((c) =>
        c.id === activeCardId ? { ...c, laneId: targetLaneId } : c
      );
      queryClient.setQueryData(['cards', projectId, activeFilters], {
        success: true,
        data: updatedCards,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData) return;

    // 1. Lane Drag & Drop
    if (activeData.type === 'Lane') {
      if (active.id === over.id) return;
      const oldIndex = lanes.findIndex((l) => l.id === active.id);
      const newIndex = lanes.findIndex((l) => l.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(lanes, oldIndex, newIndex);
      queryClient.setQueryData(['lanes', projectId], {
        success: true,
        data: reordered,
      });

      const items = reordered.map((lane, index) => ({
        id: lane.id,
        position: (index + 1) * 65536,
      }));
      reorderLanesMutation.mutate(items);
      return;
    }

    // 2. Card Drag & Drop
    if (activeData.type === 'Card') {
      const activeCardId = active.id as string;
      const overId = over.id as string;

      let targetLaneId: string | null = null;
      if (overData?.type === 'Lane') {
        targetLaneId = overData.lane.id;
      } else if (overData?.type === 'Card') {
        targetLaneId = overData.card.laneId;
      } else {
        const foundLane = lanes.find((l) => l.id === overId);
        if (foundLane) targetLaneId = foundLane.id;
      }

      if (!targetLaneId) return;

      const laneCards = cards
        .filter((c) => c.laneId === targetLaneId)
        .sort((a, b) => a.position - b.position);

      const oldIndex = laneCards.findIndex((c) => c.id === activeCardId);
      let newIndex = laneCards.findIndex((c) => c.id === overId);

      let reorderedLaneCards = [...laneCards];
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderedLaneCards = arrayMove(laneCards, oldIndex, newIndex);
      } else if (oldIndex === -1) {
        // Card was dropped from another lane
        const cardToMove = cards.find((c) => c.id === activeCardId);
        if (cardToMove) {
          if (newIndex === -1) {
            reorderedLaneCards.push({ ...cardToMove, laneId: targetLaneId });
          } else {
            reorderedLaneCards.splice(newIndex, 0, {
              ...cardToMove,
              laneId: targetLaneId,
            });
          }
        }
      }

      // Calculate calculated new position
      const finalIndex = reorderedLaneCards.findIndex((c) => c.id === activeCardId);
      const prevCard = finalIndex > 0 ? reorderedLaneCards[finalIndex - 1] : null;
      const nextCard =
        finalIndex < reorderedLaneCards.length - 1
          ? reorderedLaneCards[finalIndex + 1]
          : null;

      let newPosition = 65536;
      if (prevCard && nextCard) {
        newPosition = (prevCard.position + nextCard.position) / 2;
      } else if (prevCard) {
        newPosition = prevCard.position + 65536;
      } else if (nextCard) {
        newPosition = nextCard.position / 2;
      }

      // Optimistic cache update
      const updatedAllCards = cards.map((c) =>
        c.id === activeCardId
          ? { ...c, laneId: targetLaneId, position: newPosition }
          : c
      );

      queryClient.setQueryData(['cards', projectId, activeFilters], {
        success: true,
        data: updatedAllCards,
      });

      moveCardMutation.mutate({
        id: activeCardId,
        targetLaneId,
        position: newPosition,
      });
    }
  };

  const handleCreateLaneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newLaneName.trim();
    if (!trimmed) return;
    createLaneMutation.mutate(trimmed);
  };

  if (lanesLoading || cardsLoading) {
    return (
      <div className="relative flex items-start gap-4 overflow-x-auto pb-6 px-4 sm:px-6 min-w-0 w-full overscroll-x-contain">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-80 shrink-0 rounded-xl border border-border/50 bg-muted/20 p-3 space-y-3"
          >
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex items-start gap-4 overflow-x-auto pb-6 px-4 sm:px-6 select-none min-w-0 w-full overscroll-x-contain">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={lanes.map((l) => l.id)}
          strategy={horizontalListSortingStrategy}
        >
          {lanes.map((lane) => (
            <LaneColumn
              key={lane.id}
              lane={lane}
              cards={cardsByLane[lane.id] || []}
              projectId={projectId}
            />
          ))}
        </SortableContext>

        {/* Drag Overlay Preview */}
        <DragOverlay>
          {activeCard && (
            <div className="rotate-2 scale-105 shadow-xl">
              <CardItem
                card={activeCard}
                isDone={isDoneLane(lanes.find((l) => l.id === activeCard.laneId)?.name)}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Add Lane Inline Button / Form */}
      <div className="w-80 shrink-0">
        {isAddingLane ? (
          <form
            onSubmit={handleCreateLaneSubmit}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm"
          >
            <Input
              placeholder="e.g. In Review"
              value={newLaneName}
              onChange={(e) => setNewLaneName(e.target.value)}
              autoFocus
              disabled={createLaneMutation.isPending}
              className="h-8 text-xs font-medium"
            />
            <div className="flex items-center gap-1.5 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => {
                  setIsAddingLane(false);
                  setNewLaneName('');
                }}
                disabled={createLaneMutation.isPending}
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </Button>
              <Button
                type="submit"
                size="xs"
                disabled={createLaneMutation.isPending || !newLaneName.trim()}
              >
                {createLaneMutation.isPending ? 'Adding...' : 'Add Lane'}
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingLane(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/20 py-3.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-muted/40 hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            <span>
              {lanes.length === 0 ? 'Add your first lane' : 'Add another lane'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
