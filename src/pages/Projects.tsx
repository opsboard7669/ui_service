import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi, taskApi, workspaceApi } from '../lib/api'
import { useWorkspace } from '../contexts/WorkspaceContext'
import { useAuth } from '../contexts/AuthContext'
import { ProjectProvider, useProject } from '../contexts/ProjectContext'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import {
  FolderKanban,
  Plus,
  Search,
  MoreVertical,
  Archive,
  ArchiveRestore,
  Trash2,
  Edit,
  Users,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  LayoutGrid,
  ListTodo,
  Activity,
  Settings,
  Briefcase,
  Rocket,
  Star,
  Target,
  Zap,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import AnimatedCounter from '../components/AnimatedCounter'
import { getRelativeTime } from '../lib/utils'
import CreateTaskModal from '../components/CreateTaskModal'
import Dropdown from '../components/Dropdown'
import InviteMemberModal from '../components/InviteMemberModal'
import ChangeRoleModal from '../components/ChangeRoleModal'
import RemoveMemberDialog from '../components/RemoveMemberDialog'
import ActionMenu, { type ActionMenuItem } from '../components/ActionMenu'

interface Project {
  _id: string
  name: string
  slug?: string
  description: string
  icon: string
  color: string
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Archived'
  taskCount: number
  memberCount?: number
  createdAt: string
  updatedAt: string
}

type FilterType = 'ALL' | 'ACTIVE' | 'ARCHIVED'
type SortType = 'newest' | 'oldest' | 'updated' | 'alphabetical'

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ARCHIVED', label: 'Archived' },
]

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'alphabetical', label: 'Alphabetical' },
]

// Helper function to get icon component by icon identifier
function getIconComponent(iconId: string) {
  const iconMap: Record<string, any> = {
    folder: FolderKanban,
    briefcase: Briefcase,
    rocket: Rocket,
    star: Star,
    target: Target,
    zap: Zap,
  }
  return iconMap[iconId] || FolderKanban
}

export default function Projects() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { currentWorkspace } = useWorkspace()

