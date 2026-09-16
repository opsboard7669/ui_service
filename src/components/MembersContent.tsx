import { useState, useEffect } from 'react';
import { Users, UserPlus, Building2, Crown, Shield, Eye, Loader2, Lock } from 'lucide-react';
import InviteMemberModal from './InviteMemberModal';
import MembersTable from './MembersTable';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { workspaceApi } from '../lib/api';
import type { WorkspaceMembersResponse } from '../types';
import toast from 'react-hot-toast';

interface MembersContentProps {
  showHeader?: boolean;
  showSummaryCard?: boolean;
}

export default function MembersContent({ showHeader = true, showSummaryCard = true }: MembersContentProps) {
  const { currentWorkspace, hasPermission, userRole } = useWorkspace();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [members, setMembers] = useState<WorkspaceMembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get current user ID from localStorage
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUser?.id;
  
  // Permission checks
  const canInviteMembers = hasPermission('members.invite');
  const canChangeRoles = hasPermission('members.role');
  const canRemoveMembers = hasPermission('members.remove');
  const canManageMembers = canInviteMembers || canChangeRoles || canRemoveMembers;
  const isReadOnly = !canManageMembers;

  const fetchMembers = async () => {
    if (!currentWorkspace?._id) return;
    
    try {
      setLoading(true);
      const response = await workspaceApi.getMembers(currentWorkspace._id);
      const data = response.data?.data;
      
      // Defensive handling: ensure the response has the expected structure
      const membersData = {
        activeMembers: Array.isArray(data?.activeMembers) ? data.activeMembers : [],
        pendingInvitations: Array.isArray(data?.pendingInvitations) ? data.pendingInvitations : [],
      };
      
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast.error('Failed to load members');
      setMembers({ activeMembers: [], pendingInvitations: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [currentWorkspace?._id, refreshKey]);

  const handleInviteSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const hasMembers = members && (members.activeMembers.length > 0 || members.pendingInvitations.length > 0);

  const allMembers = [
    ...(Array.isArray(members?.activeMembers) ? members.activeMembers.map(m => ({ ...m, status: 'ACTIVE' as const, userId: m.userId || undefined })) : []),
    ...(Array.isArray(members?.pendingInvitations) ? members.pendingInvitations.map(m => ({ ...m, status: 'INVITED' as const, userId: m.userId || undefined })) : []),
  ];

  const adminCount = Array.isArray(members?.activeMembers) ? members.activeMembers.filter(m => m.role === 'ADMIN').length : 0;
  const viewerCount = Array.isArray(members?.activeMembers) ? members.activeMembers.filter(m => m.role === 'VIEWER').length : 0;

  return (
    <div className="space-y-3 md:space-y-4 pb-20">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-xl gradient-text mb-1 md:mb-2">
              Members
            </h1>
            <p className="text-secondary text-xs md:text-sm">
              {isReadOnly ? 'View workspace members' : 'Manage members in your current workspace.'}
            </p>
          </div>
          {isReadOnly && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded md:hidden" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              <Lock size={14} style={{ color: '#fbbf24' }} />
              <span className="text-xs" style={{ color: '#fcd34d' }}>Read Only</span>
            </div>
          )}
        </div>
      )}

      {/* Summary Card */}
      {showSummaryCard && (
        <div className="glass-card card-hover p-3 md:p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Workspace */}
            <div className="md:col-span-1">
              <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Workspace</p>
              <div className="flex items-center gap-1.5">
                <Building2 size={14} className="text-primary" />
                <span className="text-xs font-medium text-white truncate">
                  {currentWorkspace?.name || 'Unknown Workspace'}
                </span>
              </div>
            </div>

            {/* Your Role */}
            <div className="md:col-span-1">
              <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Your Role</p>
              <div className="flex items-center gap-1.5">
                <Crown size={14} className="text-yellow-400" />
                <span className="text-xs font-medium text-white">
                  {currentWorkspace?.role || 'Member'}
                </span>
              </div>
            </div>

            {/* Members Count */}
            <div className="md:col-span-1">
              <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Members</p>
              <p className="text-xs font-medium text-white">
                {loading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  `${members?.activeMembers.length || 0} Active`
                )}
              </p>
            </div>

            {/* Pending Invitations */}
            <div className="md:col-span-1">
              <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Pending</p>
              <p className="text-xs font-medium text-white">
                {loading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  `${members?.pendingInvitations.length || 0}`
                )}
              </p>
            </div>

            {/* Admins Count */}
            <div className="md:col-span-1">
              <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Admins</p>
              <div className="flex items-center gap-1.5">
                <Shield size={12} className="text-purple-400" />
                <p className="text-xs font-medium text-white">
                  {loading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    adminCount
                  )}
                </p>
              </div>
            </div>

            {/* Viewers Count */}
            <div className="md:col-span-1">
              <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Viewers</p>
              <div className="flex items-center gap-1.5">
                <Eye size={12} className="text-gray-400" />
                <p className="text-xs font-medium text-white">
                  {loading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    viewerCount
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Send Invitation Button - Only for Owners/Admins */}
          {canManageMembers && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="gradient-btn px-3 py-1.5 text-xs flex items-center gap-2"
              >
                <UserPlus size={14} />
                Send Invitation
              </button>
            </div>
          )}
          {isReadOnly && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border-primary)' }}>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#fbbf24' }}>
                <Lock size={12} />
                <span>Only workspace owners and admins can invite members</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="glass-card card-hover p-4 md:p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-white/10 rounded animate-pulse" />
                    <div className="w-24 h-3 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-6 bg-white/10 rounded-full animate-pulse" />
                  <div className="w-16 h-6 bg-white/10 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !hasMembers && (
        <div className="glass-card card-hover p-8 md:p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shadow-lg">
              <Users size={40} className="text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                No team members yet
              </h3>
              <p className="text-secondary text-sm max-w-md leading-relaxed">
                {isReadOnly ? 'No members in this workspace yet.' : 'Invite teammates to collaborate in this workspace.'}
              </p>
            </div>
            {canManageMembers && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="gradient-btn px-6 py-3 text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <UserPlus size={18} />
                Invite Member
              </button>
            )}
          </div>
        </div>
      )}

      {/* Members Table */}
      {!loading && hasMembers && (
        <MembersTable
          members={allMembers}
          currentUserId={currentUserId}
          currentUserRole={userRole || undefined}
          workspaceId={currentWorkspace?._id || ''}
          onRefresh={handleInviteSuccess}
          readOnly={isReadOnly}
        />
      )}

      {canManageMembers && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onInviteSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
}
