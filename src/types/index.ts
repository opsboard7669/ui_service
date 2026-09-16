export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  username: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Organization {
  _id: string;
  name: string;
  industry: string | null;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  _id: string;
  organizationId: string;
  name: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
  status?: 'ACTIVE' | 'INVITED' | 'REMOVED';
  joinedAt?: string;
  avatarId?: string;
  accentColor?: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  category: 'cicd' | 'kubernetes' | 'aws' | 'security' | 'monitoring' | 'infrastructure';
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  workspaceId?: string;
  projectId?: string | null;
  assignedTo?: string | null;
  assignedBy?: string | null;
  assignedAt?: string | null;
  updatedBy?: string | null;
}

export interface Comment {
  _id?: string;
  id?: string;
  text: string;
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  category: 'cicd' | 'kubernetes' | 'aws' | 'security' | 'monitoring' | 'infrastructure';
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  category?: 'cicd' | 'kubernetes' | 'aws' | 'security' | 'monitoring' | 'infrastructure';
  priority?: 'high' | 'medium' | 'low';
  status?: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string | null;
  email: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  status: 'INVITED' | 'ACTIVE' | 'REMOVED';
  joinedAt?: string;
  invitedBy?: string;
  invitedAt?: string;
}

export interface WorkspaceMembersResponse {
  activeMembers: WorkspaceMember[];
  pendingInvitations: WorkspaceMember[];
}

export interface InviteMemberRequest {
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}
