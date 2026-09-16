import { motion, AnimatePresence } from 'framer-motion';
import { UserMinus, Loader2 } from 'lucide-react';

interface RemoveMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: { email: string; role: string };
  onConfirm: () => void;
  loading: boolean;
}

export default function RemoveMemberDialog({
  isOpen,
  onClose,
  member,
  onConfirm,
  loading,
}: RemoveMemberDialogProps) {
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
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <UserMinus size={16} className="text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Remove Member</h2>
                <p className="text-xs text-secondary">This action cannot be undone</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-white text-sm">
                Are you sure you want to remove <span className="font-semibold">{member.email}</span> from this workspace?
              </p>
              <p className="text-xs text-secondary">
                This member will immediately lose access to this workspace.
                They can be invited again later.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-3 py-1.5 border border-white/10 rounded-md text-white hover:bg-white/5 transition-colors disabled:opacity-50 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 text-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Removing...
                    </>
                  ) : (
                    'Remove Member'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
