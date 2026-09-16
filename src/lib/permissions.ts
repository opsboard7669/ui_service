/**
 * Permission System for UI
 * 
 * This module mirrors the backend permission system to enable
 * permission-based UI rendering in the frontend.
 */

export const WorkspaceRoles = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;

export type WorkspaceRole = typeof WorkspaceRoles[keyof typeof WorkspaceRoles];

export const WorkspaceMemberStatus = {
  ACTIVE: 'ACTIVE',
  INVITED: 'INVITED',
  DECLINED: 'DECLINED',
  LEFT: 'LEFT',
  REMOVED: 'REMOVED',
} as const;

export type WorkspaceMemberStatusType = typeof WorkspaceMemberStatus[keyof typeof WorkspaceMemberStatus];

export const Permissions = {
  // Workspace Permissions
  WORKSPACE_MANAGE: 'workspace.manage',
  WORKSPACE_DELETE: 'workspace.delete',
  WORKSPACE_SETTINGS: 'workspace.settings',
  WORKSPACE_VIEW: 'workspace.view',
  
  // Member Permissions
  MEMBERS_INVITE: 'members.invite',
  MEMBERS_ROLE: 'members.role',
  MEMBERS_REMOVE: 'members.remove',
  MEMBERS_VIEW: 'members.view',
  
  // Project Permissions
  PROJECTS_MANAGE: 'projects.manage',
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_EDIT: 'projects.edit',
  PROJECTS_DELETE: 'projects.delete',
  PROJECTS_ARCHIVE: 'projects.archive',
  PROJECTS_VIEW: 'projects.view',
  
  // Task Permissions
  TASKS_MANAGE: 'tasks.manage',
  TASKS_CREATE: 'tasks.create',
  TASKS_UPDATE: 'tasks.update',
  TASKS_DELETE: 'tasks.delete',
  TASKS_VIEW: 'tasks.view',
  
  // Comment Permissions
  COMMENTS_CREATE: 'comments.create',
  COMMENTS_VIEW: 'comments.view',
  
  // Analytics Permissions
  ANALYTICS_VIEW: 'analytics.view',
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];

const RolePermissions: Record<WorkspaceRole, Permission[]> = {
  [WorkspaceRoles.OWNER]: [
    Permissions.WORKSPACE_MANAGE,
    Permissions.WORKSPACE_DELETE,
    Permissions.WORKSPACE_SETTINGS,
    Permissions.WORKSPACE_VIEW,
    Permissions.MEMBERS_INVITE,
    Permissions.MEMBERS_ROLE,
    Permissions.MEMBERS_REMOVE,
    Permissions.MEMBERS_VIEW,
    Permissions.PROJECTS_MANAGE,
    Permissions.PROJECTS_CREATE,
    Permissions.PROJECTS_EDIT,
    Permissions.PROJECTS_DELETE,
    Permissions.PROJECTS_ARCHIVE,
    Permissions.PROJECTS_VIEW,
    Permissions.TASKS_MANAGE,
    Permissions.TASKS_CREATE,
    Permissions.TASKS_UPDATE,
    Permissions.TASKS_DELETE,
    Permissions.TASKS_VIEW,
    Permissions.COMMENTS_CREATE,
    Permissions.COMMENTS_VIEW,
    Permissions.ANALYTICS_VIEW,
  ],
  
  [WorkspaceRoles.ADMIN]: [
    Permissions.WORKSPACE_VIEW,
    Permissions.MEMBERS_INVITE,
    Permissions.MEMBERS_VIEW,
    Permissions.PROJECTS_MANAGE,
    Permissions.PROJECTS_CREATE,
    Permissions.PROJECTS_EDIT,
    Permissions.PROJECTS_ARCHIVE,
    Permissions.PROJECTS_VIEW,
    Permissions.TASKS_MANAGE,
    Permissions.TASKS_CREATE,
    Permissions.TASKS_UPDATE,
    Permissions.TASKS_VIEW,
    Permissions.COMMENTS_CREATE,
    Permissions.COMMENTS_VIEW,
  ],
  
  [WorkspaceRoles.MEMBER]: [
    Permissions.WORKSPACE_VIEW,
    Permissions.MEMBERS_VIEW,
    Permissions.PROJECTS_VIEW,
    Permissions.TASKS_CREATE,
    Permissions.TASKS_UPDATE,
    Permissions.TASKS_VIEW,
    Permissions.COMMENTS_CREATE,
    Permissions.COMMENTS_VIEW,
  ],
  
  [WorkspaceRoles.VIEWER]: [
    Permissions.WORKSPACE_VIEW,
    Permissions.MEMBERS_VIEW,
    Permissions.PROJECTS_VIEW,
    Permissions.TASKS_VIEW,
    Permissions.COMMENTS_VIEW,
  ],
};

