import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Building2, Crown, AlertCircle, Clock, XCircle, CheckCircle, LogOut } from 'lucide-react';
import { workspaceApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

type InvitationState = 'loading' | 'valid' | 'expired' | 'invalid' | 'email_mismatch' | 'success';

interface InvitationDetails {
  workspaceName: string;
  organizationName: string;
  invitedEmail: string;
  role: string;
  expiresAt: string;
}

export default function InvitationAcceptance() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [state, setState] = useState<InvitationState>('loading');
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const checkForRedirectToken = () => {
      const redirectToken = localStorage.getItem('invitationToken');
      if (redirectToken) {
        localStorage.removeItem('invitationToken');
        // User just logged in, auto-accept the invitation
        handleAcceptInvitation(redirectToken);
      } else {
        // Normal flow, validate the token
        validateToken();
      }
    };

    if (token) {
      checkForRedirectToken();
    }
  }, [token]);

  const validateToken = async () => {
    if (!token) return;

    try {
      const response = await workspaceApi.validateInvitation(token);
      setInvitation(response.data.data);
      setState('valid');
    } catch (error: any) {
      if (error.response?.status === 410) {
        setState('expired');
      } else if (error.response?.status === 404) {
        setState('invalid');
      } else {
        console.error('Failed to validate invitation:', error);
        setState('invalid');
      }
    }
  };

  const handleJoinWorkspace = () => {
    if (!isAuthenticated) {
      // Save token for auto-accept after login
      localStorage.setItem('invitationToken', token || '');
      navigate('/login');
    } else {
      handleAcceptInvitation(token || '');
    }
  };

  const handleAcceptInvitation = async (tokenToUse: string) => {
    setAccepting(true);
    try {
      await workspaceApi.acceptInvitation(tokenToUse);

      // Clear any cached workspace data to force refresh
      localStorage.removeItem('currentWorkspaceId');
      
      setState('success');

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      if (error.response?.status === 403) {
        setState('email_mismatch');
      } else if (error.response?.status === 410) {
        setState('expired');
      } else {
        toast.error('Failed to accept invitation');
        setAccepting(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-secondary">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (state === 'invalid') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="glass-card card-hover max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invitation Not Found</h1>
          <p className="text-secondary mb-6">
            This invitation link is invalid or has been cancelled.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="gradient-btn px-6 py-3 text-sm"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (state === 'expired') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="glass-card card-hover max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invitation Expired</h1>
          <p className="text-secondary mb-6">
            This invitation has expired. Please contact the workspace owner for a new invitation.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="gradient-btn px-6 py-3 text-sm"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (state === 'email_mismatch') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="glass-card card-hover max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Account Mismatch</h1>
          <p className="text-secondary mb-4">
            This invitation belongs to another account.
          </p>
          <p className="text-sm text-secondary mb-6">
            Invited email: <span className="text-white font-medium">{invitation?.invitedEmail}</span>
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleLogout}
              className="px-4 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-all text-sm flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
            <button
              onClick={() => navigate('/login')}
              className="gradient-btn px-4 py-3 text-sm"
            >
              Login with Another Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="glass-card card-hover max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome!</h1>
          <p className="text-secondary mb-2">
            Successfully joined
          </p>
          <p className="text-lg font-semibold text-white mb-6">
            {invitation?.workspaceName}
          </p>
          <p className="text-sm text-secondary">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="glass-card card-hover max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            You're invited to join
          </h1>
          <p className="text-secondary">
            {invitation?.workspaceName}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-secondary uppercase tracking-wider mb-1">Organization</p>
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-primary" />
              <span className="text-white font-medium">{invitation?.organizationName}</span>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-secondary uppercase tracking-wider mb-1">Invited as</p>
            <div className="flex items-center gap-2">
              <Crown size={18} className="text-yellow-400" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(invitation?.role || 'MEMBER')}`}>
                {invitation?.role}
              </span>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-secondary uppercase tracking-wider mb-1">Invited Email</p>
            <p className="text-white font-medium">{invitation?.invitedEmail}</p>
          </div>

          {invitation?.expiresAt && (
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-secondary uppercase tracking-wider mb-1">Expires</p>
              <p className="text-white text-sm">
                {new Date(invitation.expiresAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {isAuthenticated && user?.email && user.email.toLowerCase() !== invitation?.invitedEmail.toLowerCase() && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-300 text-sm text-center">
              This invitation is for a different email address.
            </p>
          </div>
        )}

        <button
          onClick={handleJoinWorkspace}
          disabled={accepting}
          className="w-full gradient-btn py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {accepting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Joining...
            </>
          ) : (
            <>
              <Building2 size={18} />
              Join Workspace
            </>
          )}
        </button>

        {!isAuthenticated && (
          <p className="text-center text-xs text-secondary mt-4">
            You'll need to sign in or create an account to join
          </p>
        )}
      </div>
    </div>
  );
}
