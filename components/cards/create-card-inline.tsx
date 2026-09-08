'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, AlignLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api, type Priority } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CreateCardInlineProps {
  projectId: string;
  laneId: string;
}

export function CreateCardInline({ projectId, laneId }: CreateCardInlineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [showDesc, setShowDesc] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const resetState = () => {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setShowDesc(false);
  };

  const createMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; priority?: Priority }) =>
      api.cards.create({
        projectId,
        laneId,
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', projectId] });
      queryClient.invalidateQueries({ queryKey: ['lanes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      resetState();
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create card');
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    createMutation.mutate({
      title: trimmed,
      description: description.trim() || undefined,
      priority,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !showDesc)) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      resetState();
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground cursor-pointer"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add card</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-2 rounded-lg border border-border/80 bg-card p-2.5 shadow-xs overflow-hidden">
      <Textarea
        ref={textareaRef}
        placeholder="Enter a title for this card..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={createMutation.isPending}
        className="min-h-[50px] resize-none text-xs p-2 shadow-none focus-visible:ring-1"
      />

      {showDesc && (
        <Textarea
          placeholder="Add description... (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={createMutation.isPending}
          className="min-h-[44px] resize-none text-xs p-2 shadow-none focus-visible:ring-1"
        />
      )}

      {/* Priority & Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-border/40">
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Priority Select */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            disabled={createMutation.isPending}
            className="h-6 rounded border border-border/60 bg-background px-1.5 text-[10px] font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            title="Set card priority"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Toggle Description Field */}
          {!showDesc && (
            <button
              type="button"
              onClick={() => setShowDesc(true)}
              className="flex h-6 items-center gap-1 rounded px-1.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Add description"
            >
              <AlignLeft className="h-3 w-3" />
              <span>Desc</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              setIsOpen(false);
              resetState();
            }}
            disabled={createMutation.isPending}
            className="h-6 px-2 text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="xs"
            disabled={createMutation.isPending || !title.trim()}
            className="h-6 px-2.5 text-xs min-w-[48px] justify-center"
          >
            {createMutation.isPending ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </div>
    </form>
  );
}
