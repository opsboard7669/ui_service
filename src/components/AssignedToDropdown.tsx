import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, User, Loader2, AlertCircle, Shield, Crown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { workspaceApi } from '../lib/api'
import { useWorkspace } from '../contexts/WorkspaceContext'
import { cn, getInitials } from '../lib/utils'

interface Member {
  id: string
  userId: string | null
  email: string | null
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  status: 'INVITED' | 'ACTIVE' | 'REMOVED'
}

interface AssignedToDropdownProps {
  value: string | null
  onChange: (value: string | null) => void
}

export default function AssignedToDropdown({ value, onChange }: AssignedToDropdownProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentWorkspace } = useWorkspace()

  const { data: membersData, isLoading, error } = useQuery({
    queryKey: ['workspaceMembers', currentWorkspace?._id],
    queryFn: async () => {
      if (!currentWorkspace?._id) return { activeMembers: [] }
      const response = await workspaceApi.getMembers(currentWorkspace._id)
      return response.data?.data || { activeMembers: [] }
    },
    enabled: !!currentWorkspace?._id,
  })

  const activeMembers = membersData?.activeMembers?.filter(
    (m: Member) => m.status === 'ACTIVE'
  ) || []

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedMember = activeMembers.find((m: Member) => m.userId === value)

  const filteredMembers = activeMembers.filter((m: Member) => {
    const searchLower = search.toLowerCase()
    return (
      m.email?.toLowerCase().includes(searchLower) ||
      m.userId?.toLowerCase().includes(searchLower)
    )
  })

  const handleSelect = (memberId: string | null) => {
    onChange(memberId)
    setOpen(false)
    setSearch('')
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return Crown
      case 'ADMIN':
        return Shield
      default:
        return User
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'text-yellow-400'
      case 'ADMIN':
        return 'text-purple-400'
      case 'MEMBER':
        return 'text-blue-400'
      case 'VIEWER':
        return 'text-gray-400'
      default:
        return 'text-secondary'
    }
  }

  if (error) {
    return (
      <div className="relative">
        <button
          type="button"
          disabled
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-secondary text-xs flex items-center justify-between cursor-not-allowed opacity-50"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={14} />
            <span>Unable to load workspace members</span>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !isLoading && setOpen(!open)}
        disabled={isLoading}
        className={cn(
          "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs flex items-center justify-between transition-colors",
          isLoading ? "cursor-not-allowed opacity-50" : "hover:bg-white/10 cursor-pointer"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin text-secondary" />
              <span className="text-secondary">Loading members...</span>
            </>
          ) : selectedMember ? (
            <>
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-medium text-primary">
                  {getInitials(selectedMember.email || selectedMember.userId || 'U')}
                </span>
              </div>
              <span className="truncate">{selectedMember.email || selectedMember.userId}</span>
            </>
          ) : (
            <>
              <User size={14} className="text-secondary" />
              <span className="text-secondary">Unassigned</span>
            </>
          )}
        </div>
        {!isLoading && <ChevronDown size={14} className={cn('text-secondary transition-transform duration-200', open && 'rotate-180')} />}
      </button>

      <AnimatePresence>
        {open && !isLoading && (
          <motion.div
            className="absolute z-[9999] w-full mt-1 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-white/10 sticky top-0 bg-gray-900/95 backdrop-blur-xl">
              <input
                type="text"
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs placeholder-secondary/50 focus:outline-none focus:border-primary/50"
                autoFocus
              />
            </div>

            {/* Unassigned Option */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                'w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/10 transition-colors',
                !value && 'bg-white/10'
              )}
            >
              <User size={14} className="text-secondary" />
              <span className="text-secondary">Unassigned</span>
            </button>

            {/* Member Options */}
            {filteredMembers.map((member: Member) => {
              const RoleIcon = getRoleIcon(member.role)
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleSelect(member.userId)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/10 transition-colors',
                    value === member.userId && 'bg-white/10'
                  )}
                >
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-medium text-primary">
                      {getInitials(member.email || member.userId || 'U')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{member.email || member.userId}</div>
                  </div>
                  <RoleIcon size={12} className={cn('flex-shrink-0', getRoleColor(member.role))} />
                </button>
              )
            })}

            {filteredMembers.length === 0 && search && (
              <div className="px-3 py-4 text-center text-secondary text-xs">
                No members found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
