'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CreateCardInlineProps {
  projectId: string;
  laneId: string;
}

export function CreateCardInline({ projectId, laneId }: CreateCardInlineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const createMutation = useMutation({
    mutationFn: (cardTitle: string) =>
      api.cards.create({
        projectId,
        laneId,
        title: cardTitle,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', projectId] });
      queryClient.invalidateQueries({ queryKey: ['lanes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setTitle('');
      // Keep open for rapid creation
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
    createMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setTitle('');
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add card</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-2 rounded-lg border border-border bg-card p-2 shadow-xs">
      <Textarea
        ref={textareaRef}
        placeholder="Enter a title for this card..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={createMutation.isPending}
        className="min-h-[56px] resize-none text-xs p-2 shadow-none focus-visible:ring-1"
      />
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] text-muted-foreground/70">Press Enter to add</span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              setIsOpen(false);
              setTitle('');
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
            className="h-6 px-2.5 text-xs"
          >
            {createMutation.isPending ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </div>
    </form>
  );
}
