import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'outline'
  }
  children?: ReactNode
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  children 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {Icon && (
        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
          <Icon size={40} className="text-secondary" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-secondary text-sm max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
            action.variant === 'outline'
              ? 'border border-white/10 text-white hover:bg-white/5 hover:border-white/20'
              : 'bg-gradient-to-r from-green-400 to-green-500 text-black hover:from-green-300 hover:to-green-400'
          }`}
        >
          {action.label}
        </button>
      )}
      
      {children && (
        <div className="mt-6">
          {children}
        </div>
      )}
    </motion.div>
  )
}
