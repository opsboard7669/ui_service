import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Building2, FolderKanban, User, Calendar, Check, X, Clock, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../lib/api';
import toast from 'react-hot-toast';

interface Invitation {
  _id: string;
  workspaceId: {
    _id: string;
    name: string;
  };
  projectId?: {
    _id: string;
    name: string;
  };
  role: string;
  invitedBy: string;
  invitedAt: string;
  status: string;
}

export default function Invitations() {
  const queryClient = useQueryClient();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);

  const { data: invitations, isLoading, error } = useQuery({
    queryKey: ['invitations'],
    queryFn: () => notificationApi.getInvitations(),
    refetchOnWindowFocus: true,
  });

  const acceptMutation = useMutation({
    mutationFn: (invitationId: string) => notificationApi.acceptInvitation(invitationId),
    onSuccess: () => {
      toast.success('Invitation accepted successfully');
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers'] });
    },
    onError: (error: any) => {
      console.error('Failed to accept invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to accept invitation');
    },
    onSettled: () => {
      setAcceptingId(null);
    },
  });

  const declineMutation = useMutation({
    mutationFn: (invitationId: string) => notificationApi.declineInvitation(invitationId),
    onSuccess: () => {
      toast.success('Invitation declined');
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: any) => {
      console.error('Failed to decline invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to decline invitation');
    },
    onSettled: () => {
      setDecliningId(null);
    },
  });

  const handleAccept = (invitationId: string) => {
    setAcceptingId(invitationId);
    acceptMutation.mutate(invitationId);
  };

  const handleDecline = (invitationId: string) => {
    setDecliningId(invitationId);
    declineMutation.mutate(invitationId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle size={48} className="text-red-400" />
        <p className="text-secondary text-sm">Failed to load invitations</p>
      </div>
    );
  }

  const pendingInvitations = invitations?.data?.filter((inv: Invitation) => inv.status === 'INVITED') || [];
  const hasInvitations = pendingInvitations.length > 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Invitations</h1>
        <p className="text-secondary text-sm">
          Manage your workspace and project invitations
        </p>
      </div>

      {!hasInvitations ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <User size={32} className="text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">No Pending Invitations</h3>
              <p className="text-secondary text-sm">
                You don't have any pending invitations at the moment.
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {pendingInvitations.map((invitation: Invitation) => (
              <motion.div
                key={invitation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Workspace Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Building2 size={20} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-white truncate">
                          {invitation.workspaceId?.name || 'Unknown Workspace'}
                        </h3>
                        <p className="text-secondary text-xs">
                          Role: <span className="text-white font-medium">{invitation.role}</span>
                        </p>
                      </div>
                    </div>

                    {/* Project Info (if applicable) */}
                    {invitation.projectId && (
                      <div className="flex items-center gap-2 mb-3 pl-12">
                        <FolderKanban size={14} className="text-primary" />
                        <span className="text-sm text-white">
                          {invitation.projectId.name}
                        </span>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 pl-12 text-xs text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{formatDate(invitation.invitedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>Pending</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleDecline(invitation._id)}
                      disabled={decliningId === invitation._id || acceptingId === invitation._id}
                      className="px-3 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {decliningId === invitation._id ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Declining...
                        </>
                      ) : (
                        <>
                          <X size={12} />
                          Decline
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAccept(invitation._id)}
                      disabled={acceptingId === invitation._id || decliningId === invitation._id}
                      className="px-3 py-2 rounded-lg gradient-btn text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1.5"
                    >
                      {acceptingId === invitation._id ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <Check size={12} />
                          Accept
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
