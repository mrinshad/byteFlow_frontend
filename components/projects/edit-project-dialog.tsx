'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, type Project } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { useAuth } from '@/lib/auth-context';

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
}: EditProjectDialogProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => {
      if (!project) throw new Error('No project selected');
      return api.projects.update(project.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (project) {
        queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      }
      toast.success('Project updated successfully');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update project');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === 'MEMBER') {
      toast.error('Members do not have permission to edit projects');
      return;
    }
    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }
    updateMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project title or details.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-project-name" className="text-xs font-medium text-muted-foreground">
                Project Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updateMutation.isPending}
                className="h-10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-project-desc" className="text-xs font-medium text-muted-foreground">
                Description <span className="text-xs text-muted-foreground/70">(Optional)</span>
              </label>
              <Textarea
                id="edit-project-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={updateMutation.isPending}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending || !name.trim()}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
