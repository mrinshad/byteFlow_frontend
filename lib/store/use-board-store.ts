import { create } from 'zustand';
import type { Priority, Project } from '@/lib/api';

export type DueDateFilterOption = 'all' | 'overdue' | 'today' | 'this_week' | 'no_date';

interface BoardState {
  currentProject: Project | null;
  currentProjectId: string | null;
  selectedCardId: string | null;
  isDrawerOpen: boolean;
  activeDragId: string | null;
  activeDragType: 'Lane' | 'Card' | null;

  // Filter state
  search: string;
  priority: Priority | 'ALL';
  tagId: string | 'ALL';
  assigneeId: string | 'ALL';
  dueDateFilter: DueDateFilterOption;
  showDeleted: boolean;

  setCurrentProject: (project: Project | null) => void;
  openCardDrawer: (cardId: string) => void;
  closeCardDrawer: () => void;
  setActiveDrag: (id: string | null, type: 'Lane' | 'Card' | null) => void;

  setSearch: (search: string) => void;
  setPriority: (priority: Priority | 'ALL') => void;
  setTagId: (tagId: string | 'ALL') => void;
  setAssigneeId: (assigneeId: string | 'ALL') => void;
  setDueDateFilter: (filter: DueDateFilterOption) => void;
  setShowDeleted: (showDeleted: boolean) => void;
  resetFilters: () => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  currentProject: null,
  currentProjectId: null,
  selectedCardId: null,
  isDrawerOpen: false,
  activeDragId: null,
  activeDragType: null,

  search: '',
  priority: 'ALL',
  tagId: 'ALL',
  assigneeId: 'ALL',
  dueDateFilter: 'all',
  showDeleted: false,

  setCurrentProject: (project) => set({ currentProject: project, currentProjectId: project?.id || null }),
  openCardDrawer: (cardId: string) => set({ selectedCardId: cardId, isDrawerOpen: true }),
  closeCardDrawer: () => set({ selectedCardId: null, isDrawerOpen: false }),
  setActiveDrag: (id, type) => set({ activeDragId: id, activeDragType: type }),

  setSearch: (search) => set({ search }),
  setPriority: (priority) => set({ priority }),
  setTagId: (tagId) => set({ tagId }),
  setAssigneeId: (assigneeId) => set({ assigneeId }),
  setDueDateFilter: (dueDateFilter) => set({ dueDateFilter }),
  setShowDeleted: (showDeleted) => set({ showDeleted }),
  resetFilters: () =>
    set({
      search: '',
      priority: 'ALL',
      tagId: 'ALL',
      assigneeId: 'ALL',
      dueDateFilter: 'all',
      showDeleted: false,
    }),
}));