const [filter, setFilter] = useState<FilterType>('ACTIVE');
   const [sort, setSort] = useState<SortType>('newest')
   const [search, setSearch] = useState('')
   const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
   const [selectedProject, setSelectedProject] = useState<Project | null>(null)
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
   const [viewMode, setViewMode] = useState<'projects' | 'tasks'>('projects')

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', currentWorkspace?._id, filter, search],
    queryFn: async () => {
      if (!currentWorkspace?._id) return []
      const response = await projectApi.getAll({
        status: filter === 'ALL' ? undefined : filter === 'ACTIVE' ? 'Active' : filter === 'ARCHIVED' ? 'Archived' : filter,
        search: search || undefined,
      })
      return response.data?.data || []
    },
    enabled: !!currentWorkspace?._id && viewMode === 'projects',
  })

  // Fetch all projects (for statistics calculation)
  const { data: allProjects = [] } = useQuery({
    queryKey: ['allProjects', currentWorkspace?._id],
    queryFn: async () => {
      if (!currentWorkspace?._id) return []
      const response = await projectApi.getAll({})
      return response.data?.data || []
    },
    enabled: !!currentWorkspace?._id,
  })

  // Calculate statistics from actual projects data
  const statistics = {
    totalProjects: allProjects.length,
    activeProjects: allProjects.filter((p: Project) => p.status === 'Active').length,
    archivedProjects: allProjects.filter((p: Project) => p.status === 'Archived').length
  };
  const totalTasks = allProjects.reduce((sum: number, p: Project) => sum + p.taskCount, 0);

  // Fetch tasks for total tasks view
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', currentWorkspace?._id, search],
    queryFn: async () => {
      if (!currentWorkspace?._id) return [];
      const response = await taskApi.getAll({
        workspaceId: currentWorkspace._id,
        search: search || undefined,
      });
      return response.data?.data || [];
    },
    enabled: !!currentWorkspace?._id && viewMode === 'tasks',
  });

  // Archive project mutation
  const archiveMutation = useMutation({
    mutationFn: (projectId: string) => projectApi.archive(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', currentWorkspace?._id, filter, search] })
      queryClient.invalidateQueries({ queryKey: ['allProjects', currentWorkspace?._id] })
      toast.success('Project archived successfully')
      setActionMenuOpen(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to archive project')
    },
  })

  // Unarchive project mutation
  const unarchiveMutation = useMutation({
    mutationFn: (projectId: string) => projectApi.unarchive(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', currentWorkspace?._id, filter, search] })
      queryClient.invalidateQueries({ queryKey: ['allProjects', currentWorkspace?._id] })
      toast.success('Project restored successfully')
      setActionMenuOpen(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to restore project')
    },
  })

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => projectApi.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projectStatistics'] })
      toast.success('Project deleted successfully')
      setIsDeleteDialogOpen(false)
      setActionMenuOpen(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete project')
    },
  })

  // Sort projects
  const sortedProjects = [...projects].sort((a, b) => {
    switch (sort) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'updated':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case 'alphabetical':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  // Filter projects by status and search
  const displayedProjects = sortedProjects.filter((project) => {
    const matchesStatus =
      filter === 'ALL'
        ? true
        : filter === 'ACTIVE'
        ? project.status === 'Active'
        : filter === 'ARCHIVED'
        ? project.status === 'Archived'
        : false
    if (!matchesStatus) return false
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      project.name.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower)
    )
  })

  const handleArchive = (projectId: string) => {
    archiveMutation.mutate(projectId)
  }

  const handleUnarchive = (projectId: string) => {
    unarchiveMutation.mutate(projectId)
  }

  const handleDelete = (project: Project) => {
    setSelectedProject(project)
    setIsDeleteDialogOpen(true)
    setActionMenuOpen(null)
  }

  const confirmDelete = () => {
    if (selectedProject) {
      deleteMutation.mutate(selectedProject._id)
    }
  }

  const handleEdit = (project: Project) => {
    setSelectedProject(project)
    setIsEditModalOpen(true)
    setActionMenuOpen(null)
  }

  const handleCardClick = (project: Project) => {
    navigate(`/projects/${project._id}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-3 md:space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Projects</h1>
          <p className="text-secondary text-sm">Manage projects inside your workspace</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg transition-colors font-medium text-sm"
          style={{
            background: 'var(--color-primary-500)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-600)' }
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-primary-500)' }
        >
          <Plus size={16} />
          <span className="hidden md:inline">Create Project</span>
          <span className="md:hidden">Create</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
<StatCard
  title="Total Projects"
  value={statistics.totalProjects}
  icon={FolderKanban}
  color="text-blue-400"
  bgColor="bg-blue-400/10"
  onClick={() => {
    setViewMode('projects');
    setFilter('ALL');
  }}
/>
<StatCard
  title="Active Projects"
  value={statistics.activeProjects}
  icon={CheckCircle2}
  color="text-green-400"
  bgColor="bg-green-400/10"
  onClick={() => {
    setViewMode('projects');
    setFilter('ACTIVE');
  }}
/>
<StatCard
  title="Archived Projects"
  value={statistics.archivedProjects}
  icon={Archive}
  color="text-yellow-400"
  bgColor="bg-yellow-400/10"
  onClick={() => {
    setViewMode('projects');
    setFilter('ARCHIVED');
  }}
/>
<StatCard
  title="Total Tasks"
  value={totalTasks}
  icon={Clock}
  color="text-purple-400"
  bgColor="bg-purple-400/10"
  onClick={() => setViewMode('tasks')}
/>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-white focus:outline-none transition-colors"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'var(--color-border-primary)',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-border-focus)' }
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border-primary)' }
          />
        </div>
        <div className="flex gap-2">
          <Dropdown
            options={FILTER_OPTIONS}
            value={filter}
            onChange={(value: string) => setFilter(value as FilterType)}
            placeholder="Filter"
          />
          <Dropdown
            options={SORT_OPTIONS}
            value={sort}
            onChange={(value: string) => setSort(value as SortType)}
            placeholder="Sort"
          />
        </div>
      </div>

{viewMode === 'projects' ? (
         displayedProjects.length === 0 ? (
           <EmptyState onCreateProject={() => setIsCreateModalOpen(true)} />
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             <AnimatePresence>
               {displayedProjects.map((project) => (
                 <ProjectCard
                   key={project._id}
                   project={project}
                   onClick={() => handleCardClick(project)}
                   onArchive={() => handleArchive(project._id)}
                   onUnarchive={() => handleUnarchive(project._id)}
                   onEdit={() => handleEdit(project)}
                   onDelete={() => handleDelete(project)}
                   actionMenuOpen={actionMenuOpen}
                   setActionMenuOpen={setActionMenuOpen}
                 />
               ))}
             </AnimatePresence>
           </div>
         )
       ) : (
         // Tasks view
         <div className="space-y-4">
           {isLoadingTasks ? (
             <div className="flex items-center justify-center min-h-[200px]">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
           ) : tasks.length === 0 ? (
             <div className="text-center py-10">
               <p className="text-secondary">No tasks found.</p>
             </div>
           ) : (
             <div className="space-y-3">
               {tasks.map((task: any) => (
                 <div key={task._id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                   <div className="flex items-start gap-3">
                     <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3b82f620' }}>
                       <ListTodo size={18} className="text-blue-400" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <h3 className="text-white font-medium text-sm mb-1 truncate">{task.title}</h3>
                       <p className="text-secondary text-xs line-clamp-2">{task.description || 'No description'}</p>
                       <div className="flex items-center gap-3 mt-2 text-xs text-secondary">
                         <span>
                           <Users size={14} /> {task.assigneeCount || 0} assignees
                         </span>
                         <span>
                           <Clock size={14} /> {task.project?.name || 'Unknown Project'}
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>
       )}

      {/* Create Project Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateProjectModal
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              setIsCreateModalOpen(false)
              queryClient.invalidateQueries({ queryKey: ['projects'] })
              queryClient.invalidateQueries({ queryKey: ['projectStatistics'] })
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedProject && (
          <EditProjectModal
            project={selectedProject}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedProject(null)
            }}
            onSuccess={() => {
              setIsEditModalOpen(false)
              setSelectedProject(null)
              queryClient.invalidateQueries({ queryKey: ['projects'] })
              queryClient.invalidateQueries({ queryKey: ['projectStatistics'] })
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <DeleteProjectDialog
          project={selectedProject}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSelectedProject(null)
          }}
          onConfirm={confirmDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, bgColor, onClick }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon size={20} className={color} />
        </div>
        <div className="flex-1">
          <p className="text-secondary text-xs mb-1">{title}</p>
          <p className={`text-2xl font-bold text-white ${color}`}>
            <AnimatedCounter value={value} />
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Project Card Component
function ProjectCard({
  project,
  onClick,
  onArchive,
  onUnarchive,
  onEdit,
  onDelete,
  actionMenuOpen,
  setActionMenuOpen,
}: any) {
  const menuRef = useRef<HTMLDivElement>(null)
  const ProjectIcon = getIconComponent(project?.icon || 'folder')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuOpen(null)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActionMenuOpen(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [setActionMenuOpen])

  const isArchived = project.status === 'Archived'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
      onClick={onClick}
    >
      {/* Project Icon & Name */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${project.color}20` }}
        >
          <ProjectIcon size={20} style={{ color: project.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm mb-1 truncate">{project.name}</h3>
          <p className="text-secondary text-xs line-clamp-2">{project.description || 'No description'}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setActionMenuOpen(actionMenuOpen === project._id ? null : project._id)
          }}
          className="p-1.5 hover:bg-white/5 rounded-md transition-all duration-200 text-secondary hover:text-white"
        >
          <MoreVertical size={15} strokeWidth={2} className="transition-transform duration-200 group-hover:scale-110" />
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-secondary mb-3">
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>{project.taskCount} tasks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={14} />
          <span>{project.memberCount} members</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
            isArchived
              ? 'bg-yellow-400/10 text-yellow-400'
              : project.status === 'Completed'
              ? 'bg-blue-400/10 text-blue-400'
              : project.status === 'On Hold'
              ? 'bg-orange-400/10 text-orange-400'
              : project.status === 'Planning'
              ? 'bg-purple-400/10 text-purple-400'
              : 'bg-green-400/10 text-green-400'
          }`}
        >
          {isArchived ? (
            <Archive size={12} />
          ) : project.status === 'Completed' ? (
            <CheckCircle2 size={12} />
          ) : project.status === 'On Hold' ? (
            <AlertTriangle size={12} />
          ) : project.status === 'Planning' ? (
            <Clock size={12} />
          ) : (
            <CheckCircle2 size={12} />
          )}
          {project.status}
        </span>
        <span className="text-secondary text-xs">
          {new Date(project.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Action Menu */}
      <AnimatePresence>
        {actionMenuOpen === project._id && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-1 z-50 min-w-[140px] max-w-[180px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="bg-[#0a0a0f]/98 backdrop-blur-md border border-white/8 rounded-lg shadow-lg overflow-hidden py-1"
              style={{
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className="w-full px-3 py-1.5 text-left text-[11px] font-medium text-white/90 hover:bg-white/6 hover:text-white flex items-center gap-2 transition-all duration-150"
              >
                <Edit size={13} strokeWidth={2} className="text-white/50 flex-shrink-0" />
                <span>Edit</span>
              </button>
              {isArchived ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUnarchive()
                  }}
                  className="w-full px-3 py-1.5 text-left text-[11px] font-medium text-white/90 hover:bg-white/6 hover:text-white flex items-center gap-2 transition-all duration-150"
                >
                  <ArchiveRestore size={13} strokeWidth={2} className="text-white/50 flex-shrink-0" />
                  <span>Restore</span>
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onArchive()
                  }}
                  className="w-full px-3 py-1.5 text-left text-[11px] font-medium text-white/90 hover:bg-white/6 hover:text-white flex items-center gap-2 transition-all duration-150"
                >
                  <Archive size={13} strokeWidth={2} className="text-white/50 flex-shrink-0" />
                  <span>Archive</span>
                </button>
              )}
              <div className="my-1 mx-2 h-px bg-white/6" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="w-full px-3 py-1.5 text-left text-[11px] font-medium text-red-400 hover:bg-red-500/8 hover:text-red-300 flex items-center gap-2 transition-all duration-150"
              >
                <Trash2 size={13} strokeWidth={2} className="text-red-400/80 flex-shrink-0" />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Empty State Component
function EmptyState({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mb-6 shadow-lg">
        <FolderKanban size={48} className="text-primary" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">No Projects Yet</h3>
      <p className="text-secondary text-sm mb-8 text-center max-w-md leading-relaxed">
        Create your first project to organize work and collaborate with your team.
      </p>
      <button
        onClick={onCreateProject}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-400 text-black rounded-xl transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5"
      >
        <Plus size={18} />
        <span>Create Project</span>
      </button>
    </motion.div>
  )
}

// Reusable Project Modal Component
interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  initialName?: string
  initialDescription?: string
  initialIcon?: string
  initialColor?: string
  submitLabel: string
  submittingLabel: string
  onSubmit: (data: { name: string; description: string; icon: string; color: string }) => Promise<void>
  onSuccess: () => void
}

function ProjectModal({
  isOpen,
  onClose,
  title,
  description,
  initialName = '',
  initialDescription = '',
  initialIcon = 'folder',
  initialColor = '#10b981',
  submitLabel,
  submittingLabel,
  onSubmit,
  onSuccess,
}: ProjectModalProps) {
  const [name, setName] = useState(initialName)
  const [desc, setDesc] = useState(initialDescription)
  const [icon, setIcon] = useState(initialIcon)
  const [color, setColor] = useState(initialColor)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        description: desc.trim(),
        icon,
        color,
      })
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const ICONS = [
    { id: 'folder', component: FolderKanban },
    { id: 'briefcase', component: Briefcase },
    { id: 'rocket', component: Rocket },
    { id: 'star', component: Star },
    { id: 'target', component: Target },
    { id: 'zap', component: Zap },
  ]
  const COLORS = [
    { id: 'emerald', value: '#10b981', name: 'Emerald' },
    { id: 'royal-blue', value: '#3b82f6', name: 'Royal Blue' },
    { id: 'violet', value: '#8b5cf6', name: 'Violet' },
    { id: 'orange', value: '#f97316', name: 'Orange' },
    { id: 'coral', value: '#f43f5e', name: 'Coral' },
    { id: 'pink', value: '#ec4899', name: 'Pink' },
    { id: 'slate', value: '#64748b', name: 'Slate' },
    { id: 'amber', value: '#f59e0b', name: 'Amber' },
  ]

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300]"
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[300] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
          <div className="flex items-center justify-between mb-6">
            <h3 className="heading-lg text-white text-lg">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <X size={18} className="text-secondary" />
            </button>
          </div>
          {description && <p className="text-secondary text-sm mb-5">{description}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="label-field text-sm mb-2 block">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Q4 Marketing Campaign"
                className="input-field px-4 py-3 text-sm"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="label-field text-sm mb-2 block">Description</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Add a brief description of your project..."
                rows={3}
                className="input-field px-4 py-3 resize-none text-sm"
              />
            </div>

            {/* Icon and Color Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Icon Picker */}
              <div>
                <label className="label-field text-sm mb-2 block">Icon</label>
                <div className="flex gap-2">
                  {ICONS.map((iconOption) => {
                    const Icon = iconOption.component
                    return (
                      <motion.button
                        key={iconOption.id}
                        type="button"
                        onClick={() => setIcon(iconOption.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2.5 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                          icon === iconOption.id
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20 ring-2 ring-primary/30'
                            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <Icon size={20} className={icon === iconOption.id ? 'text-primary' : 'text-secondary'} />
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="label-field text-sm mb-2 block">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <motion.button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.value)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center ${
                        color === c.value
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0f]'
                          : 'hover:ring-2 hover:ring-white/30 hover:ring-offset-2 hover:ring-offset-[#0a0a0f]'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    >
                      {color === c.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Project Preview */}
            <div>
              <label className="label-field text-sm mb-2 block">Preview</label>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-3 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    {(() => {
                      const IconComponent = ICONS.find(i => i.id === icon)?.component || FolderKanban
                      return <IconComponent size={20} style={{ color }} />
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm mb-1 truncate">{name || 'Project Name'}</h4>
                    <p className="text-secondary text-xs line-clamp-2">{desc || 'No description'}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="gradient-btn-outline px-6 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="gradient-btn animate-pulse-glow px-6 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{submittingLabel}</span>
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            </div>
          </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// Create Project Modal Component
function CreateProjectModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { currentWorkspace } = useWorkspace()

  const handleSubmit = async (data: { name: string; description: string; icon: string; color: string }) => {
    if (!currentWorkspace?._id) throw new Error('No workspace selected')

    await projectApi.create({
      workspaceId: currentWorkspace._id,
      ...data,
    })
    toast.success('Project created successfully')
  }

  return (
    <ProjectModal
      isOpen={true}
      onClose={onClose}
      title="Create New Project"
      description="Create a new project inside your workspace."
      submitLabel="Create Project"
      submittingLabel="Creating..."
      onSubmit={handleSubmit}
      onSuccess={onSuccess}
    />
  )
}

// Edit Project Modal Component
function EditProjectModal({ project, onClose, onSuccess }: any) {
  const { currentWorkspace } = useWorkspace()
  const { user } = useAuth()
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description || '')
  const [icon, setIcon] = useState(project.icon)
  const [color, setColor] = useState(project.color)
  const [status, setStatus] = useState(project.status || 'Planning')
  const [startDate, setStartDate] = useState(project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '')
  const [dueDate, setDueDate] = useState(project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '')
  const [ownerId, setOwnerId] = useState(project.ownerId || user?.id || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch workspace members for owner selection
  const { data: workspaceMembers = [] } = useQuery({
    queryKey: ['workspaceMembers', currentWorkspace?._id],
    queryFn: async () => {
      if (!currentWorkspace?._id) return []
      try {
        const response = await workspaceApi.getMembers(currentWorkspace._id)
        // Handle different response shapes - extract active members array
        const data = response.data?.data
        if (Array.isArray(data)) {
          return data
        }
        if (data?.activeMembers && Array.isArray(data.activeMembers)) {
          return data.activeMembers
        }
        // Fallback: if response.data is directly an array
        if (Array.isArray(response.data)) {
          return response.data
        }
        return []
      } catch (error) {
        console.error('Failed to fetch workspace members:', error)
        return []
      }
    },
    enabled: !!currentWorkspace?._id,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    // Validate dates
    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      toast.error('Due date cannot be before start date')
      return
    }

    setIsSubmitting(true)
    try {
      await projectApi.update(project._id, {
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
        status,
        ownerId,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
      })
      toast.success('Project updated successfully')
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const ICONS = [
    { id: 'folder', component: FolderKanban },
    { id: 'briefcase', component: Briefcase },
    { id: 'rocket', component: Rocket },
    { id: 'star', component: Star },
    { id: 'target', component: Target },
    { id: 'zap', component: Zap },
  ]
  const COLORS = ['#4ade80', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  const STATUS_OPTIONS = [
    { value: 'Planning', label: 'Planning', color: 'bg-blue-400/10 text-blue-400' },
    { value: 'Active', label: 'Active', color: 'bg-green-400/10 text-green-400' },
    { value: 'On Hold', label: 'On Hold', color: 'bg-yellow-400/10 text-yellow-400' },
    { value: 'Completed', label: 'Completed', color: 'bg-emerald-400/10 text-emerald-400' },
    { value: 'Archived', label: 'Archived', color: 'bg-gray-400/10 text-gray-400' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="bg-[#0a0a0f]/98 backdrop-blur-md border border-white/8 rounded-xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Edit Project</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-secondary hover:text-white"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-white/90 mb-1.5">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-lg text-white text-sm placeholder-secondary/40 focus:outline-none focus:border-primary/30 focus:bg-white/8 transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/90 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={2.5}
              maxLength={2000}
              className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-lg text-white text-sm placeholder-secondary/40 focus:outline-none focus:border-primary/30 focus:bg-white/8 transition-all duration-200 resize-none"
            />
            <p className="text-[11px] text-secondary/40 mt-1">{description.length}/2000</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/90 mb-1.5">Icon</label>
            <div className="flex gap-1.5">
              {ICONS.map((iconOption) => {
                const Icon = iconOption.component
                return (
                  <button
                    key={iconOption.id}
                    type="button"
                    onClick={() => setIcon(iconOption.id)}
                    className={`p-1.5 rounded-lg border transition-all duration-200 ${
                      icon === iconOption.id
                        ? 'border-primary/40 bg-primary/8 scale-105 shadow-md'
                        : 'border-white/6 hover:border-white/12 hover:bg-white/3'
                    }`}
                  >
                    <Icon size={16} strokeWidth={2} className={icon === iconOption.id ? 'text-primary' : 'text-secondary/60'} />
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/90 mb-1.5">Color</label>
            <div className="flex gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all duration-200 ${
                    color === c ? 'scale-110 ring-2 ring-white/30 ring-offset-2 ring-offset-[#0a0a0f]' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/90 mb-1.5">Status</label>
            <Dropdown
              options={STATUS_OPTIONS.map(option => ({ value: option.value, label: option.label }))}
              value={status}
              onChange={setStatus}
              placeholder="Select status"
              size="sm"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/90 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-lg text-white text-sm focus:outline-none focus:border-primary/30 focus:bg-white/8 transition-all duration-200"
                style={{
                  colorScheme: 'dark'
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/90 mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-lg text-white text-sm focus:outline-none focus:border-primary/30 focus:bg-white/8 transition-all duration-200"
                style={{
                  colorScheme: 'dark'
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/90 mb-1.5">Owner</label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-lg text-white text-sm focus:outline-none focus:border-primary/30 focus:bg-white/8 transition-all duration-200"
              style={{
                colorScheme: 'dark'
              }}
            >
              {Array.isArray(workspaceMembers) && workspaceMembers.length > 0 ? (
                workspaceMembers.map((member: any) => (
                  <option key={member.userId || member._id || member.id} value={member.userId || member._id || member.id}>
                    {member.name || member.userId || member._id || member.id}
                  </option>
                ))
              ) : (
                <option value={user?.id || ''}>{user?.name || 'Current User'}</option>
              )}
            </select>
          </div>

          <div className="flex gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/8 text-white/90 hover:text-white rounded-lg transition-all duration-200 font-medium text-sm disabled:opacity-50 border border-white/6"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 transition-all duration-200 text-black"
              style={{
                background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                boxShadow: '0 4px 12px rgba(74, 222, 128, 0.4), 0 0 0 1px rgba(74, 222, 128, 0.2)'
              }}
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Delete Confirmation Dialog Component
function DeleteProjectDialog({ project, onClose, onConfirm, isDeleting }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-400/10 rounded-full flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Delete Project</h2>
        </div>

        <p className="text-secondary text-sm mb-6">
          Deleting <span className="text-white font-medium">{project?.name}</span> will permanently remove it and all its data. This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab() {
  const { project, projectId } = useProject()
  const { data: taskStatistics, isLoading: statsLoading } = useQuery({
    queryKey: ['projectTaskStatistics', projectId],
    queryFn: async () => {
      if (!projectId) return undefined
      const response = await projectApi.getTaskStatistics(projectId)
      return response.data?.data
    },
    enabled: !!projectId,
  })

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['projectActivities', projectId],
    queryFn: async () => {
      if (!projectId) return []
      const response = await projectApi.getActivities(projectId, 5)
      return response.data?.data || []
    },
    enabled: !!projectId,
  })

  const { data: deadlines, isLoading: deadlinesLoading } = useQuery({
    queryKey: ['projectDeadlines', projectId],
    queryFn: async () => {
      if (!projectId) return []
      const response = await projectApi.getUpcomingDeadlines(projectId, 5)
      return response.data?.data || []
    },
    enabled: !!projectId,
  })

  const stats = taskStatistics || {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    overdueTasks: 0,
    completionPercentage: 0
  }

  const CHART_DATA = [
    { name: 'To Do', value: stats.todoTasks, color: '#6b7280' },
    { name: 'In Progress', value: stats.inProgressTasks, color: '#3b82f6' },
    { name: 'Done', value: stats.completedTasks, color: '#10b981' },
  ].filter(item => item.value > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2 md:space-y-2.5"
    >
      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <PremiumStatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={ListTodo}
          color="text-blue-400"
          bgColor="bg-blue-400/10"
          borderColor="border-blue-400/30"
        />
        <PremiumStatCard
          title="Completed"
          value={stats.completedTasks}
          icon={CheckCircle2}
          color="text-green-400"
          bgColor="bg-green-400/10"
          borderColor="border-green-400/30"
        />
        <PremiumStatCard
          title="In Progress"
          value={stats.inProgressTasks}
          icon={Clock}
          color="text-purple-400"
          bgColor="bg-purple-400/10"
          borderColor="border-purple-400/30"
        />
        <PremiumStatCard
          title="To Do"
          value={stats.todoTasks}
          icon={Target}
          color="text-gray-400"
          bgColor="bg-gray-400/10"
          borderColor="border-gray-400/30"
        />
        <PremiumStatCard
          title="Overdue"
          value={stats.overdueTasks}
          icon={AlertTriangle}
          color="text-red-400"
          bgColor="bg-red-400/10"
          borderColor="border-red-400/30"
        />
        <PremiumStatCard
          title="Members"
          value={project?.memberCount || 0}
          icon={Users}
          color="text-cyan-400"
          bgColor="bg-cyan-400/10"
          borderColor="border-cyan-400/30"
        />
      </div>

      {/* Completion Percentage Card */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 md:p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-white">Completion Progress</h3>
          <span className="text-lg font-bold text-primary">{stats.completionPercentage}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full"
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        {/* Recent Activity */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 md:p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-white">Recent Activity</h3>
            <button
              onClick={() => {/* Navigate to Activity tab */}}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              View All →
            </button>
          </div>
          {activitiesLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-1.5">
              {activities.slice(0, 5).map((activity: any) => (
                <ActivityItem key={activity._id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-secondary text-xs">
              No recent activity
            </div>
          )}
        </div>

        {/* Tasks by Status & Upcoming Deadlines */}
        <div className="space-y-2.5">
          {/* Tasks by Status Chart */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 md:p-3">
            <h3 className="text-xs font-semibold text-white mb-2">Tasks by Status</h3>
            {statsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : CHART_DATA.length > 0 ? (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={CHART_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {CHART_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 15, 22, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-white">{stats.totalTasks}</span>
                  <span className="text-xs text-secondary">Total</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-secondary text-xs">
                No tasks yet
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 md:p-3">
            <h3 className="text-xs font-semibold text-white mb-2">Upcoming Deadlines</h3>
            {deadlinesLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : deadlines && deadlines.length > 0 ? (
              <div className="space-y-1.5">
                {deadlines.map((task: any) => (
                  <div key={task._id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{task.title}</p>
                      <p className="text-secondary text-xs">
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      task.priority === 'high' ? 'bg-red-400/10 text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                      'bg-gray-400/10 text-gray-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-secondary text-xs">
                No upcoming deadlines
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Information */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 md:p-3">
        <h3 className="text-xs font-semibold text-white mb-2">Project Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div>
            <p className="text-secondary text-xs mb-0.5">Created</p>
            <p className="text-white text-xs">
              {project ? new Date(project.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : '-'}
            </p>
          </div>
          <div>
            <p className="text-secondary text-xs mb-0.5">Last Updated</p>
            <p className="text-white text-xs">
              {project ? new Date(project.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : '-'}
            </p>
          </div>
          <div>
            <p className="text-secondary text-xs mb-0.5">Status</p>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
              project?.status === 'Archived'
                ? 'bg-yellow-400/10 text-yellow-400'
                : 'bg-green-400/10 text-green-400'
            }`}>
              {project?.status === 'Archived' ? (
                <Archive size={9} />
              ) : (
                <CheckCircle2 size={9} />
              )}
              {project?.status === 'Archived' ? 'Archived' : 'Active'}
            </span>
          </div>
          <div>
            <p className="text-secondary text-xs mb-0.5">Project Key</p>
            <p className="text-white text-xs font-mono">{project?.slug?.toUpperCase() || '-'}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Premium Stat Card Component
