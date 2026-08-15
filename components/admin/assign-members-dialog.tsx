'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, Users, Shield, User as UserIcon } from 'lucide-react';
import { api, type AdminProject } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AssignMembersDialogProps {
  project: AdminProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignMembersDialog({
  project,
  open,
  onOpenChange,
}: AssignMembersDialogProps) {
  const queryClient = useQueryClient();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Fetch all users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.admin.getUsers(),
    enabled: open,
  });

  const allUsers = usersData?.data || [];

  // Initialize selected members from project
  useEffect(() => {
    if (project) {
      setSelectedUserIds(project.members.map((m) => m.userId));
    }
  }, [project]);

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    setSelectedUserIds(allUsers.map((u) => u.id));
  };

  const clearAll = () => {
    setSelectedUserIds([]);
  };

  const updateMutation = useMutation({
    mutationFn: () =>
      api.admin.updateMembers(project!.id, selectedUserIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Updated members for "${project?.name}"`);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update project members');
    },
  });

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Assign Members</span>
          </DialogTitle>
          <DialogDescription>
            Select team members who can access and work on <span className="font-semibold text-foreground">&quot;{project.name}&quot;</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between border-b border-border/40 pb-2 pt-1 text-xs text-muted-foreground">
          <span>{selectedUserIds.length} of {allUsers.length} selected</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-primary hover:underline font-medium"
            >
              Select all
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={clearAll}
              className="hover:underline font-medium"
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-1.5 py-1">
          {usersLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading users...</div>
          ) : allUsers.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No users registered yet</div>
          ) : (
            allUsers.map((user) => {
              const isSelected = selectedUserIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className={`flex items-center justify-between rounded-lg border p-2.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border/40 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {user.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {user.role}
                    </span>
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Members'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
