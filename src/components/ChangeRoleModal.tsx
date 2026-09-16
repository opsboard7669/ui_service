import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Eye } from 'lucide-react';
import { useState } from 'react';
import { PrimaryButton } from './Button';

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: { email: string; role: string };
  currentRole: string;
  onSave: (newRole: string) => void;
  loading: boolean;
}

const ROLES = [
  { value: 'ADMIN', label: 'Admin', icon: Shield, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  { value: 'MEMBER', label: 'Member', icon: User, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { value: 'VIEWER', label: 'Viewer', icon: Eye, color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
];

export default function ChangeRoleModal({
  isOpen,
  onClose,
  member,
  currentRole,
  onSave,
  loading,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);

  const handleSave = () => {
    if (selectedRole && selectedRole !== currentRole) {
      onSave(selectedRole);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative bg-gray-900 border border-white/10 rounded-lg p-4 w-full max-w-sm shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Shield size={16} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Change Member Role</h2>
                <p className="text-xs text-secondary">Update {member.email}'s role</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white mb-2">Select Role</label>
                <div className="space-y-2">
                  {ROLES.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setSelectedRole(role.value)}
                        className={`w-full px-3 py-2.5 rounded-md border transition-all flex items-center gap-2 text-left ${
                          selectedRole === role.value
                            ? 'bg-white/10 border-white/20'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <Icon size={16} className={role.color} />
                        <span className="text-xs font-medium text-white">{role.label}</span>
                        {selectedRole === role.value && (
                          <div className="ml-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-black" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-3 py-1.5 border border-white/10 rounded-md text-white hover:bg-white/5 transition-colors disabled:opacity-50 text-xs"
                >
                  Cancel
                </button>
                <PrimaryButton
                  onClick={handleSave}
                  disabled={loading || selectedRole === currentRole}
                  loading={loading}
                  className="flex-1 px-3 py-1.5 text-xs"
                >
                  Save Changes
                </PrimaryButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
