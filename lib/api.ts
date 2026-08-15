const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: string | null;
  _count?: {
    lanes: number;
    cards: number;
  };
}

export interface Lane {
  id: string;
  projectId: string;
  name: string;
  color: string | null;
  position: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: string | null;
  _count?: {
    cards: number;
  };
}

export interface Tag {
  id: string;
  projectId: string;
  name: string;
  color: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: string | null;
  _count?: {
    cards: number;
  };
}

export interface Card {
  id: string;
  projectId: string;
  laneId: string;
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: string | null;
  position: number;
  assigneeId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: string | null;
  lane?: {
    id: string;
    name: string;
    color: string | null;
  };
  tags?: Array<{
    cardId: string;
    tagId: string;
    tag: Tag;
  }>;
  _count?: {
    comments: number;
    tags: number;
  };
}

export interface Comment {
  id: string;
  cardId: string;
  comment: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface ActivityLog {
  id: string;
  projectId: string | null;
  laneId: string | null;
  cardId: string | null;
  commentId: string | null;
  tagId: string | null;
  performedBy: string | null;
  action: string;
  oldValue: any;
  newValue: any;
  createdAt: string;
  card?: {
    id: string;
    title: string;
  } | null;
  lane?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  tag?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  comment?: {
    id: string;
    comment: string;
  } | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  meta: PaginationMeta;
}

export interface ProjectDetailResponse {
  success: boolean;
  data: Project & {
    lanes: Lane[];
  };
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error?.message || data.message || 'Request failed');
  }

  return data;
}

