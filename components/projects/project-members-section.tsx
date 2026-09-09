'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, AlertTriangle, CheckCircle2, Filter, X } from 'lucide-react';
import { api, type ProjectMemberSummary, type Role } from '@/lib/api';
import { useBoardStore } from '@/lib/store/use-board-store';
import { Button } from '@/components/ui/button';

interface ProjectMembersSectionProps {
  projectId: string;
}

const ROLE_BADGE_STYLES: Record<Role, string> = {
  SUPER_ADMIN: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  ADMIN: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  MANAGER: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  MEMBER: 'bg-muted text-muted-foreground border-border/50',
};

export function ProjectMembersSection({ projectId }: ProjectMembersSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { assigneeId, setAssigneeId } = useBoardStore();

  const { data, isLoading } = useQuery({
    queryKey: ['project-members-summary', projectId],
    queryFn: () => api.projects.getMembersSummary(projectId),
    refetchInterval: 30000,
  });

  const rawMembers: ProjectMemberSummary[] = data?.data || [];
  const members = rawMembers.filter((m) => m.role !== 'SUPER_ADMIN');
  const totalBreached = members.reduce((acc, m) => acc + m.breachedCardsCount, 0);
  const totalAssigned = members.reduce((acc, m) => acc + m.assignedCardsCount, 0);
  const hasAnyBreached = totalBreached > 0;

  // Close popover on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  const handleMemberClick = (userId: string) => {
    if (assigneeId === userId) {
      setAssigneeId('ALL');
    } else {
      setAssigneeId(userId);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button - placed along with Activity button */}
      <Button
        variant="outline"
        size="sm"
        data-role="project-members-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className={`gap-1.5 text-xs h-8 cursor-pointer transition-all ${
          isOpen ? 'border-primary/50 bg-primary/5 text-primary' : ''
        }`}
        title="View project users and task status"
      >
        <Users className="h-3.5 w-3.5 text-primary" />
        <span>Members</span>
        <span className="rounded-full bg-muted/80 px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
          {members.length}
        </span>
        {hasAnyBreached && (
          <span
            className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"
            title={`${totalBreached} breached card(s) across team`}
          />
        )}
      </Button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs sm:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Popover Section */}
      {isOpen && (
        <div
          data-role="project-members-popover"
          className="fixed inset-x-3 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 max-w-sm sm:max-w-none mx-auto sm:mx-0 rounded-xl border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-muted/20">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold text-foreground">
                Project Users ({members.length})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">
                {totalAssigned} assigned ·{' '}
                <span className={hasAnyBreached ? 'font-semibold text-rose-500' : 'text-emerald-500'}>
                  {totalBreached} breached
                </span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                aria-label="Close members section"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Members List */}
          <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto divide-y divide-border/40 p-1">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Loading project members...
              </div>
            ) : members.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No users assigned to this project yet.
              </div>
            ) : (
              members.map((member) => {
                const isFiltered = assigneeId === member.userId;
                return (
                  <div
                    key={member.id}
                    data-role="project-member-item"
                    onClick={() => handleMemberClick(member.userId)}
                    className={`flex items-center justify-between gap-3 p-2.5 rounded-lg transition-colors cursor-pointer text-xs ${
                      isFiltered
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                    title={isFiltered ? 'Click to clear filter' : `Click to filter cards by ${member.name}`}
                  >
                    {/* User Identity */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground truncate">
                            {member.name}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-semibold border ${
                              ROLE_BADGE_STYLES[member.role] || ROLE_BADGE_STYLES.MEMBER
                            }`}
                          >
                            {member.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          @{member.username}
                        </p>
                      </div>
                    </div>

                    {/* Cards Count & Breach Status Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Assigned Cards Count */}
                      <span
                        className="font-mono text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/40"
                        title={`${member.assignedCardsCount} cards assigned`}
                      >
                        {member.assignedCardsCount}{' '}
                        <span className="font-sans text-[10px] font-normal text-muted-foreground/80">
                          {member.assignedCardsCount === 1 ? 'card' : 'cards'}
                        </span>
                      </span>

                      {/* SLA Breach Status */}
                      {member.hasBreachedCard ? (
                        <span
                          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          title={`${member.breachedCardsCount} overdue/breached card(s)`}
                        >
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span>{member.breachedCardsCount} breached</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium bg-muted/40 text-muted-foreground border border-border/30"
                          title="No breached cards"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span>On track</span>
                        </span>
                      )}

                      {/* Filter active icon */}
                      {isFiltered && (
                        <span title="Active board filter">
                          <Filter className="h-3 w-3 text-primary shrink-0" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Section Footer Tip */}
          <div className="border-t border-border/50 px-3 py-2 bg-muted/15 text-[10px] text-muted-foreground flex items-center justify-between">
            <span>Tip: Click any user to filter the board</span>
            {assigneeId !== 'ALL' && (
              <button
                type="button"
                onClick={() => setAssigneeId('ALL')}
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Reset filter
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
