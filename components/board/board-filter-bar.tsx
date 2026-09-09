'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { api, type Priority, type Tag, type ProjectMember } from '@/lib/api';
import { useBoardStore, type DueDateFilterOption } from '@/lib/store/use-board-store';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BoardFilterBarProps {
  projectId: string;
}

const PRIORITIES: { label: string; value: Priority | 'ALL' }[] = [
  { label: 'All Priorities', value: 'ALL' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Critical', value: 'CRITICAL' },
];

const DUE_DATE_OPTIONS: { label: string; value: DueDateFilterOption }[] = [
  { label: 'All Due Dates', value: 'all' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Due Today', value: 'today' },
  { label: 'Due This Week', value: 'this_week' },
  { label: 'No Due Date', value: 'no_date' },
];

export function BoardFilterBar({ projectId }: BoardFilterBarProps) {
  const {
    search,
    priority,
    tagId,
    assigneeId,
    dueDateFilter,
    setSearch,
    setPriority,
    setTagId,
    setAssigneeId,
    setDueDateFilter,
    resetFilters,
  } = useBoardStore();

  const [inputValue, setInputValue] = useState(search);
  const debouncedSearch = useDebounce(inputValue, 300);

  // Sync debounced search to store filter
  useEffect(() => {
    if (debouncedSearch !== search) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, setSearch, search]);

  // Sync external changes to store search (e.g. resetFilters) to local input
  useEffect(() => {
    setInputValue(search);
  }, [search]);

  const handleClearSearch = () => {
    setInputValue('');
    setSearch('');
  };

  // Fetch project tags for dropdown
  const { data: tagsData } = useQuery({
    queryKey: ['tags', projectId],
    queryFn: () => api.tags.listByProject(projectId),
  });

  // Fetch cards to extract available assignees
  const { data: cardsData } = useQuery({
    queryKey: ['cards', projectId, {}],
    queryFn: () => api.cards.listByProject(projectId),
  });

  // Fetch project to resolve assignee names
  const { data: projectData } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.projects.getById(projectId),
  });

  const tags = tagsData?.data || [];
  const cards = cardsData?.data || [];
  const members = projectData?.data?.members || [];

  const getAssigneeLabel = (id: string) => {
    const member = members.find((m: ProjectMember) => m.userId === id || m.user?.id === id);
    if (member?.user?.name) return member.user.name;
    if (member?.user?.username) return `@${member.user.username}`;
    return id;
  };

  // Extract unique active assignees from project cards
  const assignees = Array.from(
    new Set(cards.map((c) => c.assigneeId).filter(Boolean) as string[])
  );

  const hasActiveFilters =
    Boolean(search.trim()) ||
    priority !== 'ALL' ||
    tagId !== 'ALL' ||
    assigneeId !== 'ALL' ||
    dueDateFilter !== 'all';

  const selectedTag = tags.find((t) => t.id === tagId);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search cards..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-8 pl-8 pr-7 text-xs"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <select
          value={priority}
          aria-label="Filter cards by priority"
          onChange={(e) => setPriority(e.target.value as any)}
          className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Tag Filter */}
        <select
          value={tagId}
          aria-label="Filter cards by tag"
          onChange={(e) => setTagId(e.target.value)}
          className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="ALL">All Tags</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Assignee Filter */}
        <select
          value={assigneeId}
          aria-label="Filter cards by assignee"
          onChange={(e) => setAssigneeId(e.target.value)}
          className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="ALL">All Assignees</option>
          {assignees.map((a) => (
            <option key={a} value={a}>
              {getAssigneeLabel(a)}
            </option>
          ))}
        </select>

        {/* Due Date Filter */}
        <select
          value={dueDateFilter}
          aria-label="Filter cards by due date"
          onChange={(e) => setDueDateFilter(e.target.value as DueDateFilterOption)}
          className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          {DUE_DATE_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={resetFilters}
            className="h-8 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Active Filter Badges Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" />
            <span>Active filters:</span>
          </span>

          {search.trim() && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-foreground font-medium border border-border/60">
              <span>Keyword: &quot;{search}&quot;</span>
              <button
                type="button"
                onClick={handleClearSearch}
                className="hover:text-destructive cursor-pointer"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )}

          {priority !== 'ALL' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-foreground font-medium border border-border/60">
              <span>Priority: {priority}</span>
              <button
                type="button"
                onClick={() => setPriority('ALL')}
                className="hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )}

          {tagId !== 'ALL' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-foreground font-medium border border-border/60">
              <span>Tag: {selectedTag?.name || 'Tag'}</span>
              <button
                type="button"
                onClick={() => setTagId('ALL')}
                className="hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )}

          {assigneeId !== 'ALL' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-foreground font-medium border border-border/60">
              <span>Assignee: {getAssigneeLabel(assigneeId)}</span>
              <button
                type="button"
                onClick={() => setAssigneeId('ALL')}
                className="hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )}

          {dueDateFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-foreground font-medium border border-border/60">
              <span>Date: {DUE_DATE_OPTIONS.find((d) => d.value === dueDateFilter)?.label}</span>
              <button
                type="button"
                onClick={() => setDueDateFilter('all')}
                className="hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
