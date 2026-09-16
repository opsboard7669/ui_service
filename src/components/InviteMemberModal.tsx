import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Building2, FolderKanban, User } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { workspaceApi, projectApi } from '../lib/api';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import UserSearch from './UserSearch';
import { PrimaryButton } from './Button';

interface User {
  id: number;
  email: string;
  name: string;
  username?: string;
}

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess?: () => void;
}

const ROLES = ['Admin', 'Member', 'Viewer'] as const;

const ROLE_DESCRIPTIONS: Record<'Admin' | 'Member' | 'Viewer', string> = {
  Admin: 'Can invite members and manage workspace tasks.',
  Member: 'Can create, update and complete tasks.',
  Viewer: 'Can only view tasks and workspace information.',
};

const ROLE_MAP: Record<'Admin' | 'Member' | 'Viewer', 'ADMIN' | 'MEMBER' | 'VIEWER'> = {
  Admin: 'ADMIN',
  Member: 'MEMBER',
  Viewer: 'VIEWER',
};

export default function InviteMemberModal({ isOpen, onClose, onInviteSuccess }: InviteMemberModalProps) {
  const { currentWorkspace } = useWorkspace();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(true);
  const [role, setRole] = useState<'Admin' | 'Member' | 'Viewer'>('Member');
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  // Fetch projects for the current workspace
  const { data: projects } = useQuery({
    queryKey: ['projects', currentWorkspace?._id],
    queryFn: async () => {
      const response = await projectApi.getAll({ workspaceId: currentWorkspace?._id });
      // Defensive handling: extract the array from various response shapes
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      if (response.data?.success && Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      return [];
    },
    enabled: !!currentWorkspace?._id && isOpen,
  });

  // Fetch current workspace members to exclude from search
  const { data: members } = useQuery({
    queryKey: ['workspace-members', currentWorkspace?._id],
    queryFn: async () => {
      if (!currentWorkspace?._id) return [];
      const response = await workspaceApi.getMembers(currentWorkspace._id);
      // Defensive handling: extract the array from various response shapes
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      if (response.data?.success && Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      return [];
    },
    enabled: !!currentWorkspace?._id && isOpen,
  });

  // Extract userIds from members to exclude from search
  const excludeUserIds = members
    ? members
        .filter((m: any) => m.status === 'ACTIVE' && m.userId)
        .map((m: any) => m.userId)
    : [];

  const isFormValid = selectedUser !== null;

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setShowUserSearch(false);
  };

  const handleChangeUser = () => {
    setShowUserSearch(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !selectedUser) return;

    if (!currentWorkspace?._id) {
      toast.error('No workspace selected');
      return;
    }

    setLoading(true);
    try {
      await workspaceApi.inviteMember(currentWorkspace._id, {
        userId: selectedUser.id,
        role: ROLE_MAP[role],
        projectId: projectId || undefined,
        invitationType: 'IN_APP',
      });
      
      toast.success('Member added successfully');
      onClose();
      setSelectedUser(null);
      setShowUserSearch(true);
      setRole('Member');
      setProjectId('');
      onInviteSuccess?.();
    } catch (error: any) {
      console.error('Failed to invite member:', error);
      const message = error.response?.data?.message || 'Failed to add member';
      
      if (error.response?.status === 409) {
        toast.error('This user has already been invited');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to add members');
      } else if (error.response?.status === 404) {
        toast.error('Workspace not found');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUser(null);
      setShowUserSearch(true);
      setRole('Member');
      setProjectId('');
    }
  }, [isOpen]);

  const selectedProject = Array.isArray(projects) ? projects.find((p: any) => p._id === projectId) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="glass-card w-full max-w-sm p-4"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-md hover:bg-white/10 transition-all text-secondary hover:text-white"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="mb-4">
              <h2 className="text-base font-bold text-white mb-1.5">Add Member</h2>
              <p className="text-secondary text-xs">Add a registered user to collaborate in this workspace.</p>
            </div>

            {/* Current Workspace Info */}
            <div className="mb-4 p-3 rounded-md" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'var(--color-border-primary)' }}>
              <p className="text-[10px] text-secondary uppercase tracking-wider mb-1.5">Workspace</p>
              <div className="flex items-center gap-1.5">
                <Building2 size={14} className="text-primary" />
                <span className="text-xs font-medium text-white">
                  {currentWorkspace?.name || 'Unknown Workspace'}
                </span>
                <span className="text-[10px] text-secondary">(Current Workspace)</span>
              </div>
            </div>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="label-field text-xs">
                  Search User *
                </label>
                {showUserSearch ? (
                  <UserSearch
                    onSelectUser={handleSelectUser}
                    excludeUserIds={excludeUserIds}
                    placeholder="Search by name, username, or email..."
                    disabled={loading}
                  />
                ) : selectedUser && (
                  <div className="p-3 rounded-md" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'var(--color-border-primary)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-medium">
                        {selectedUser.name ? getInitials(selectedUser.name) : <User size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          {selectedUser.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-secondary">
                          @{selectedUser.username}
                        </p>
                        <p className="text-xs text-secondary">
                          {selectedUser.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleChangeUser}
                        disabled={loading}
                        className="text-xs text-primary hover:text-white transition-colors disabled:opacity-50"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="role" className="label-field text-xs">
                  Role *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    disabled={loading}
                    className="w-full input-field px-3 py-2 text-xs flex items-center justify-between text-left disabled:opacity-50"
                  >
                    <span>{role}</span>
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${roleDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {roleDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 rounded-md shadow-xl z-10 overflow-hidden" style={{ background: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border-primary)' }}>
                      {ROLES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setRole(r);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-xs text-left transition-all ${
                            role === r
                              ? 'bg-primary/20 text-white'
                              : 'text-secondary hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-secondary text-[10px] mt-1.5">{ROLE_DESCRIPTIONS[role]}</p>
              </div>

              <div>
                <label htmlFor="project" className="label-field text-xs">
                  Project (Optional)
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                    disabled={loading}
                    className="w-full input-field px-3 py-2 text-xs flex items-center justify-between text-left disabled:opacity-50"
                  >
                    <span className="flex items-center gap-1.5">
                      {selectedProject ? (
                        <>
                          <FolderKanban size={12} className="text-primary" />
                          {selectedProject.name}
                        </>
                      ) : (
                        'No project selected'
                      )}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${projectDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {projectDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 rounded-md shadow-xl z-10 overflow-hidden max-h-48 overflow-y-auto" style={{ background: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border-primary)' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setProjectId('');
                          setProjectDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-xs text-left transition-all ${
                          !projectId
                            ? 'bg-primary/20 text-white'
                            : 'text-secondary hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        No project
                      </button>
                      {Array.isArray(projects) && projects.map((project: any) => (
                        <button
                          key={project._id}
                          type="button"
                          onClick={() => {
                            setProjectId(project._id);
                            setProjectDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-xs text-left transition-all ${
                            projectId === project._id
                              ? 'bg-primary/20 text-white'
                              : 'text-secondary hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <FolderKanban size={12} className="text-primary" />
                            {project.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-secondary text-[10px] mt-1.5">
                  Optionally assign the user to a specific project.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-3 py-2 rounded-md border border-white/10 text-white hover:bg-white/5 transition-all text-xs disabled:opacity-50"
                >
                  Cancel
                </button>
                <PrimaryButton
                  type="submit"
                  disabled={!isFormValid || loading}
                  loading={loading}
                  className="flex-1 text-xs"
                >
                  Invite Member
                </PrimaryButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