export const api = {
  projects: {
    list: async (params?: { search?: string; page?: number; limit?: number }): Promise<ProjectsResponse> => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return request<ProjectsResponse>(`/api/projects${query}`);
    },

    getById: async (id: string): Promise<ProjectDetailResponse> => {
      return request<ProjectDetailResponse>(`/api/projects/${id}`);
    },

    create: async (data: { name: string; description?: string }): Promise<{ success: boolean; data: Project }> => {
      return request<{ success: boolean; data: Project }>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: { name?: string; description?: string }): Promise<{ success: boolean; data: Project }> => {
      return request<{ success: boolean; data: Project }>(`/api/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
      return request<{ success: boolean; message: string }>(`/api/projects/${id}`, {
        method: 'DELETE',
      });
    },
  },

  lanes: {
    listByProject: async (projectId: string): Promise<{ success: boolean; data: Lane[] }> => {
      return request<{ success: boolean; data: Lane[] }>(`/api/lanes/project/${projectId}`);
    },

    create: async (data: { projectId: string; name: string; color?: string }): Promise<{ success: boolean; data: Lane }> => {
      return request<{ success: boolean; data: Lane }>('/api/lanes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: { name?: string; color?: string }): Promise<{ success: boolean; data: Lane }> => {
      return request<{ success: boolean; data: Lane }>(`/api/lanes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    reorder: async (data: { projectId: string; items: Array<{ id: string; position: number }> }): Promise<{ success: boolean; data: Lane[] }> => {
      return request<{ success: boolean; data: Lane[] }>('/api/lanes/reorder', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
      return request<{ success: boolean; message: string }>(`/api/lanes/${id}`, {
        method: 'DELETE',
      });
    },
  },

  cards: {
    listByProject: async (
      projectId: string,
      filters?: {
        laneId?: string;
        priority?: Priority;
        assigneeId?: string;
        tagId?: string;
        dueDateFilter?: 'overdue' | 'today' | 'this_week' | 'no_date';
        fromDate?: string;
        toDate?: string;
        search?: string;
      }
    ): Promise<{ success: boolean; data: Card[] }> => {
      const searchParams = new URLSearchParams();
      if (filters?.laneId) searchParams.set('laneId', filters.laneId);
      if (filters?.priority) searchParams.set('priority', filters.priority);
      if (filters?.assigneeId) searchParams.set('assigneeId', filters.assigneeId);
      if (filters?.tagId) searchParams.set('tagId', filters.tagId);
      if (filters?.dueDateFilter) searchParams.set('dueDateFilter', filters.dueDateFilter);
      if (filters?.fromDate) searchParams.set('fromDate', filters.fromDate);
      if (filters?.toDate) searchParams.set('toDate', filters.toDate);
      if (filters?.search) searchParams.set('search', filters.search);
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return request<{ success: boolean; data: Card[] }>(`/api/cards/project/${projectId}${query}`);
    },

    getById: async (id: string): Promise<{ success: boolean; data: Card }> => {
      return request<{ success: boolean; data: Card }>(`/api/cards/${id}`);
    },

    create: async (data: { projectId: string; laneId: string; title: string; description?: string; priority?: Priority; dueDate?: string; assigneeId?: string }): Promise<{ success: boolean; data: Card }> => {
      return request<{ success: boolean; data: Card }>('/api/cards', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: { title?: string; description?: string; priority?: Priority; dueDate?: string | null; assigneeId?: string | null }): Promise<{ success: boolean; data: Card }> => {
      return request<{ success: boolean; data: Card }>(`/api/cards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    move: async (id: string, data: { targetLaneId: string; position: number }): Promise<{ success: boolean; data: Card }> => {
      return request<{ success: boolean; data: Card }>(`/api/cards/${id}/move`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    reorder: async (data: { projectId: string; items: Array<{ id: string; laneId: string; position: number }> }): Promise<{ success: boolean; data: Card[] }> => {
      return request<{ success: boolean; data: Card[] }>('/api/cards/reorder', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
      return request<{ success: boolean; message: string }>(`/api/cards/${id}`, {
        method: 'DELETE',
      });
    },
  },

  comments: {
    listByCard: async (cardId: string): Promise<{ success: boolean; data: Comment[] }> => {
      return request<{ success: boolean; data: Comment[] }>(`/api/comments/card/${cardId}`);
    },

    create: async (data: { cardId: string; comment: string; createdBy?: string }): Promise<{ success: boolean; data: Comment }> => {
      return request<{ success: boolean; data: Comment }>('/api/comments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: { comment: string }): Promise<{ success: boolean; data: Comment }> => {
      return request<{ success: boolean; data: Comment }>(`/api/comments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
      return request<{ success: boolean; message: string }>(`/api/comments/${id}`, {
        method: 'DELETE',
      });
    },
  },

  tags: {
    listByProject: async (projectId: string): Promise<{ success: boolean; data: Tag[] }> => {
      return request<{ success: boolean; data: Tag[] }>(`/api/tags/project/${projectId}`);
    },

    create: async (data: { projectId: string; name: string; color?: string }): Promise<{ success: boolean; data: Tag }> => {
      return request<{ success: boolean; data: Tag }>('/api/tags', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: { name?: string; color?: string }): Promise<{ success: boolean; data: Tag }> => {
      return request<{ success: boolean; data: Tag }>(`/api/tags/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
      return request<{ success: boolean; message: string }>(`/api/tags/${id}`, {
        method: 'DELETE',
      });
    },

    assignToCard: async (cardId: string, tagId: string): Promise<{ success: boolean; data: any }> => {
      return request<{ success: boolean; data: any }>(`/api/tags/card/${cardId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ tagId }),
      });
    },

    removeFromCard: async (cardId: string, tagId: string): Promise<{ success: boolean; message: string }> => {
      return request<{ success: boolean; message: string }>(`/api/tags/card/${cardId}/tag/${tagId}`, {
        method: 'DELETE',
      });
    },
  },

  activities: {
    listByCard: async (cardId: string, limit?: number): Promise<{ success: boolean; data: ActivityLog[] }> => {
      const query = limit ? `?limit=${limit}` : '';
      return request<{ success: boolean; data: ActivityLog[] }>(`/api/activities/card/${cardId}${query}`);
    },

    listByProject: async (projectId: string, limit?: number): Promise<{ success: boolean; data: ActivityLog[] }> => {
      const query = limit ? `?limit=${limit}` : '';
      return request<{ success: boolean; data: ActivityLog[] }>(`/api/activities/project/${projectId}${query}`);
    },
  },

  dashboard: {
    getProjectStats: async (projectId: string): Promise<{ success: boolean; data: ProjectStats }> => {
      return request<{ success: boolean; data: ProjectStats }>(`/api/dashboard/project/${projectId}`);
    },

    getGlobalStats: async (): Promise<{ success: boolean; data: GlobalStats }> => {
      return request<{ success: boolean; data: GlobalStats }>('/api/dashboard/global');
    },
  },
};

export interface ProjectStats {
  projectId: string;
  projectName: string;
  totalCards: number;
  totalLanes: number;
  completedCards: number;
  completionPercentage: number;
  overdueCards: number;
  cardsByLane: Array<{
    laneId: string;
    laneName: string;
    color: string | null;
    count: number;
    percentage: number;
  }>;
  cardsByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
}

export interface GlobalStats {
  totalProjects: number;
  totalCards: number;
  totalLanes: number;
}
