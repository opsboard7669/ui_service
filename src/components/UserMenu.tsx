import { useState, useRef, useEffect } from 'react'
import { User, Settings, Building2, Palette, LogOut, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getInitials } from '../lib/utils'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

interface UserMenuProps {
  username: string
  name: string
}

export default function UserMenu({ username, name }: UserMenuProps) {
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      const isClickInsideTrigger = triggerRef.current?.contains(target)
      const isClickInsideDropdown = dropdownRef.current?.contains(target)
      
      if (!isClickInsideTrigger && !isClickInsideDropdown) {
        setOpen(false)
      }
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      })
    }
  }, [open])

  const handleLogout = () => {
    logout()
    toast.success('Logging out...', { icon: '👋' })
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="user-menu-wrapper">
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all group"
        style={{ background: 'transparent' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)' }
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent' }
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">{getInitials(name || username)}</span>
        </div>
        <span className="hidden md:block text-sm text-white font-medium">{username}</span>
        <ChevronDown
          size={14}
          className={`text-secondary transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={dropdownRef}
            className="user-dropdown-menu"
            style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
            }}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="px-3 py-2 mb-1">
              <p className="text-xs text-secondary font-medium">{name || username}</p>
              <p className="text-[10px] text-secondary/70">{username}</p>
            </div>
            <div className="border-t border-white/10 my-1" />
            <button
              type="button"
              className="user-dropdown-item"
              onClick={() => {
                setOpen(false)
                toast('Profile page coming soon', { icon: '👤' })
              }}
            >
              <User size={14} />
              Profile
            </button>
            <button
              type="button"
              className="user-dropdown-item"
              onClick={() => {
                setOpen(false)
                toast('Workspace settings coming soon', { icon: '🏢' })
              }}
            >
              <Building2 size={14} />
              Workspace
            </button>
            <button
              type="button"
              className="user-dropdown-item"
              onClick={() => {
                setOpen(false)
                toast('Preferences coming soon', { icon: '⚙️' })
              }}
            >
              <Settings size={14} />
              Preferences
            </button>
            <button
              type="button"
              className="user-dropdown-item"
              onClick={() => {
                setOpen(false)
                toast('Theme selection coming soon', { icon: '🎨' })
              }}
            >
              <Palette size={14} />
              Theme
            </button>
            <div className="border-t border-white/10 my-1" />
            <button
              type="button"
              className="user-dropdown-item text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

