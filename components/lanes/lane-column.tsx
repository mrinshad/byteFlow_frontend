'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  MoreHorizontal,
  Trash2,
  Edit2,
  Palette,
  Check,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, type Lane, type Card } from '@/lib/api';
import { CardItem } from '@/components/cards/card-item';
import { CreateCardInline } from '@/components/cards/create-card-inline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PRESET_COLORS = [
  { name: 'Slate', value: '#64748b' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Cyan', value: '#06b6d4' },
];

interface LaneColumnProps {
  lane: Lane;
  cards: Card[];
  projectId: string;
}

export function LaneColumn({ lane, cards, projectId }: LaneColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(lane.name);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setTitle(lane.name);
  }, [lane.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lane.id,
    data: {
      type: 'Lane',
      lane,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  // Update Lane Mutation
  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; color?: string }) =>
      api.lanes.update(lane.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update lane');
      setTitle(lane.name);
    },
  });

  // Delete Lane Mutation
  const deleteMutation = useMutation({
    mutationFn: () => api.lanes.delete(lane.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Lane "${lane.name}" deleted`);
      setDeleteOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete lane');
    },
  });

  const handleTitleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(lane.name);
      setIsEditing(false);
      return;
    }
    if (trimmed !== lane.name) {
      updateMutation.mutate({ name: trimmed });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitle(lane.name);
      setIsEditing(false);
    }
  };

  const handleColorChange = (newColor: string) => {
    updateMutation.mutate({ color: newColor });
    setColorPickerOpen(false);
  };

  const laneColor = lane.color || '#64748b';

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex w-80 shrink-0 max-h-[calc(100vh-140px)] flex-col rounded-xl border border-border/60 bg-muted/30 p-3 shadow-xs transition-colors duration-150 ${
          isDragging ? 'opacity-40 ring-2 ring-primary/40' : ''
        }`}
      >
        {/* Lane Header */}
        <div className="flex items-center justify-between gap-1 pb-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab text-muted-foreground/50 hover:text-foreground active:cursor-grabbing p-0.5 rounded transition-colors"
              aria-label="Drag lane"
            >
              <GripVertical className="h-4 w-4" />
            </button>

            {/* Color Dot */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setColorPickerOpen(!colorPickerOpen)}
                className="h-3 w-3 rounded-full transition-transform hover:scale-125 focus:outline-none ring-1 ring-border/80"
                style={{ backgroundColor: laneColor }}
                title="Change lane color"
              />

              {colorPickerOpen && (
                <div className="absolute left-0 top-5 z-50 flex gap-1 rounded-lg border border-border bg-popover p-1.5 shadow-md">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => handleColorChange(c.value)}
                      className="flex h-5 w-5 items-center justify-center rounded-full transition-transform hover:scale-110 focus:outline-none"
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    >
                      {laneColor === c.value && (
                        <Check className="h-3 w-3 text-white drop-shadow-xs" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title / Inline Edit */}
            {isEditing ? (
              <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleKeyDown}
                className="h-7 px-2 py-0 text-sm font-semibold leading-none shadow-none focus-visible:ring-1"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="truncate text-left text-sm font-semibold text-foreground tracking-tight hover:text-primary transition-colors focus:outline-none"
                title="Click to rename lane"
              >
                {lane.name}
              </button>
            )}

            {/* Card Count Badge */}
            <span className="ml-1 shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {cards.length}
            </span>
          </div>

          {/* Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                />
              }
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Lane options</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => setIsEditing(true)}
                className="gap-2 cursor-pointer text-xs"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Rename Lane</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setColorPickerOpen(true)}
                className="gap-2 cursor-pointer text-xs"
              >
                <Palette className="h-3.5 w-3.5" />
                <span>Change Color</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="gap-2 text-destructive cursor-pointer focus:text-destructive text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Lane</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Cards Sortable Area */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg bg-background/40 p-1.5 min-h-[100px]">
          <SortableContext
            items={cards.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {cards.map((card) => (
              <CardItem key={card.id} card={card} />
            ))}
          </SortableContext>

          {cards.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded border border-dashed border-border/40 py-6 text-center text-[11px] text-muted-foreground/60">
              No cards in this lane
            </div>
          )}
        </div>

        {/* Inline Card Creation */}
        <div className="pt-2">
          <CreateCardInline projectId={projectId} laneId={lane.id} />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Lane</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{lane.name}&quot;</span>?
              {cards.length > 0 && (
                <span className="block mt-2 font-medium text-destructive">
                  This lane contains {cards.length} active {cards.length === 1 ? 'card' : 'cards'}. Move or delete cards first.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
