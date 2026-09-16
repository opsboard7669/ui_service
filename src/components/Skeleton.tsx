import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ className = '', variant = 'rectangular', width, height }: SkeletonProps) {
  const baseStyles = 'bg-white/5 animate-pulse'
  
  const variantStyles = {
    text: 'rounded-md h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{ width, height }}
    />
  )
}

export function CardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-4 space-y-3"
    >
      <Skeleton variant="rectangular" height={24} width="60%" className="mb-2" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="rectangular" height={32} width="100%" />
      </div>
    </motion.div>
  )
}

export function ProjectCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-4 space-y-3"
    >
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="text" />
      <Skeleton variant="text" width="60%" />
      <div className="flex gap-2 pt-3">
        <Skeleton variant="rectangular" height={28} width={80} />
        <Skeleton variant="rectangular" height={28} width={80} />
      </div>
    </motion.div>
  )
}

export function MemberRowSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-4 p-3 border-b border-white/5"
    >
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="60%" />
      </div>
      <Skeleton variant="rectangular" height={28} width={100} />
    </motion.div>
  )
}

export function DashboardWidgetSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-4 space-y-3"
    >
      <Skeleton variant="text" width="40%" className="mb-4" />
      <Skeleton variant="rectangular" height={120} />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="30%" />
      </div>
    </motion.div>
  )
}

export function TaskDetailSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="30%" height={28} />
        <div className="flex gap-2">
          <Skeleton variant="rectangular" height={36} width={36} />
          <Skeleton variant="rectangular" height={36} width={36} />
        </div>
      </div>
      
      <Skeleton variant="rectangular" height={200} />
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="rectangular" height={40} />
        </div>
        <div className="space-y-2">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="rectangular" height={40} />
        </div>
      </div>
      
      <div className="space-y-2">
        <Skeleton variant="text" width="20%" />
        <Skeleton variant="rectangular" height={80} />
      </div>
    </motion.div>
  )
}

export function KanbanColumnSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass p-2 space-y-2 min-w-[240px]"
    >
      <div className="flex items-center justify-between mb-3 p-2">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="circular" width={24} height={24} />
      </div>
      {[1, 2, 3].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </motion.div>
  )
}
