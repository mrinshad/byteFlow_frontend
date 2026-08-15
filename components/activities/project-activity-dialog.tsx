'use client';

import React from 'react';
import { History, X } from 'lucide-react';
import { ActivityTimeline } from './activity-timeline';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProjectActivityDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectActivityDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
}: ProjectActivityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader className="border-b border-border/50 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-primary" />
            <span>Activity History</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Audit trail of all actions performed in <span className="font-semibold text-foreground">{projectName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 pr-1">
          <ActivityTimeline projectId={projectId} limit={100} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
