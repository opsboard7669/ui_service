import { useState, useEffect, useRef } from 'react';
import { X, Check, X as XIcon, Bell, Sparkles, User } from 'lucide-react';
import { notificationApi } from '../lib/api';
import { formatDate } from '../lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

type NotificationType = 'invitation' | 'task_assigned' | 'comment_mention' | 'task_due' | 'project_update' | 'workspace_announcement';

interface BaseNotification {
  id: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
}

interface InvitationNotification extends BaseNotification {
  type: 'invitation';
  invitationId: string;
  workspaceId: string;
  workspaceName: string;
  invitedBy: string;
  invitedByFullName?: string;
  role: string;
  projectId: string | null;
  projectName: string | null;
}

interface TaskAssignedNotification extends BaseNotification {
  type: 'task_assigned';
  taskId: string;
  taskTitle: string;
  assignedBy: string;
  assignedByFullName?: string;
  workspaceName: string;
  projectName?: string;
}

interface CommentMentionNotification extends BaseNotification {
  type: 'comment_mention';
  taskId: string;
  taskTitle: string;
  commentBy: string;
  commentByFullName?: string;
  commentText: string;
  workspaceName: string;
}

interface TaskDueNotification extends BaseNotification {
  type: 'task_due';
  taskId: string;
  taskTitle: string;
  dueDate: string;
  workspaceName: string;
  projectName?: string;
}

interface ProjectUpdateNotification extends BaseNotification {
  type: 'project_update';
  projectId: string;
  projectName: string;
  updateType: 'created' | 'archived' | 'updated';
  updatedBy: string;
  updatedByFullName?: string;
  workspaceName: string;
}

interface WorkspaceAnnouncementNotification extends BaseNotification {
  type: 'workspace_announcement';
  workspaceId: string;
  workspaceName: string;
  announcement: string;
  announcedBy: string;
  announcedByFullName?: string;
}

type Notification = 
  | InvitationNotification 
  | TaskAssignedNotification 
  | CommentMentionNotification 
  | TaskDueNotification 
  | ProjectUpdateNotification 
  | WorkspaceAnnouncementNotification;

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

