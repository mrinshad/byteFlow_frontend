import { create } from 'zustand';
import type { Priority } from '@/lib/api';

export type DueDateFilterOption = 'all' | 'overdue' | 'today' | 'this_week' | 'no_date';

interface BoardState {
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

  openCardDrawer: (cardId: string) => void;
  closeCardDrawer: () => void;
  setActiveDrag: (id: string | null, type: 'Lane' | 'Card' | null) => void;

  setSearch: (search: string) => void;
  setPriority: (priority: Priority | 'ALL') => void;
  setTagId: (tagId: string | 'ALL') => void;
  setAssigneeId: (assigneeId: string | 'ALL') => void;
  setDueDateFilter: (filter: DueDateFilterOption) => void;
  resetFilters: () => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  selectedCardId: null,
  isDrawerOpen: false,
  activeDragId: null,
  activeDragType: null,

  search: '',
  priority: 'ALL',
  tagId: 'ALL',
  assigneeId: 'ALL',
  dueDateFilter: 'all',

  openCardDrawer: (cardId: string) => set({ selectedCardId: cardId, isDrawerOpen: true }),
  closeCardDrawer: () => set({ selectedCardId: null, isDrawerOpen: false }),
  setActiveDrag: (id, type) => set({ activeDragId: id, activeDragType: type }),

  setSearch: (search) => set({ search }),
  setPriority: (priority) => set({ priority }),
  setTagId: (tagId) => set({ tagId }),
  setAssigneeId: (assigneeId) => set({ assigneeId }),
  setDueDateFilter: (dueDateFilter) => set({ dueDateFilter }),
  resetFilters: () =>
    set({
      search: '',
      priority: 'ALL',
      tagId: 'ALL',
      assigneeId: 'ALL',
      dueDateFilter: 'all',
    }),
}));
