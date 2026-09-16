import axios, { type InternalAxiosRequestConfig } from 'axios';

const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || '';
const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || '';
const TASK_SERVICE_URL = import.meta.env.VITE_TASK_SERVICE_URL || '';

const getAccessToken = () => localStorage.getItem('accessToken');

const setAuthHeader = (config: InternalAxiosRequestConfig, token: string) => {
  if (typeof config.headers.set === 'function') {
    config.headers.set('Authorization', `Bearer ${token}`);
  } else {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const clearAuthStorage = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

export const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const createAuthenticatedClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      setAuthHeader(config, token);
    }

    // Auto-add workspaceId to workspace-scoped endpoints
    const workspaceId = localStorage.getItem('currentWorkspaceId');
    const workspaceScopedEndpoints = [
      '/api/tasks',
      '/api/projects',
      '/api/workspaces',
    ];

    const isWorkspaceScoped = workspaceScopedEndpoints.some(endpoint => 
      config.url?.startsWith(endpoint)
    );

    if (workspaceId && isWorkspaceScoped) {
      // Add workspaceId to params only if not already present in params
      if (!config.params) {
        config.params = {};
      }
      // Don't override if workspaceId is already explicitly set
      if (!config.params.workspaceId) {
        config.params.workspaceId = workspaceId;
      }
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        setAuthHeader(originalRequest, accessToken);
        return client(originalRequest);
      } catch (refreshError) {
        clearAuthStorage();
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }
  );

  return client;
};

const apiClient = createAuthenticatedClient(AUTH_SERVICE_URL);
const taskClient = createAuthenticatedClient(TASK_SERVICE_URL);
const userClient = createAuthenticatedClient(USER_SERVICE_URL);

