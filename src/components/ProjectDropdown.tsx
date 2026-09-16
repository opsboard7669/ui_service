import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, FolderKanban, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { projectApi } from '../lib/api'
import { useWorkspace } from '../contexts/WorkspaceContext'
import { cn } from '../lib/utils'

interface Project {
  _id: string
  name: string
  icon: string
  color: string
}

interface ProjectDropdownProps {
  value: string | null
  onChange: (value: string | null) => void
  preselectedProjectId?: string | null
}

export default function ProjectDropdown({ value, onChange, preselectedProjectId }: ProjectDropdownProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentWorkspace } = useWorkspace()

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects', currentWorkspace?._id],
    queryFn: async () => {
      if (!currentWorkspace?._id) return []
      const response = await projectApi.getAll({ workspaceId: currentWorkspace._id })
      return response.data?.data || []
    },
    enabled: !!currentWorkspace?._id,
  })

  // Set preselected project if provided
  useEffect(() => {
    if (preselectedProjectId && !value) {
      onChange(preselectedProjectId)
    }
  }, [preselectedProjectId, value, onChange])

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

  const selectedProject = projects.find((p: Project) => p._id === value)

  const filteredProjects = projects.filter((p: Project) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (projectId: string | null) => {
    onChange(projectId)
    setOpen(false)
    setSearch('')
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
            <span>Unable to load projects</span>
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
              <span className="text-secondary">Loading projects...</span>
            </>
          ) : selectedProject ? (
            <>
              <div
                className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${selectedProject.color}20` }}
              >
                <FolderKanban size={12} style={{ color: selectedProject.color }} />
              </div>
              <span className="truncate">{selectedProject.name}</span>
            </>
          ) : (
            <>
              <FolderKanban size={14} className="text-secondary" />
              <span className="text-secondary">No Project</span>
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
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs placeholder-secondary/50 focus:outline-none focus:border-primary/50"
                autoFocus
              />
            </div>

            {/* No Project Option */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                'w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/10 transition-colors',
                !value && 'bg-white/10'
              )}
            >
              <FolderKanban size={14} className="text-secondary" />
              <span className="text-secondary">No Project</span>
            </button>

            {/* Project Options */}
            {filteredProjects.map((project: Project) => (
              <button
                key={project._id}
                type="button"
                onClick={() => handleSelect(project._id)}
                className={cn(
                  'w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/10 transition-colors',
                  value === project._id && 'bg-white/10'
                )}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${project.color}20` }}
                >
                  <FolderKanban size={12} style={{ color: project.color }} />
                </div>
                <span className="truncate">{project.name}</span>
              </button>
            ))}

            {filteredProjects.length === 0 && search && (
              <div className="px-3 py-4 text-center text-secondary text-xs">
                No projects found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