export const NavigationAccess: Record<WorkspaceRole, string[]> = {
  [WorkspaceRoles.OWNER]: [
    'dashboard',
    'projects',
    'tasks',
    'kanban',
    'members',
    'analytics',
    'workspace-settings',
    'notifications',
    'profile',
  ],
  
  [WorkspaceRoles.ADMIN]: [
    'dashboard',
    'projects',
    'tasks',
    'kanban',
    'members',
    'notifications',
    'profile',
  ],
  
  [WorkspaceRoles.MEMBER]: [
    'dashboard',
    'projects',
    'tasks',
    'kanban',
    'members',
    'notifications',
    'profile',
  ],
  
  [WorkspaceRoles.VIEWER]: [
    'dashboard',
    'projects',
    'tasks',
    'members',
    'profile',
  ],
};

export const DashboardWidgets: Record<WorkspaceRole, string[]> = {
  [WorkspaceRoles.OWNER]: [
    'workspace-overview',
    'team-members',
    'pending-invitations',
    'projects',
    'tasks',
    'analytics',
    'recent-activity',
    'my-tasks',
  ],
  
  [WorkspaceRoles.ADMIN]: [
    'workspace-overview',
    'team-members',
    'projects',
    'tasks',
    'recent-activity',
    'my-tasks',
  ],
  
  [WorkspaceRoles.MEMBER]: [
    'my-tasks',
    'assigned-tasks',
    'recent-activity',
    'projects',
    'notifications',
  ],
  
  [WorkspaceRoles.VIEWER]: [
    'projects',
    'tasks',
    'recent-activity',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: WorkspaceRole, permission: Permission): boolean {
  const permissions = RolePermissions[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: WorkspaceRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: WorkspaceRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: WorkspaceRole): Permission[] {
  return RolePermissions[role] || [];
}

/**
 * Get navigation items for a role
 */
export function getNavigationAccess(role: WorkspaceRole): string[] {
  return NavigationAccess[role] || [];
}

/**
 * Get dashboard widgets for a role
 */
export function getDashboardWidgets(role: WorkspaceRole): string[] {
  return DashboardWidgets[role] || [];
}

/**
 * Check if a role can modify another role
 */
export function canModifyRole(actorRole: WorkspaceRole, targetRole: WorkspaceRole, action: 'change-role' | 'remove'): boolean {
  const roleHierarchy: Record<WorkspaceRole, number> = {
    [WorkspaceRoles.OWNER]: 3,
    [WorkspaceRoles.ADMIN]: 2,
    [WorkspaceRoles.MEMBER]: 1,
    [WorkspaceRoles.VIEWER]: 0,
  };
  
  const actorLevel = roleHierarchy[actorRole] || 0;
  const targetLevel = roleHierarchy[targetRole] || 0;
  
  // OWNER can modify anyone except themselves
  if (actorRole === WorkspaceRoles.OWNER) {
    return true;
  }
  
  // ADMIN cannot modify OWNER or other ADMINs
  if (actorRole === WorkspaceRoles.ADMIN) {
    if (targetRole === WorkspaceRoles.OWNER) {
      return false;
    }
    if (targetRole === WorkspaceRoles.ADMIN && action === 'remove') {
      return false;
    }
    return actorLevel > targetLevel;
  }
  
  // MEMBER and VIEWER cannot modify anyone
  return false;
}