export default function NotificationDropdown({ isOpen, onClose, onCountChange }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Always fetch fresh data when dropdown opens
      fetchNotifications();
    }
  }, [isOpen]);

  // Notify parent component when count changes
  useEffect(() => {
    if (onCountChange) {
      onCountChange(notifications.filter(n => !n.read).length);
    }
  }, [notifications.length, onCountChange]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getInvitations();
      if (response.data.success) {
        // Transform API response to Notification type
        // Only show invitations with status INVITED
        const transformedNotifications: Notification[] = response.data.data
          .filter((item: any) => item.status === 'INVITED')
          .map((item: any) => ({
            id: item.invitationId,
            type: 'invitation' as NotificationType,
            invitationId: item.invitationId,
            workspaceId: item.workspaceId,
            workspaceName: item.workspaceName,
            invitedBy: item.invitedBy,
            invitedByFullName: item.invitedByFullName,
            role: item.role,
            createdAt: item.createdAt,
            read: false,
            status: item.status,
            projectId: item.projectId,
            projectName: item.projectName,
          }));
        setNotifications(transformedNotifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (notificationId: string) => {
    try {
      setAcceptingId(notificationId);
      await notificationApi.acceptInvitation(notificationId);
      toast.success('Invitation accepted successfully');
      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers'] });
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      toast.error('Failed to accept invitation');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDecline = async (notificationId: string) => {
    try {
      setDecliningId(notificationId);
      await notificationApi.declineInvitation(notificationId);
      toast.success('Invitation declined');
      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    } catch (error) {
      console.error('Failed to decline invitation:', error);
      toast.error('Failed to decline invitation');
    } finally {
      setDecliningId(null);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  const pendingCount = notifications.filter(n => !n.read).length;

  const renderNotificationCard = (notification: Notification) => {
    if (notification.type === 'invitation') {
      return renderInvitationCard(notification);
    }
    // Add other notification type renderers here
    return null;
  };

  const renderInvitationCard = (notification: InvitationNotification) => {
    const initials = getInitials(notification.invitedByFullName || notification.invitedBy);
    const relativeTime = getRelativeTime(notification.createdAt);
    
    return (
      <div className="notification-card">
        {/* Top Row: Avatar, Name, Role, Time */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-lg">
              {initials}
            </div>
            <div>
              <p className="text-base font-bold text-white leading-tight">
                {notification.invitedByFullName || notification.invitedBy}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">{notification.role}</p>
            </div>
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{relativeTime}</span>
        </div>

        {/* Message */}
        <div className="mb-4">
          <p className="text-sm text-gray-300">
            invited you to join{' '}
            <span className="text-base font-semibold text-primary">{notification.workspaceName}</span>
          </p>
          {notification.projectName && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500">Project</span>
              <span className="text-sm text-gray-300">{notification.projectName}</span>
            </div>
          )}
        </div>

        {/* Role Badge */}
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{
              background: 'var(--color-glass-card-base)',
              color: 'var(--color-text-secondary)',
              borderColor: 'var(--color-border-primary)',
            }}
          >
            <User size={12} />
            {notification.role}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            disabled={acceptingId === notification.id}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
            style={{
              background: 'var(--color-primary-500)',
              color: 'var(--color-bg-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-primary-400)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-primary-500)';
            }}
            onClick={() => handleAccept(notification.id)}
          >
            {acceptingId === notification.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark-bg"></div>
            ) : (
              <>
                <Check size={14} />
                Accept
              </>
            )}
          </button>
          <button
            disabled={decliningId === notification.id}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
            style={{
              background: 'transparent',
              color: 'var(--color-error)',
              borderColor: 'var(--color-border-error)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--color-border-error)';
            }}
            onClick={() => handleDecline(notification.id)}
          >
            {decliningId === notification.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
            ) : (
              <>
                <XIcon size={14} />
                Decline
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop/Tablet Dropdown */}
      <div
        ref={dropdownRef}
        className={`hidden md:block absolute right-0 top-full mt-2 w-[380px] max-h-[500px] notification-panel notification-panel-tablet z-50 transition-all duration-220 ease-out lg:w-[380px] md:w-[340px] ${
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
        }`}
        style={{
          animation: isAnimating ? 'slideDown 220ms ease-out forwards' : 'none',
          background: 'var(--color-glass-card-base)',
          backdropFilter: 'blur(var(--blur-md))',
          border: '1px solid var(--color-border-primary)',
        }}
      >
      {/* Header */}
      <div className="notification-header px-5 py-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-white" />
            <h3 className="text-base font-semibold text-white">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        {pendingCount > 0 ? (
          <p className="text-xs text-gray-400 ml-7">{pendingCount} Pending Invitation{pendingCount > 1 ? 's' : ''}</p>
        ) : (
          <p className="text-xs text-gray-400 ml-7">You're all caught up</p>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span>Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <Sparkles size={40} className="text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white mb-1">You're all caught up!</p>
              <p className="text-sm text-gray-400">No pending notifications</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id}>
                {renderNotificationCard(notification)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    
    {/* Mobile Drawer */}
    <div
      className={`md:hidden fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 notification-panel notification-panel-mobile max-h-[70vh] overflow-hidden transition-all duration-220 ease-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          animation: isAnimating ? 'slideUp 220ms ease-out forwards' : 'none',
          background: 'var(--color-glass-card-base)',
          backdropFilter: 'blur(var(--blur-md))',
          border: '1px solid var(--color-border-primary)',
        }}
      >
        {/* Header */}
        <div className="notification-header px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-white" />
            <h3 className="text-base font-semibold text-white">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        {pendingCount > 0 ? (
          <p className="text-xs text-gray-400 px-5 pb-2">{pendingCount} Pending Invitation{pendingCount > 1 ? 's' : ''}</p>
        ) : (
          <p className="text-xs text-gray-400 px-5 pb-2">You're all caught up</p>
        )}

        {/* Content */}
        <div className="max-h-[calc(70vh-120px)] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span>Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                <Sparkles size={40} className="text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white mb-1">You're all caught up!</p>
                <p className="text-sm text-gray-400">No pending notifications</p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id}>
                  {renderNotificationCard(notification)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
