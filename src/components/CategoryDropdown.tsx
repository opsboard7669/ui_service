import { useState, useRef, useEffect, type CSSProperties } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CATEGORY_OPTIONS } from '../lib/utils'
import { cn } from '../lib/utils'

interface CategoryDropdownProps {
  value: string | null
  onChange: (value: string | null) => void
}

export default function CategoryDropdown({ value, onChange }: CategoryDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = CATEGORY_OPTIONS.find((opt) =>
    value === null ? opt.value === 'all' : opt.value === value
  ) ?? CATEGORY_OPTIONS[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optValue: string) => {
    onChange(optValue === 'all' ? null : optValue)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="category-dropdown-trigger"
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: selected.color }}
        />
        <span className="text-white font-medium">{selected.label}</span>
        <ChevronDown
          size={16}
          className={cn('text-secondary transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="category-dropdown-menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  'category-dropdown-item',
                  (value === null ? opt.value === 'all' : opt.value === value) && 'category-dropdown-item-active'
                )}
                style={{ '--cat-color': opt.color } as CSSProperties}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: opt.color }}
                />
                <span>{opt.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