const publicTaskClient = axios.create({
  baseURL: TASK_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const publicAuthClient = axios.create({
  baseURL: AUTH_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  login: (data: { emailOrUsername: string; password: string }) =>
    publicAuthClient.post('/api/auth/login', data),
  
  register: (data: { email: string; password: string; confirmPassword: string; name: string; username: string }) =>
    publicAuthClient.post('/api/auth/register', data),
  
  refresh: (refreshToken: string) =>
    publicAuthClient.post('/api/auth/refresh', { refreshToken }),
  
  requestPasswordReset: (email: string) =>
    publicAuthClient.post('/api/auth/forgot-password/request-otp', { email }),
  
  verifyOTPAndResetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    publicAuthClient.post('/api/auth/forgot-password/verify-otp', data),

  contact: (data: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    message: string;
  }) => publicAuthClient.post('/api/auth/contact', data),
};

export const userApi = {
  getById: (id: string) => userClient.get(`/api/users/${id}`),

  update: (id: string, data: Partial<{ name: string; email: string }>) =>
    userClient.put(`/api/users/${id}`, data),

  delete: (id: string) => userClient.delete(`/api/users/${id}`),

  checkEmailExists: (email: string) =>
    userClient.get('/api/users/check-email', { params: { email } }),

  searchUsers: (query: string, limit?: number) =>
    apiClient.get('/api/users/search', { params: { q: query, limit } }),
};

export const taskApi = {
  getAll: (params?: Record<string, unknown>) => taskClient.get('/api/tasks', { params }),

  getById: (id: string) =>
    taskClient.get(`/api/tasks/${id}`, { headers: getAuthHeaders() }),

  create: (data: Record<string, unknown>) => taskClient.post('/api/tasks', data),

  update: (id: string, data: Record<string, unknown>) => taskClient.put(`/api/tasks/${id}`, data),

  delete: (id: string) => taskClient.delete(`/api/tasks/${id}`),

  addComment: (id: string, text: string) =>
    taskClient.post(`/api/tasks/${id}/comments`, { text }, { headers: getAuthHeaders() }),

  getComments: (id: string) =>
    taskClient.get(`/api/tasks/${id}/comments`, { headers: getAuthHeaders() }),
};

export const workspaceApi = {
  getAll: () => taskClient.get('/api/workspaces'),

  getById: (id: string) => taskClient.get(`/api/workspaces/${id}`),

  create: (data: { name: string; description?: string }) =>
    taskClient.post('/api/workspaces', data),

  update: (id: string, data: { name?: string; description?: string }) =>
    taskClient.put(`/api/workspaces/${id}`, data),

  delete: (id: string) => taskClient.delete(`/api/workspaces/${id}`),

  inviteMember: (workspaceId: string, data: { userId: number; role: string; projectId?: string; invitationType?: string }) =>
    taskClient.post(`/api/workspaces/${workspaceId}/invite`, data),

  getMembers: (workspaceId: string) =>
    taskClient.get(`/api/workspaces/${workspaceId}/members`),

  updateMemberRole: (workspaceId: string, memberId: string, role: string) =>
    taskClient.patch(`/api/workspaces/${workspaceId}/members/${memberId}/role`, { role }),

  removeMember: (workspaceId: string, memberId: string) =>
    taskClient.delete(`/api/workspaces/${workspaceId}/members/${memberId}`),

  resendInvitation: (workspaceId: string, memberId: string) =>
    taskClient.post(`/api/workspaces/${workspaceId}/members/${memberId}/resend`),

  getInvitationLink: (workspaceId: string, memberId: string) =>
    taskClient.get(`/api/workspaces/${workspaceId}/members/${memberId}/link`),

  cancelInvitation: (workspaceId: string, memberId: string) =>
    taskClient.delete(`/api/workspaces/${workspaceId}/invitations/${memberId}`),

  validateInvitation: (token: string) =>
    publicTaskClient.get(`/api/workspaces/invitations/${token}`),

  acceptInvitation: (token: string) =>
    taskClient.post(`/api/workspaces/invitations/${token}/accept`),

  getSettings: (id: string) =>
    taskClient.get(`/api/workspaces/${id}/settings`),

  updateSettings: (id: string, data: {
    name: string;
    description?: string;
    companyName?: string;
    industry?: string;
    timezone?: string;
    avatarId?: string;
    accentColor?: string;
  }) => taskClient.put(`/api/workspaces/${id}/settings`, data),

  getOverview: (id: string) =>
    taskClient.get(`/api/workspaces/${id}/overview`),
};

export const migrationApi = {
  run: (userId: string, userName: string) =>
    taskClient.post('/api/migration/run', { userId, userName }),

  getStatus: () => taskClient.get('/api/migration/status'),
};

export const projectApi = {
  getAll: (params?: { workspaceId?: string; status?: string; search?: string }) =>
    taskClient.get('/api/projects', { params }),

  getById: (id: string) =>
    taskClient.get(`/api/projects/${id}`),

  create: (data: {
    workspaceId: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    status?: string;
    ownerId?: string;
    startDate?: string;
    dueDate?: string;
  }) => taskClient.post('/api/projects', data),

  update: (id: string, data: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    status?: string;
    ownerId?: string;
    startDate?: string;
    dueDate?: string;
  }) => taskClient.put(`/api/projects/${id}`, data),

  delete: (id: string) => taskClient.delete(`/api/projects/${id}`),

  archive: (id: string) => taskClient.patch(`/api/projects/${id}/archive`),

  unarchive: (id: string) => taskClient.patch(`/api/projects/${id}/unarchive`),

  getStatistics: (workspaceId: string) =>
    taskClient.get('/api/projects/statistics', { params: { workspaceId } }),

  // Project-specific endpoints
  getTaskStatistics: (id: string) =>
    taskClient.get(`/api/projects/${id}/task-statistics`),

  getMembers: (id: string) =>
    taskClient.get(`/api/projects/${id}/members`),

  getActivities: (id: string, limit?: number) =>
    taskClient.get(`/api/projects/${id}/activities`, { params: { limit } }),

  getUpcomingDeadlines: (id: string, limit?: number) =>
    taskClient.get(`/api/projects/${id}/deadlines`, { params: { limit } }),

  addMember: (id: string, data: { userId: string; role?: string }) =>
    taskClient.post(`/api/projects/${id}/members`, data),

  removeMember: (id: string, memberId: string) =>
    taskClient.delete(`/api/projects/${id}/members/${memberId}`),

  updateMemberRole: (id: string, memberId: string, role: string) =>
    taskClient.patch(`/api/projects/${id}/members/${memberId}/role`, { role }),
};

export const notificationApi = {
  // General notifications
  getNotifications: (params?: { limit?: number; offset?: number; type?: string; workspaceId?: string; isRead?: string; priority?: string }) =>
    taskClient.get('/api/notifications', { params }),

  getUnreadCount: () =>
    taskClient.get('/api/notifications/unread-count'),

  markAsRead: (id: string) =>
    taskClient.patch(`/api/notifications/${id}/read`),

  markAllAsRead: (workspaceId?: string) =>
    taskClient.patch('/api/notifications/read-all', workspaceId ? { params: { workspaceId } } : {}),

  deleteNotification: (id: string) =>
    taskClient.delete(`/api/notifications/${id}`),

  // Notification preferences
  getPreferences: () =>
    taskClient.get('/api/notifications/preferences'),

  updateWorkspacePreferences: (workspaceId: string, preferences: any) =>
    taskClient.put(`/api/notifications/preferences/workspace/${workspaceId}`, preferences),

  updateGlobalPreferences: (preferences: any) =>
    taskClient.put('/api/notifications/preferences/global', preferences),

  archiveNotifications: (daysToKeep?: number) =>
    taskClient.post('/api/notifications/archive', { daysToKeep }),

  // Invitations (legacy)
  getInvitations: () =>
    taskClient.get('/api/notifications/invitations'),

  acceptInvitation: (invitationId: string) =>
    taskClient.post(`/api/notifications/invitations/${invitationId}/accept`),

  declineInvitation: (invitationId: string) =>
    taskClient.post(`/api/notifications/invitations/${invitationId}/decline`),
};

export const activityApi = {
  // Get activities for a workspace
  getWorkspaceActivities: (workspaceId: string, params?: { limit?: number; offset?: number; eventType?: string; entityType?: string; projectId?: string; actorId?: string }) =>
    taskClient.get(`/api/activities/workspace/${workspaceId}`, { params }),

  // Get recent activities for dashboard
  getRecentActivities: (workspaceId: string, limit?: number) =>
    taskClient.get(`/api/activities/workspace/${workspaceId}/recent`, { params: { limit } }),

  // Get activities grouped by day
  getActivitiesByDay: (workspaceId: string, params?: { limit?: number; offset?: number }) =>
    taskClient.get(`/api/activities/workspace/${workspaceId}/grouped`, { params }),

  // Get activities for a specific entity
  getEntityActivities: (entityId: string, entityType: string, params?: { limit?: number; offset?: number }) =>
    taskClient.get(`/api/activities/entity/${entityId}/${entityType}`, { params }),

  // Delete activity (admin only)
  deleteActivity: (id: string) =>
    taskClient.delete(`/api/activities/${id}`),
};

export default apiClient;
