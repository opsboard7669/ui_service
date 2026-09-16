import { motion } from 'framer-motion'

interface ProgressBarProps {
  label: string
  value: number
  max: number
  color?: string
  resetKey?: string | number
  delay?: number
}

export default function ProgressBar({
  label,
  value,
  max,
  color = '#4f46e5',
  resetKey = 0,
  delay = 0,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-secondary">{label}</span>
        <span className="text-white font-medium">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          key={resetKey}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: `${percentage}%`, opacity: 1 }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
