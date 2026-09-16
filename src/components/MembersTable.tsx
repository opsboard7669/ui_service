import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Crown, Shield, User, Eye, Search, Filter, ArrowUpDown, Mail, Trash2, UserMinus, Copy } from 'lucide-react';
import { workspaceApi } from '../lib/api';
import { getInitials, formatDate } from '../lib/utils';
import toast from 'react-hot-toast';
import ChangeRoleModal from './ChangeRoleModal';
import RemoveMemberDialog from './RemoveMemberDialog';
import DeleteInvitationDialog from './DeleteInvitationDialog';

interface Member {
  id: string;
  userId?: string;
  email: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  status: 'ACTIVE' | 'INVITED' | 'REMOVED';
  joinedAt?: string;
  invitedAt?: string;
  name?: string;
  username?: string;
}

interface MembersTableProps {
  members: Member[];
  currentUserId?: string;
  currentUserRole?: string;
  workspaceId: string;
  onRefresh: () => void;
  readOnly?: boolean;
}

type FilterType = 'all' | 'active' | 'pending' | 'removed';
type SortType = 'name' | 'role' | 'joinedDate' | 'status';
type SortOrder = 'asc' | 'desc';

export default function MembersTable({
  members,
  currentUserId,
  currentUserRole,
  workspaceId,
  onRefresh,
  readOnly = false,
}: MembersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [changeRoleModalOpen, setChangeRoleModalOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown size={16} className="text-yellow-400" />;
      case 'ADMIN':
        return <Shield size={16} className="text-purple-400" />;
      case 'MEMBER':
        return <User size={16} className="text-blue-400" />;
      case 'VIEWER':
        return <Eye size={16} className="text-gray-400" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      OWNER: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      ADMIN: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      MEMBER: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      VIEWER: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };
    return colors[role] || 'bg-white/10 text-white border-white/20';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-500/20 text-green-300 border-green-500/30',
      INVITED: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      REMOVED: 'bg-red-500/20 text-red-300 border-red-500/30',
      DECLINED: 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return colors[status] || 'bg-white/10 text-white border-white/20';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: '🟢 Active',
      INVITED: '🟡 Invitation Pending',
      REMOVED: '🔴 Removed',
      DECLINED: '🔴 Declined',
    };
    return labels[status] || status;
  };

  const canManageMember = (member: Member) => {
    if (readOnly) return false;
    if (!currentUserRole) return false;
    
    // Owner can manage everyone except themselves
    if (currentUserRole === 'OWNER') {
      return member.userId !== currentUserId;
    }
    
    // Admin can manage MEMBER and VIEWER, but not OWNER or themselves
    if (currentUserRole === 'ADMIN') {
      return member.role !== 'OWNER' && member.userId !== currentUserId;
    }
    
    // Members and Viewers cannot manage anyone
    return false;
  };

  const canChangeRole = (member: Member) => {
    if (!currentUserRole) return false;
    
    if (currentUserRole === 'OWNER') {
      return member.userId !== currentUserId && member.role !== 'OWNER';
    }
    
    if (currentUserRole === 'ADMIN') {
      return member.role !== 'OWNER' && member.role !== 'ADMIN' && member.userId !== currentUserId;
    }
    
    return false;
  };

  const canRemoveMember = (member: Member) => {
    if (!currentUserRole) return false;
    
    if (currentUserRole === 'OWNER') {
      return member.userId !== currentUserId;
    }
    
    if (currentUserRole === 'ADMIN') {
      return member.role !== 'OWNER' && member.userId !== currentUserId;
    }
    
    return false;
  };

  const filteredAndSortedMembers = members
    .filter((member) => {
      const matchesSearch = 
        (member.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.status.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        filter === 'all' ||
        (filter === 'active' && member.status === 'ACTIVE') ||
        (filter === 'pending' && member.status === 'INVITED') ||
        (filter === 'removed' && member.status === 'REMOVED');
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.name || a.email || '').localeCompare(b.name || b.email || '');
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'joinedDate':
          const dateA = a.joinedAt || a.invitedAt || '';
          const dateB = b.joinedAt || b.invitedAt || '';
          comparison = dateA.localeCompare(dateB);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleResendInvitation = async (member: Member) => {
    try {
      setLoadingAction(member.id);
      setActionMenuOpen(null);
      
      await workspaceApi.resendInvitation(workspaceId, member.id);
      toast.success('Invitation resent successfully');
      
      onRefresh();
    } catch (error: any) {
      console.error('Failed to resend invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to resend invitation');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCopyInviteLink = async (member: Member) => {
    try {
      setLoadingAction(member.id);
      setActionMenuOpen(null);
      
      // Note: This needs to use the actual invitation token, not member ID
      // For now, we'll copy a placeholder since the token is not available in the member object
      const inviteLink = `${window.location.origin}/invitations/${member.id}`;
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Invite link copied to clipboard');
    } catch (error: any) {
      console.error('Failed to copy invite link:', error);
      toast.error('Failed to copy invite link');
    } finally {
      setLoadingAction(null);
    }
  };


  const handleDeleteInvitation = (member: Member) => {
    setSelectedMember(member);
    setActionMenuOpen(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteInvitationConfirm = async () => {
    if (!selectedMember) return;
    
    try {
      setLoading(true);
      await workspaceApi.cancelInvitation(workspaceId, selectedMember.id);
      toast.success('Invitation deleted successfully');
      setDeleteDialogOpen(false);
      onRefresh();
    } catch (error: any) {
      console.error('Failed to delete invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to delete invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = (member: Member) => {
    setSelectedMember(member);
    setActionMenuOpen(null);
    setChangeRoleModalOpen(true);
  };

  const handleRemoveMember = (member: Member) => {
    setSelectedMember(member);
    setActionMenuOpen(null);
    setRemoveDialogOpen(true);
  };

  const handleRoleChange = async (newRole: string) => {
    if (!selectedMember) return;
    
    try {
      setLoading(true);
      await workspaceApi.updateMemberRole(workspaceId, selectedMember.id, newRole);
      toast.success('Role updated successfully');
      setChangeRoleModalOpen(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!selectedMember) return;
    
    try {
      setLoading(true);
      await workspaceApi.removeMember(workspaceId, selectedMember.id);
      toast.success('Member removed successfully');
      setRemoveDialogOpen(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (type: SortType) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
  };

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close menu on escape key and click outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActionMenuOpen(null);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicking inside the menu
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      // Don't close if clicking a button that opens a menu
      const target = e.target as HTMLElement;
      if (target.closest('button[aria-label="Actions"]')) {
        return;
      }
      // Close if clicking outside
      setActionMenuOpen(null);
    };

    window.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);


  return (
    <>
      <div className="glass-card card-hover p-3 md:p-4">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              placeholder="Search by name, role, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-secondary focus:outline-none focus:border-primary/50 text-xs"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="pl-8 pr-6 py-1.5 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer text-xs"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="hidden md:block">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-secondary uppercase tracking-wider" style={{ width: 'auto' }}>
                  Member
                </th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-secondary uppercase tracking-wider cursor-pointer hover:text-white transition-colors" style={{ width: '120px' }}
                    onClick={() => toggleSort('role')}>
                  <div className="flex items-center gap-1.5">
                    Role
                    <ArrowUpDown size={12} className={sortBy === 'role' ? 'text-primary' : 'text-secondary'} />
                  </div>
                </th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-secondary uppercase tracking-wider cursor-pointer hover:text-white transition-colors" style={{ width: '120px' }}
                    onClick={() => toggleSort('status')}>
                  <div className="flex items-center gap-1.5">
                    Status
                    <ArrowUpDown size={12} className={sortBy === 'status' ? 'text-primary' : 'text-secondary'} />
                  </div>
                </th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-secondary uppercase tracking-wider cursor-pointer hover:text-white transition-colors" style={{ width: '140px' }}
                    onClick={() => toggleSort('joinedDate')}>
                  <div className="flex items-center gap-1.5">
                    Joined On
                    <ArrowUpDown size={12} className={sortBy === 'joinedDate' ? 'text-primary' : 'text-secondary'} />
                  </div>
                </th>
                <th className="text-right py-2 px-3 text-[10px] font-semibold text-secondary uppercase tracking-wider" style={{ width: '60px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedMembers.map((member) => (
                <tr 
                  key={member.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  onMouseEnter={() => {}}
                >
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
                          {member.name ? getInitials(member.name) : member.email ? getInitials(member.email) : '?'}
                        </div>
                        {/* Status indicator dot */}
                        {member.status === 'ACTIVE' && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900" />
                        )}
                        {member.status === 'INVITED' && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-500 rounded-full border-2 border-gray-900" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium text-white truncate" title={member.name || 'Unknown'}>
                            {member.name || 'Unknown User'}
                          </p>
                          {/* Role badge icons */}
                          {member.role === 'OWNER' && (
                            <Crown size={12} className="text-yellow-400 flex-shrink-0" />
                          )}
                          {member.role === 'ADMIN' && (
                            <Shield size={12} className="text-purple-400 flex-shrink-0" />
                          )}
                          {member.role === 'VIEWER' && (
                            <Eye size={12} className="text-gray-400 flex-shrink-0" />
                          )}
                          {member.userId === currentUserId && (
                            <span className="text-[10px] text-primary font-medium">(You)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      {getRoleIcon(member.role)}
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(member.status)}`}>
                      {getStatusLabel(member.status)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-xs text-secondary">
                    {member.status === 'ACTIVE' && member.joinedAt
                      ? formatDate(member.joinedAt)
                      : member.status === 'INVITED' && member.invitedAt
                      ? formatDate(member.invitedAt)
                      : '-'}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuOpen(actionMenuOpen === member.id ? null : member.id);
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-md transition-all text-secondary hover:text-white opacity-0 group-hover:opacity-100 focus:opacity-100"
                        disabled={!canManageMember(member) && member.status !== 'INVITED'}
                        aria-label="Actions"
                        aria-expanded={actionMenuOpen === member.id}
                      >
                        <MoreVertical size={14} />
                      </button>
                      {actionMenuOpen === member.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full mt-1 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-[100] min-w-[140px] max-w-[200px]"
                        >
                          {(() => {
                            const member = members.find(m => m.id === actionMenuOpen);
                            if (!member) return null;

                            return (
                              <div className="py-1">
                                {member.status === 'ACTIVE' && (
                                  <>
                                    {canChangeRole(member) && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleChangeRole(member);
                                        }}
                                        className="w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-2 focus:outline-none focus:bg-white/10"
                                      >
                                        <Shield size={14} className="text-purple-400" />
                                        <span>Change Role</span>
                                      </button>
                                    )}
                                    {canRemoveMember(member) && (
                                      <>
                                        <div className="my-1 mx-2 h-px bg-white/10" />
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveMember(member);
                                          }}
                                          className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2 focus:outline-none focus:bg-red-500/10"
                                        >
                                          <UserMinus size={14} />
                                          <span>Remove Member</span>
                                        </button>
                                      </>
                                    )}
                                  </>
                                )}

                                {member.status === 'INVITED' && canManageMember(member) && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleResendInvitation(member);
                                      }}
                                      disabled={loadingAction === member.id}
                                      className="w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-2 focus:outline-none focus:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Mail size={14} className="text-blue-400" />
                                      <span>Resend Invitation</span>
                                      {loadingAction === member.id && (
                                        <div className="ml-auto w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      )}
                                    </button>
                                    <div className="my-1 mx-2 h-px bg-white/10" />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteInvitation(member);
                                      }}
                                      className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2 focus:outline-none focus:bg-red-500/10"
                                    >
                                      <Trash2 size={14} />
                                      <span>Delete Invitation</span>
                                    </button>
                                  </>
                                )}

                                {!canManageMember(member) && member.status === 'ACTIVE' && (
                                  <div className="px-3 py-2 text-xs text-secondary">
                                    No actions available
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSortedMembers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-secondary text-sm">
                {searchQuery || filter !== 'all'
                  ? 'No members match your search or filter'
                  : 'No members yet'}
              </p>
            </div>
          )}
        </div>


        {/* Mobile Bottom Sheet */}
        <AnimatePresence>
          {actionMenuOpen && isMobile && (
            <>
              <motion.div
                className="fixed inset-0 z-50 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActionMenuOpen(null)}
              />
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-[100] bg-gray-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-2xl shadow-2xl overflow-hidden"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {(() => {
                  const member = members.find(m => m.id === actionMenuOpen);
                  if (!member) return null;

                  return (
                    <div className="p-4">
                      <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                      <div className="py-1">
                        {member.status === 'ACTIVE' && (
                          <>
                            {canChangeRole(member) && (
                              <button
                                onClick={() => handleChangeRole(member)}
                                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-3 focus:outline-none focus:bg-white/10 rounded-lg"
                              >
                                <Shield size={18} className="text-purple-400" />
                                <span>Change Role</span>
                              </button>
                            )}
                            {canRemoveMember(member) && (
                              <>
                                <div className="my-2 h-px bg-white/10" />
                                <button
                                  onClick={() => handleRemoveMember(member)}
                                  className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3 focus:outline-none focus:bg-red-500/10 rounded-lg"
                                >
                                  <UserMinus size={18} />
                                  <span>Remove Member</span>
                                </button>
                              </>
                            )}
                          </>
                        )}

                        {member.status === 'INVITED' && canManageMember(member) && (
                          <>
                            <button
                              onClick={() => handleResendInvitation(member)}
                              disabled={loadingAction === member.id}
                              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-3 focus:outline-none focus:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                            >
                              <Mail size={18} className="text-blue-400" />
                              <span>Resend Invitation</span>
                              {loadingAction === member.id && (
                                <div className="ml-auto w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              )}
                            </button>
                            <div className="my-2 h-px bg-white/10" />
                            <button
                              onClick={() => handleDeleteInvitation(member)}
                              className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3 focus:outline-none focus:bg-red-500/10 rounded-lg"
                            >
                              <Trash2 size={18} />
                              <span>Delete Invitation</span>
                            </button>
                          </>
                        )}

                        {!canManageMember(member) && member.status === 'ACTIVE' && (
                          <div className="px-4 py-3 text-sm text-secondary">
                            No actions available
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Cards - Mobile */}
        <div className="md:hidden space-y-2">
          {filteredAndSortedMembers.map((member) => (
            <div key={member.id} className="bg-white/5 rounded-md border border-white/10 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
                      {member.name ? getInitials(member.name) : member.email ? getInitials(member.email) : '?'}
                    </div>
                    {/* Status indicator dot */}
                    {member.status === 'ACTIVE' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900" />
                    )}
                    {member.status === 'INVITED' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-500 rounded-full border-2 border-gray-900" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium text-white truncate" title={member.name || 'Unknown'}>
                        {member.name || 'Unknown User'}
                      </p>
                      {/* Role badge icons */}
                      {member.role === 'OWNER' && (
                        <Crown size={12} className="text-yellow-400 flex-shrink-0" />
                      )}
                      {member.role === 'ADMIN' && (
                        <Shield size={12} className="text-purple-400 flex-shrink-0" />
                      )}
                      {member.role === 'VIEWER' && (
                        <Eye size={12} className="text-gray-400 flex-shrink-0" />
                      )}
                      {member.userId === currentUserId && (
                        <span className="text-[10px] text-primary font-medium">(You)</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="relative inline-block">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActionMenuOpen(actionMenuOpen === member.id ? null : member.id);
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-md transition-all text-secondary hover:text-white"
                    disabled={!canManageMember(member) && member.status !== 'INVITED'}
                    aria-label="Actions"
                    aria-expanded={actionMenuOpen === member.id}
                  >
                    <MoreVertical size={14} />
                  </button>
                  {actionMenuOpen === member.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-full mt-1 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-[100] min-w-[140px] max-w-[200px]"
                    >
                      {(() => {
                        const member = members.find(m => m.id === actionMenuOpen);
                        if (!member) return null;

                        return (
                          <div className="py-1">
                            {member.status === 'ACTIVE' && (
                              <>
                                {canChangeRole(member) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleChangeRole(member);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-2 focus:outline-none focus:bg-white/10"
                                  >
                                    <Shield size={14} className="text-purple-400" />
                                    <span>Change Role</span>
                                  </button>
                                )}
                                {canRemoveMember(member) && (
                                  <>
                                    <div className="my-1 mx-2 h-px bg-white/10" />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveMember(member);
                                      }}
                                      className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2 focus:outline-none focus:bg-red-500/10"
                                    >
                                      <UserMinus size={14} />
                                      <span>Remove Member</span>
                                    </button>
                                  </>
                                )}
                              </>
                            )}

                            {member.status === 'INVITED' && canManageMember(member) && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleResendInvitation(member);
                                  }}
                                  disabled={loadingAction === member.id}
                                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-2 focus:outline-none focus:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Mail size={14} className="text-blue-400" />
                                  <span>Resend Invitation</span>
                                  {loadingAction === member.id && (
                                    <div className="ml-auto w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyInviteLink(member);
                                  }}
                                  disabled={loadingAction === member.id}
                                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-2 focus:outline-none focus:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Copy size={14} className="text-green-400" />
                                  <span>Copy Invite Link</span>
                                  {loadingAction === member.id && (
                                    <div className="ml-auto w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  )}
                                </button>
                                <div className="my-1 mx-2 h-px bg-white/10" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteInvitation(member);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2 focus:outline-none focus:bg-red-500/10"
                                >
                                  <Trash2 size={14} />
                                  <span>Delete Invitation</span>
                                </button>
                              </>
                            )}

                            {!canManageMember(member) && member.status === 'ACTIVE' && (
                              <div className="px-3 py-2 text-xs text-secondary">
                                No actions available
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                <div className="flex items-center gap-1.5">
                  {getRoleIcon(member.role)}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(member.status)}`}>
                  {getStatusLabel(member.status)}
                </span>
              </div>

              <p className="text-[10px] text-secondary mt-1.5">
                {member.status === 'ACTIVE' && member.joinedAt
                  ? `Joined ${formatDate(member.joinedAt)}`
                  : member.status === 'INVITED' && member.invitedAt
                  ? `Invited ${formatDate(member.invitedAt)}`
                  : ''}
              </p>
            </div>
          ))}

          {filteredAndSortedMembers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-secondary text-xs">
                {searchQuery || filter !== 'all'
                  ? 'No members match your search or filter'
                  : 'No members yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Change Role Modal */}
      {selectedMember && (
        <ChangeRoleModal
          isOpen={changeRoleModalOpen}
          onClose={() => setChangeRoleModalOpen(false)}
          member={{ email: selectedMember.email || 'Unknown', role: selectedMember.role }}
          currentRole={selectedMember.role}
          onSave={handleRoleChange}
          loading={loading}
        />
      )}

      {/* Remove Member Dialog */}
      {selectedMember && (
        <RemoveMemberDialog
          isOpen={removeDialogOpen}
          onClose={() => setRemoveDialogOpen(false)}
          member={{ email: selectedMember.email || 'Unknown', role: selectedMember.role }}
          onConfirm={handleRemoveConfirm}
          loading={loading}
        />
      )}

      {/* Delete Invitation Dialog */}
      {selectedMember && (
        <DeleteInvitationDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          member={{ email: selectedMember.email || 'Unknown', role: selectedMember.role }}
          onConfirm={handleDeleteInvitationConfirm}
          loading={loading}
        />
      )}
    </>
  );
}
