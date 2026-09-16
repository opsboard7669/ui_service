import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { workspaceApi } from '@/lib/api';
import type { Workspace } from '@/types';
import { hasPermission, getNavigationAccess, getDashboardWidgets, type WorkspaceRole } from '@/lib/permissions';
import toast from 'react-hot-toast';

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  userRole: WorkspaceRole | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
  hasPermission: (permission: string) => boolean;
  canAccessNavigation: (item: string) => boolean;
  getAvailableWidgets: () => string[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<WorkspaceRole | null>(null);
  const navigate = useNavigate();

  const refreshWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const response = await workspaceApi.getAll();
      const workspaceList = response.data.data;
      setWorkspaces(workspaceList);

      // Set current workspace from localStorage or first workspace
      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      
      if (savedWorkspaceId) {
        const savedWorkspace = workspaceList.find((w: Workspace) => w._id === savedWorkspaceId);
        if (savedWorkspace) {
          setCurrentWorkspace(savedWorkspace);
          // Role should be determined from member data, not workspace object
          setUserRole('MEMBER'); // Default to MEMBER, will be updated by member data
          return;
        }
      }

      // If no saved workspace or not found, set first workspace
      if (workspaceList.length > 0) {
        setCurrentWorkspace(workspaceList[0]);
        localStorage.setItem('currentWorkspaceId', workspaceList[0]._id);
        setUserRole('MEMBER'); // Default to MEMBER, will be updated by member data
      } else {
        setCurrentWorkspace(null);
        setUserRole(null);
        localStorage.removeItem('currentWorkspaceId');
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
      toast.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  }, []);

  const createWorkspace = useCallback(async (name: string, description?: string) => {
    try {
      const response = await workspaceApi.create({ name, description });
      const newWorkspace = response.data.data;
      toast.success('Workspace created successfully');
      await refreshWorkspaces();
      setCurrentWorkspace(newWorkspace);
      localStorage.setItem('currentWorkspaceId', newWorkspace._id);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Failed to create workspace:', error);
      const message = error.response?.data?.message || 'Failed to create workspace';
      toast.error(message);
      throw error;
    }
  }, [refreshWorkspaces, navigate]);

  const switchWorkspace = useCallback((workspaceId: string) => {
    const workspace = workspaces.find(w => w._id === workspaceId);
    
    if (workspace) {
      setCurrentWorkspace(workspace);
      setUserRole('MEMBER'); // Default to MEMBER, will be updated by member data
      localStorage.setItem('currentWorkspaceId', workspaceId);
      toast.success(`Switched to ${workspace.name}`);
    } else {
      toast.error('Workspace not found');
    }
  }, [workspaces]);

  // Permission helper functions
  const checkPermission = useCallback((permission: string): boolean => {
    if (!userRole) return false;
    return hasPermission(userRole, permission as any);
  }, [userRole]);

  const checkNavigationAccess = useCallback((item: string): boolean => {
    if (!userRole) return false;
    const allowedItems = getNavigationAccess(userRole);
    return allowedItems.includes(item);
  }, [userRole]);

  const getWidgets = useCallback((): string[] => {
    if (!userRole) return [];
    return getDashboardWidgets(userRole);
  }, [userRole]);

  useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  // Redirect to create workspace if no workspace exists
  useEffect(() => {
    if (!loading && workspaces.length === 0) {
      navigate('/create-workspace');
    }
  }, [loading, workspaces.length, navigate]);

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        loading,
        userRole,
        setCurrentWorkspace,
        refreshWorkspaces,
        createWorkspace,
        switchWorkspace,
        hasPermission: checkPermission,
        canAccessNavigation: checkNavigationAccess,
        getAvailableWidgets: getWidgets,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
