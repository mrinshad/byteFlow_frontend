'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Edit2, Trash2, Check, X, MessageSquare, CornerDownLeft } from 'lucide-react';
import { toast } from 'sonner';
import { api, type Comment } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentSectionProps {
  cardId: string;
  projectId: string;
}

export function CommentSection({ cardId, projectId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['comments', cardId],
    queryFn: () => api.comments.listByCard(cardId),
  });

  const comments = data?.data || [];

  // Scroll to bottom on new comments
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Create Comment Mutation
  const createMutation = useMutation({
    mutationFn: (commentText: string) =>
      api.comments.create({
        cardId,
        comment: commentText,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', cardId] });
      queryClient.invalidateQueries({ queryKey: ['cards', projectId] });
      setNewComment('');
      setTimeout(scrollToBottom, 100);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to post comment');
    },
  });

  // Update Comment Mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; comment: string }) =>
      api.comments.update(data.id, { comment: data.comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', cardId] });
      setEditingId(null);
      setEditingText('');
      toast.success('Comment updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update comment');
    },
  });

  // Delete Comment Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.comments.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', cardId] });
      queryClient.invalidateQueries({ queryKey: ['cards', projectId] });
      toast.success('Comment deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });

  const handleCreateSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed) return;
    createMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCreateSubmit();
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingId(comment.id);
    setEditingText(comment.comment);
  };

  const handleUpdateSubmit = (id: string) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;
    updateMutation.mutate({ id, comment: trimmed });
  };

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Comments ({comments.length})</span>
        </span>
      </div>

      {/* Comments Feed */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="py-4 text-center text-xs text-muted-foreground">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 py-6 text-center text-xs text-muted-foreground/70">
            No comments yet. Start the conversation!
          </div>
        ) : (
          comments.map((c) => {
            const isEditingThis = editingId === c.id;
            const author = c.createdBy || 'Team Member';
            const initials = author.slice(0, 2).toUpperCase();

            return (
              <div key={c.id} className="group flex gap-2.5 rounded-lg border border-border/40 bg-muted/20 p-3 max-w-full overflow-hidden">
                {/* Avatar */}
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary ring-1 ring-primary/20">
                  {initials}
                </span>

                <div className="flex-1 min-w-0 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-medium text-foreground truncate">{author}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{formatTimestamp(c.createdAt)}</span>
                    </div>

                    {!isEditingThis && (
                      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => startEditing(c)}
                          className="h-5 w-5 text-muted-foreground hover:text-foreground"
                          title="Edit comment"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => deleteMutation.mutate(c.id)}
                          disabled={deleteMutation.isPending}
                          className="h-5 w-5 text-muted-foreground hover:text-destructive"
                          title="Delete comment"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  {isEditingThis ? (
                    <div className="mt-2 flex flex-col gap-2">
                      <Textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="min-h-[60px] text-xs resize-none break-words"
                        autoFocus
                      />
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setEditingId(null);
                            setEditingText('');
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="xs"
                          onClick={() => handleUpdateSubmit(c.id)}
                          disabled={updateMutation.isPending || !editingText.trim()}
                          className="h-6 px-2 text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
                      {c.comment}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* New Comment Composer */}
      <form onSubmit={handleCreateSubmit} className="flex flex-col gap-2">
        <Textarea
          ref={textareaRef}
          placeholder="Write a comment... (Cmd + Enter to send)"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={createMutation.isPending}
          className="min-h-[64px] text-xs resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" />
            <span>Cmd + Enter</span>
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={createMutation.isPending || !newComment.trim()}
            className="gap-1.5 h-7 px-3 text-xs"
          >
            <Send className="h-3 w-3" />
            <span>{createMutation.isPending ? 'Posting...' : 'Comment'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