function PremiumStatCard({ title, value, icon: Icon, color, bgColor, borderColor }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`bg-white/5 border ${borderColor} rounded-lg p-2 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300`}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1 rounded-lg ${bgColor}`}>
          <Icon size={14} className={color} />
        </div>
        <div className="flex-1">
          <p className="text-secondary text-xs mb-0.5">{title}</p>
          <p className={`text-base font-bold text-white ${color}`}>
            <AnimatedCounter value={value} />
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// Activity Item Component (Simplified for Overview)
function ActivityItem({ activity }: { activity: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
    >
      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
        <span className="text-primary text-xs font-medium">
          {activity.actorName?.charAt(0).toUpperCase() || 'U'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs">{activity.message}</p>
        <p className="text-secondary text-xs mt-0.5">{getRelativeTime(activity.createdAt)}</p>
      </div>
      <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0"></div>
    </motion.div>
  )
}

// Tasks Tab Component
function TasksTab() {
  const { projectId, workspaceId } = useProject()
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'table'>('kanban')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ]

  const PRIORITY_OPTIONS = [
    { value: 'all', label: 'All Priority' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ]

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => taskApi.create({ ...data, workspaceId, projectId }),
    onSuccess: () => {
      toast.success('Task created successfully')
      setIsCreateModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create task')
    },
  })

  const handleCreateTask = (data: any) => {
    createTaskMutation.mutate(data)
  }

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['projectTasks', projectId, filterStatus, filterPriority, searchQuery],
    queryFn: async () => {
      const response = await taskApi.getAll({ projectId })
      let filteredTasks = response.data?.data || []

      if (filterStatus !== 'all') {
        filteredTasks = filteredTasks.filter((t: any) => t.status === filterStatus)
      }
      if (filterPriority !== 'all') {
        filteredTasks = filteredTasks.filter((t: any) => t.priority === filterPriority)
      }
      if (searchQuery) {
        filteredTasks = filteredTasks.filter((t: any) => 
          t.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      return filteredTasks
    },
    enabled: !!projectId,
  })

  const COLUMNS = [
    { id: 'todo', title: 'To Do', status: 'todo' as const, color: 'border-yellow-400/30' },
    { id: 'in-progress', title: 'In Progress', status: 'in-progress' as const, color: 'border-blue-400/30' },
    { id: 'done', title: 'Done', status: 'done' as const, color: 'border-green-400/30' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2.5"
    >
      {/* Header with View Mode and Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'kanban'
                ? 'bg-primary text-white'
                : 'bg-white/5 text-secondary hover:bg-white/10'
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-primary text-white'
                : 'bg-white/5 text-secondary hover:bg-white/10'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-primary text-white'
                : 'bg-white/5 text-secondary hover:bg-white/10'
            }`}
          >
            Table
          </button>
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-secondary/50 focus:outline-none focus:border-primary/50 transition-colors text-xs"
            />
          </div>
          <Dropdown
            options={STATUS_OPTIONS}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="Status"
            size="sm"
          />
          <Dropdown
            options={PRIORITY_OPTIONS}
            value={filterPriority}
            onChange={setFilterPriority}
            placeholder="Priority"
            size="sm"
          />
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <Plus size={12} />
            <span className="hidden md:inline">Create Task</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : tasks && tasks.length > 0 ? (
        <>
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {COLUMNS.map((column) => (
                <div key={column.id} className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                  <div className={`flex items-center justify-between mb-2.5 pb-2 border-b ${column.color}`}>
                    <h3 className="font-semibold text-white text-xs">{column.title}</h3>
                    <span className="text-xs text-secondary bg-white/5 px-1.5 py-0.5 rounded-full">
                      {tasks.filter((t: any) => t.status === column.status).length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {tasks
                      .filter((t: any) => t.status === column.status)
                      .map((task: any) => (
                        <ProjectTaskCard key={task._id} task={task} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-2">
              {tasks.map((task: any) => (
                <ProjectTaskCard key={task._id} task={task} />
              ))}
            </div>
          )}

          {viewMode === 'table' && (
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-secondary uppercase">Task</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-secondary uppercase">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-secondary uppercase">Priority</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-secondary uppercase">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-secondary uppercase">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task: any) => (
                    <tr key={task._id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                      <td className="px-3 py-2">
                        <p className="text-white text-xs font-medium">{task.title}</p>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'done' ? 'bg-green-400/10 text-green-400' :
                          task.status === 'in-progress' ? 'bg-blue-400/10 text-blue-400' :
                          'bg-gray-400/10 text-gray-400'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-400/10 text-red-400' :
                          task.priority === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                          'bg-gray-400/10 text-gray-400'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-secondary text-xs capitalize">{task.category}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-secondary text-xs">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
            <ListTodo size={24} className="text-secondary" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1.5">No Tasks Yet</h3>
          <p className="text-secondary text-xs max-w-md mb-3">
            Create your first task to start tracking work in this project.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium text-xs cursor-pointer"
          >
            <Plus size={12} />
            Create Task
          </button>
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        isSubmitting={createTaskMutation.isPending}
        workspaceId={workspaceId}
        projectId={projectId}
      />
    </motion.div>
  )
}

// Project Task Card Component
function ProjectTaskCard({ task }: { task: any }) {
  const priorityConfig: Record<string, { color: string; bg: string; border: string }> = {
    high: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
    low: { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  }

  const priority = priorityConfig[task.priority] || priorityConfig.medium
  const statusConfig: Record<string, { color: string; bg: string }> = {
    todo: { color: 'text-gray-400', bg: 'bg-gray-400/10' },
    'in-progress': { color: 'text-blue-400', bg: 'bg-blue-400/10' },
    done: { color: 'text-green-400', bg: 'bg-green-400/10' },
  }
  const status = statusConfig[task.status] || statusConfig.todo

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1.5, transition: { duration: 0.2 } }}
      className="bg-white/5 border border-white/10 rounded-lg p-2.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-white font-medium text-xs flex-1">{task.title}</h4>
        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${priority.bg} ${priority.color} ${priority.border} border`}>
          {task.priority}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-secondary">
        <span className={`px-1.5 py-0.5 rounded-full ${status.bg} ${status.color}`}>
          {task.status}
        </span>
        <span className="capitalize">{task.category}</span>
        {task.dueDate && (
          <>
            <span>•</span>
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </>
        )}
      </div>
    </motion.div>
  )
}

// Activity Tab Component
function ActivityTab() {
  const { projectId } = useProject()
  const [filterEventType, setFilterEventType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const EVENT_TYPE_OPTIONS = [
    { value: 'all', label: 'All Events' },
    { value: 'task.created', label: 'Task Created' },
    { value: 'task.updated', label: 'Task Updated' },
    { value: 'task.completed', label: 'Task Completed' },
    { value: 'project.updated', label: 'Project Updated' },
  ]

  const { data: activities, isLoading } = useQuery({
    queryKey: ['projectActivities', projectId, filterEventType, searchQuery],
    queryFn: async () => {
      if (!projectId) return []
      const response = await projectApi.getActivities(projectId, 50)
      let filteredActivities = response.data?.data || []

      if (filterEventType !== 'all') {
        filteredActivities = filteredActivities.filter((a: any) => a.eventType === filterEventType)
      }
      if (searchQuery) {
        filteredActivities = filteredActivities.filter((a: any) =>
          a.message?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      return filteredActivities
    },
    enabled: !!projectId,
  })

  // Group activities by date
  const groupedActivities = activities?.reduce((groups: any, activity: any) => {
    const date = new Date(activity.createdAt).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
    return groups
  }, {}) || {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2.5"
    >
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">Activity Timeline</h3>
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-secondary/50 focus:outline-none focus:border-primary/50 transition-colors text-xs"
            />
          </div>
          <Dropdown
            options={EVENT_TYPE_OPTIONS}
            value={filterEventType}
            onChange={setFilterEventType}
            placeholder="Events"
            size="sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : activities && activities.length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedActivities).map(([date, dateActivities]: [string, any]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-xs text-secondary font-medium">{date}</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>
              <div className="space-y-2">
                {dateActivities.map((activity: any) => (
                  <ActivityItem key={activity._id} activity={activity} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
            <Activity size={24} className="text-secondary" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1.5">No Activity Yet</h3>
          <p className="text-secondary text-xs max-w-md">
            Activity will appear here as you work on this project.
          </p>
        </div>
      )}
    </motion.div>
  )
}

// Members Tab Component
function MembersTab() {
  const { projectId } = useProject()
  const { hasPermission } = useWorkspace()
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'joined'>('joined')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false)
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [isChangingRole, setIsChangingRole] = useState(false)
  const [isRemovingMember, setIsRemovingMember] = useState(false)

  const ROLE_OPTIONS = [
    { value: 'all', label: 'All Roles' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MEMBER', label: 'Member' },
    { value: 'VIEWER', label: 'Viewer' },
  ]

  const SORT_OPTIONS = [
    { value: 'joined-desc', label: 'Recently Joined' },
    { value: 'joined-asc', label: 'Oldest Joined' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'role-asc', label: 'Role A-Z' },
    { value: 'role-desc', label: 'Role Z-A' },
  ]

  const { data: members, isLoading } = useQuery({
    queryKey: ['projectMembers', projectId, refreshKey],
    queryFn: async () => {
      if (!projectId) return []
      const response = await projectApi.getMembers(projectId)
      return response.data?.data || []
    },
    enabled: !!projectId,
  })

  // Permission checks
  const canInviteMembers = hasPermission('members.invite')
  const canManageMembers = canInviteMembers

  const handleInviteSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleChangeRole = (member: any) => {
    setSelectedMember(member)
    setIsChangeRoleModalOpen(true)
  }

  const handleViewProfile = (member: any) => {
    toast(`Viewing ${member.name || member.email}'s profile`, { icon: '👤' })
  }

  const handleRemoveMember = (member: any) => {
    setSelectedMember(member)
    setIsRemoveMemberModalOpen(true)
  }

  // Helper function to get menu items for project members
  const getProjectMemberMenuItems = (member: any): ActionMenuItem[] => {
    const isOwner = member.role === 'OWNER';
    const items: ActionMenuItem[] = [
      {
        id: 'view-profile',
        label: 'View Profile',
        icon: User,
        onClick: () => handleViewProfile(member),
      },
    ];

    if (canManageMembers) {
      items.push({
        id: 'change-role',
        label: 'Change Role',
        icon: Settings,
        onClick: () => handleChangeRole(member),
      });
    }

    if (canManageMembers && !isOwner) {
      items.push({
        id: 'remove',
        label: 'Remove Member',
        icon: Trash2,
        onClick: () => handleRemoveMember(member),
        destructive: true,
        divider: true,
      });
    }

    return items;
  }

  const handleConfirmRemoveMember = async () => {
    if (!selectedMember || !projectId) return

    setIsRemovingMember(true)
    try {
      await projectApi.removeMember(projectId, selectedMember._id)
      toast.success('Member removed successfully')
      setIsRemoveMemberModalOpen(false)
      setSelectedMember(null)
      setRefreshKey(prev => prev + 1)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove member')
    } finally {
      setIsRemovingMember(false)
    }
  }

  const handleSaveRole = async (newRole: string) => {
    if (!selectedMember || !projectId) return

    setIsChangingRole(true)
    try {
      await projectApi.updateMemberRole(projectId, selectedMember._id, newRole)
      toast.success('Role updated successfully')
      setIsChangeRoleModalOpen(false)
      setSelectedMember(null)
      setRefreshKey(prev => prev + 1)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update role')
    } finally {
      setIsChangingRole(false)
    }
  }

  // Filter and sort members
  const filteredMembers = members?.filter((member: any) => {
    const matchesSearch = !searchQuery || 
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    return matchesSearch && matchesRole
  }) || []

  const sortedMembers = [...filteredMembers].sort((a: any, b: any) => {
    let comparison = 0
    if (sortBy === 'name') {
      comparison = (a.name || '').localeCompare(b.name || '')
    } else if (sortBy === 'role') {
      comparison = a.role.localeCompare(b.role)
    } else if (sortBy === 'joined') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const roleConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    ADMIN: { label: 'Admin', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
    MEMBER: { label: 'Member', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
    VIEWER: { label: 'Viewer', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/30' },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {/* Premium Toolbar */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-2">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
          {/* Left: Search and Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary w-3 h-3" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white placeholder-secondary/50 focus:outline-none focus:border-primary/50 transition-colors text-[10px]"
              />
            </div>

            {/* Role Filter */}
            <Dropdown
              options={ROLE_OPTIONS}
              value={roleFilter}
              onChange={setRoleFilter}
              placeholder="Role"
              size="sm"
            />

            {/* Sort */}
            <Dropdown
              options={SORT_OPTIONS}
              value={`${sortBy}-${sortOrder}`}
              onChange={(value: string) => {
                const [field, order] = value.split('-')
                setSortBy(field as 'name' | 'role' | 'joined')
                setSortOrder(order as 'asc' | 'desc')
              }}
              placeholder="Sort"
              size="sm"
            />
          </div>

          {/* Right: Stats and Invite Button */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            {/* Total Members Badge */}
            <div className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg">
              <Users size={10} className="text-secondary" />
              <span className="text-white text-[10px] font-medium">{members?.length || 0}</span>
              <span className="text-secondary text-[10px]">Members</span>
            </div>

            {/* Invite Button */}
            {canManageMembers && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="gradient-btn animate-pulse-glow flex items-center gap-2 px-4 py-2"
              >
                <Plus size={14} />
                <span className="hidden md:inline">Invite Member</span>
                <span className="md:hidden">Invite</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Members List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : sortedMembers.length > 0 ? (
        <div className="space-y-1">
          {sortedMembers.map((member: any, index: number) => {
            const role = roleConfig[member.role] || roleConfig.MEMBER
            const isOwner = member.role === 'ADMIN' && member.addedBy === member.userId

            return (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{
                  y: -1.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(134, 239, 172, 0.3)'
                }}
                className="group bg-white/5 border border-white/10 rounded-lg p-2 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center">
                      <span className="text-primary text-xs font-bold">
                        {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900" title="Online"></div>
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="text-white font-semibold text-[10px] truncate" title={member.email || member.userId}>
                        {member.name || 'Unknown User'}
                      </h4>
                      {isOwner && (
                        <span className="px-1 py-0.5 bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 rounded-full text-[10px] font-medium">
                          Owner
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className="flex-shrink-0">
                    <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-semibold border ${role.bg} ${role.color} ${role.border}`}>
                      {role.label}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-secondary text-[10px]">Joined</p>
                      <p className="text-white text-[10px]">{getRelativeTime(member.joinedAt)}</p>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <ActionMenu
                    trigger={<MoreVertical size={13} strokeWidth={2} className="text-secondary hover:text-white transition-colors" />}
                    items={getProjectMemberMenuItems(member)}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-3 border border-white/10">
            <Users size={24} className="text-secondary" />
          </div>
          <h3 className="text-xs font-semibold text-white mb-1.5">No Team Members Yet</h3>
          <p className="text-secondary text-[10px] max-w-md mb-2">
            Invite team members to collaborate on this project and start working together.
          </p>
          {canManageMembers && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="gradient-btn animate-pulse-glow flex items-center gap-2 px-4 py-2"
            >
              <Plus size={14} />
              <span className="hidden md:inline">Invite Your First Member</span>
              <span className="md:hidden">Invite</span>
            </button>
          )}
        </div>
      )}

      {/* Invite Member Modal */}
      {canManageMembers && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onInviteSuccess={handleInviteSuccess}
        />
      )}

      {/* Change Role Modal */}
      {selectedMember && (
        <ChangeRoleModal
          isOpen={isChangeRoleModalOpen}
          onClose={() => {
            setIsChangeRoleModalOpen(false)
            setSelectedMember(null)
          }}
          member={selectedMember}
          currentRole={selectedMember.role}
          onSave={handleSaveRole}
          loading={isChangingRole}
        />
      )}

      {/* Remove Member Modal */}
      {selectedMember && (
        <RemoveMemberDialog
          isOpen={isRemoveMemberModalOpen}
          onClose={() => {
            setIsRemoveMemberModalOpen(false)
            setSelectedMember(null)
          }}
          member={selectedMember}
          onConfirm={handleConfirmRemoveMember}
          loading={isRemovingMember}
        />
      )}
    </motion.div>
  )
}

// Settings Tab Component
function SettingsTab() {
  const { project, projectId } = useProject()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => projectId ? projectApi.delete(projectId) : Promise.reject('No project ID'),
    onSuccess: () => {
      toast.success('Project deleted successfully')
      window.location.href = '/projects'
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete project')
    },
  })

  const archiveMutation = useMutation({
    mutationFn: () => projectId ? projectApi.archive(projectId) : Promise.reject('No project ID'),
    onSuccess: () => {
      toast.success('Project archived successfully')
      window.location.reload()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to archive project')
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2.5"
    >
      {/* General Settings */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 md:p-3">
        <h3 className="text-sm font-semibold text-white mb-2.5">General Settings</h3>
        <div className="space-y-2.5">
          <div>
            <label className="block text-xs font-medium text-white mb-1">Project Name</label>
            <input
              type="text"
              defaultValue={project?.name || ''}
              className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Description</label>
            <textarea
              defaultValue={project?.description || ''}
              rows={2}
              className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors resize-none text-xs"
            />
          </div>
          <button className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium text-xs">
            Save Changes
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2.5 md:p-3">
        <h3 className="text-sm font-semibold text-red-400 mb-2.5">Danger Zone</h3>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg">
            <div>
              <h4 className="text-white font-medium text-xs">Archive Project</h4>
              <p className="text-secondary text-xs">Archive this project to hide it from the active list</p>
            </div>
            <button
              onClick={() => setIsArchiveDialogOpen(true)}
              className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg transition-colors font-medium text-xs"
            >
              Archive
            </button>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg">
            <div>
              <h4 className="text-white font-medium text-xs">Delete Project</h4>
              <p className="text-secondary text-xs">Permanently delete this project and all its data</p>
            </div>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors font-medium text-xs"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-400/10 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Delete Project</h2>
            </div>
            <p className="text-secondary text-sm mb-6">
              Are you sure you want to delete <span className="text-white font-medium">{project?.name}</span>? This action cannot be undone and all project data will be permanently lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      {isArchiveDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-400/10 rounded-full flex items-center justify-center">
                <Archive size={20} className="text-yellow-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Archive Project</h2>
            </div>
            <p className="text-secondary text-sm mb-6">
              Are you sure you want to archive <span className="text-white font-medium">{project?.name}</span>? The project will be hidden from the active list but can be restored later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsArchiveDialogOpen(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => archiveMutation.mutate()}
                disabled={archiveMutation.isPending}
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
              >
                {archiveMutation.isPending ? 'Archiving...' : 'Archive Project'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

// Project Details Page Component
function ProjectDetailsInner() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const { project, isLoading } = useProject()

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle size={48} className="text-secondary mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Project Not Found</h2>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
        >
          Back to Projects
        </button>
      </div>
    )
  }

  const ProjectIcon = getIconComponent(project?.icon || 'folder')

  return (
    <div className="space-y-2 md:space-y-2.5 pb-12">
      {/* Header */}
      <button
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-1.5 text-secondary hover:text-white transition-colors"
      >
        <ArrowLeft size={12} />
        <span className="text-xs">Back to Projects</span>
      </button>
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${project.color}20` }}
        >
          <ProjectIcon size={16} style={{ color: project.color }} />
        </div>
        <div className="flex-1">
          <h1 className="text-lg md:text-xl font-bold text-white mb-0.5">{project.name}</h1>
          <p className="text-secondary text-xs">{project.description || 'No description'}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            project.status === 'Archived'
              ? 'bg-yellow-400/10 text-yellow-400'
              : 'bg-green-400/10 text-green-400'
          }`}
        >
          {project.status === 'Archived' ? (
            <Archive size={9} />
          ) : (
            <CheckCircle2 size={9} />
          )}
          {project.status === 'Archived' ? 'Archived' : 'Active'}
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10">
        <div className="flex gap-2.5 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-secondary hover:text-white'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab />
        )}

        {activeTab === 'tasks' && (
          <TasksTab />
        )}

        {activeTab === 'activity' && (
          <ActivityTab />
        )}

        {activeTab === 'members' && (
          <MembersTab />
        )}

        {activeTab === 'settings' && (
          <SettingsTab />
        )}
      </div>
    </div>
  )
}

// Wrapper component with ProjectProvider
export function ProjectDetails() {
  return (
    <ProjectProvider>
      <ProjectDetailsInner />
    </ProjectProvider>
  )
}
