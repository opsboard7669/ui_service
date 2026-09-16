import { useState, useRef, useEffect, KeyboardEvent } from 'react' 
import { ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

interface DropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  size = 'md'
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape as any)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape as any)
    }
  }, [])

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(!isOpen)
    }
  }

  const handleOptionKeyDown = (e: KeyboardEvent<HTMLButtonElement>, optionValue: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onChange(optionValue)
      setIsOpen(false)
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm'
  }

  const buttonClassName = `flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200 w-full ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/20 cursor-pointer'}`

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={buttonClassName}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={selectedOption ? 'text-white' : 'text-secondary/60'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={size === 'sm' ? 14 : 16}
          className={`text-secondary transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-1 z-50"
          >
            <div className="bg-[#0f0f14] backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl">
              <div className="py-1" role="listbox">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                    }}
                    onKeyDown={(e) => handleOptionKeyDown(e, option.value)}
                    disabled={option.disabled}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
                      option.disabled 
                        ? 'text-secondary/40 cursor-not-allowed' 
                        : 'text-secondary hover:text-white hover:bg-white/5 cursor-pointer'
                    } ${
                      value === option.value ? 'bg-white/8 text-white' : ''
                    }`}
                    role="option"
                    aria-selected={value === option.value}
                  >
                    <span>{option.label}</span>
                    {value === option.value && (
                      <Check size={14} className="text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

