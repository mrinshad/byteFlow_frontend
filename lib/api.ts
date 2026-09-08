const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'MEMBER';
export type NotificationType =
  | 'MENTION'
  | 'ASSIGNED_TO_PROJECT'
  | 'ASSIGNED_TO_CARD'
  | 'CARD_COMMENT'
  | 'CARD_UPDATED';

export interface Notification {
  id: string;
  userId: string;
  senderId: string | null;
  senderName: string | null;
  type: NotificationType;
  title: string;
  message: string;
  projectId: string | null;
  cardId: string | null;
  commentId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: Role;
  isLocked?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectMember {
  id: string;
  projectId?: string;
  userId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    username: string;
    role: Role;
  };
}

export interface ProjectMemberSummary {
  id: string;
  userId: string;
  name: string;
  username: string;
  role: Role;
  assignedCardsCount: number;
  hasBreachedCard: boolean;
  breachedCardsCount: number;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: string | null;
  members?: ProjectMember[];
  _count?: {
    lanes: number;
    cards: number;
    members?: number;
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
  number: number;
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
  project?: {
    id: string;
    name: string;
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

function getAuthHeaders(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('byteflow_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
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
  auth: {
    register: async (data: { name: string; username: string; password: string }): Promise<{ success: boolean; data: { user: AuthUser; token: string } }> => {
      return request<{ success: boolean; data: { user: AuthUser; token: string } }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    login: async (data: { username: string; password: string }): Promise<{ success: boolean; data: { user: AuthUser; token: string } }> => {
      return request<{ success: boolean; data: { user: AuthUser; token: string } }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    me: async (): Promise<{ success: boolean; data: AuthUser }> => {
      return request<{ success: boolean; data: AuthUser }>('/api/auth/me');
    },

    getRegistrationStatus: async (): Promise<{
      success: boolean;
      data: {
        isRegistrationAllowed: boolean;
        currentUsers: number;
        maxUsers: number;
        supportEmail: string;
      };
    }> => {
      return request<{
        success: boolean;
        data: {
          isRegistrationAllowed: boolean;
          currentUsers: number;
          maxUsers: number;
          supportEmail: string;
        };
      }>('/api/auth/registration-status');
    },

    changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> => {
      return request<{ success: boolean; message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

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

    getMembersSummary: async (id: string): Promise<{ success: boolean; data: ProjectMemberSummary[] }> => {
      return request<{ success: boolean; data: ProjectMemberSummary[] }>(`/api/projects/${id}/members-summary`);
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
        includeDeleted?: boolean;
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
      if (filters?.includeDeleted) searchParams.set('includeDeleted', 'true');
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

    restore: async (id: string): Promise<{ success: boolean; data: Card }> => {
      return request<{ success: boolean; data: Card }>(`/api/cards/${id}/restore`, {
        method: 'POST',
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

  admin: {
    getStats: async (): Promise<{ success: boolean; data: AdminStats }> => {
      return request<{ success: boolean; data: AdminStats }>('/api/admin/stats');
    },

    getProjects: async (params?: { includeDeleted?: boolean }): Promise<{ success: boolean; data: AdminProject[] }> => {
      const query = params?.includeDeleted ? '?includeDeleted=true' : '';
      return request<{ success: boolean; data: AdminProject[] }>(`/api/admin/projects${query}`);
    },

    restoreProject: async (projectId: string): Promise<{ success: boolean; message: string }> => {
      return request<{ success: boolean; message: string }>(`/api/admin/projects/${projectId}/restore`, {
        method: 'POST',
      });
    },

    updateMembers: async (projectId: string, userIds: string[]): Promise<{ success: boolean; data: ProjectMember[] }> => {
      return request<{ success: boolean; data: ProjectMember[] }>(`/api/admin/projects/${projectId}/members`, {
        method: 'PUT',
        body: JSON.stringify({ userIds }),
      });
    },

    getUsers: async (params?: { includeDeleted?: boolean }): Promise<{ success: boolean; data: AdminUser[] }> => {
      const query = params?.includeDeleted ? '?includeDeleted=true' : '';
      return request<{ success: boolean; data: AdminUser[] }>(`/api/admin/users${query}`);
    },

    createUser: async (data: {
      name: string;
      username: string;
      password: string;
      role: Role;
    }): Promise<{ success: boolean; data: AdminUser; message?: string }> => {
      return request<{ success: boolean; data: AdminUser; message?: string }>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    toggleLock: async (userId: string, isLocked: boolean): Promise<{ success: boolean; data: AuthUser }> => {
      return request<{ success: boolean; data: AuthUser }>(`/api/admin/users/${userId}/lock`, {
        method: 'PATCH',
        body: JSON.stringify({ isLocked }),
      });
    },

    deleteUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
      return request<{ success: boolean; message: string }>(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
    },

    restoreUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
      return request<{ success: boolean; message: string }>(`/api/admin/users/${userId}/restore`, {
        method: 'POST',
      });
    },

    updateRole: async (userId: string, role: Role): Promise<{ success: boolean; data: AuthUser }> => {
      return request<{ success: boolean; data: AuthUser }>(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    },

    resetPassword: async (userId: string, password: string): Promise<{ success: boolean; message: string }> => {
      return request<{ success: boolean; message: string }>(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
    },

    getActivities: async (params?: {
      page?: number;
      limit?: number;
      projectId?: string;
      action?: string;
      userId?: string;
      from?: string;
      to?: string;
    }): Promise<{
      success: boolean;
      data: ActivityLog[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.projectId) searchParams.set('projectId', params.projectId);
      if (params?.action) searchParams.set('action', params.action);
      if (params?.userId) searchParams.set('userId', params.userId);
      if (params?.from) searchParams.set('from', params.from);
      if (params?.to) searchParams.set('to', params.to);
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return request<{
        success: boolean;
        data: ActivityLog[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`/api/admin/activities${query}`);
    },
  },

  notifications: {
    list: async (params?: { type?: 'MENTION' | 'ALL'; page?: number; limit?: number }): Promise<{
      success: boolean;
      data: Notification[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        unreadCount: number;
      };
    }> => {
      const searchParams = new URLSearchParams();
      if (params?.type && params.type !== 'ALL') searchParams.set('type', params.type);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return request<{
        success: boolean;
        data: Notification[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          unreadCount: number;
        };
      }>(`/api/notifications${query}`);
    },

    unreadCount: async (): Promise<{ success: boolean; data: { unreadCount: number } }> => {
      return request<{ success: boolean; data: { unreadCount: number } }>('/api/notifications/unread-count');
    },

    markAsRead: async (id: string): Promise<{ success: boolean; data: Notification }> => {
      return request<{ success: boolean; data: Notification }>(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
    },

    markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
      return request<{ success: boolean; message: string }>('/api/notifications/mark-all-read', {
        method: 'POST',
      });
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

export interface AdminStats {
  totalProjects: number;
  totalUsers: number;
  totalCards: number;
  totalLanes: number;
  totalCompletedCards: number;
  completionRate: number;
  roleCounts: {
    ADMIN: number;
    MANAGER: number;
    MEMBER: number;
  };
}

export interface AdminProject {
  id: string;
  name: string;
  description: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
  isDeleted?: boolean;
  totalLanes: number;
  totalCards: number;
  completedCards: number;
  completionPercentage: number;
  memberCount: number;
  members: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      username: string;
      role: Role;
    };
    createdAt: string;
  }>;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  role: Role;
  isLocked?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
  createdAt: string;
  assignedProjects: Array<{
    id: string;
    name: string;
  }>;
}
