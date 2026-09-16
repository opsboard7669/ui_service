import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter') {
      handleConfirm()
    }
  }

  const variantStyles = {
    danger: {
      icon: 'text-red-500',
      iconBg: 'bg-red-500/10',
      btnBg: 'bg-red-500 hover:bg-red-600',
      btnText: 'text-white'
    },
    warning: {
      icon: 'text-yellow-500',
      iconBg: 'bg-yellow-500/10',
      btnBg: 'bg-yellow-500 hover:bg-yellow-600',
      btnText: 'text-white'
    },
    info: {
      icon: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
      btnBg: 'bg-blue-500 hover:bg-blue-600',
      btnText: 'text-white'
    }
  }

  const styles = variantStyles[variant]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            transition={{ duration: 0.2 }}
          />
          
          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl p-6"
              onKeyDown={handleKeyDown}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors text-secondary hover:text-white"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
                <AlertTriangle size={24} className={styles.icon} />
              </div>

              {/* Title */}
              <h2 id="dialog-title" className="text-lg font-semibold text-white mb-2">
                {title}
              </h2>

              {/* Message */}
              <p className="text-secondary text-sm mb-6 leading-relaxed">
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-all duration-200"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded-xl ${styles.btnBg} ${styles.btnText} text-sm font-medium transition-all duration-200`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
