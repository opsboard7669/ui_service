import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { taskApi, workspaceApi, projectApi } from '../lib/api'
import { Link } from 'react-router-dom'
import { Plus, Filter, X, FolderKanban } from 'lucide-react'
import { getRelativeDate, isOverdue, getInitials } from '../lib/utils'
import type { Task } from '../types'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import CategoryDropdown from '../components/CategoryDropdown'
import ProjectDropdown from '../components/ProjectDropdown'
import AssignedToDropdown from '../components/AssignedToDropdown'
import { useWorkspace } from '../contexts/WorkspaceContext'
import { useAuth } from '../contexts/AuthContext'
import { PrimaryButton, SecondaryButton } from '../components/Button'

const COLUMNS = [
  { id: 'todo', title: 'To Do', status: 'todo' as const, headerColor: 'rgba(251, 191, 36, 0.15)', borderColor: '#fbbf24', icon: '○' },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress' as const, headerColor: 'rgba(34, 197, 94, 0.15)', borderColor: '#22c55e', icon: '◐' },
  { id: 'done', title: 'Done', status: 'done' as const, headerColor: 'rgba(59, 130, 246, 0.15)', borderColor: '#3b82f6', icon: '●' },
]

const CATEGORIES = ['cicd', 'kubernetes', 'aws', 'security', 'monitoring', 'infrastructure'] as const

const CATEGORY_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  kubernetes: { bg: 'rgba(59, 130, 246, 0.18)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.35)' },
  aws: { bg: 'rgba(245, 158, 11, 0.18)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)' },
  security: { bg: 'rgba(239, 68, 68, 0.18)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.35)' },
  monitoring: { bg: 'rgba(168, 85, 247, 0.18)', color: '#a855f7', border: 'rgba(168, 85, 247, 0.35)' },
  cicd: { bg: 'rgba(20, 184, 166, 0.18)', color: '#14b8a6', border: 'rgba(20, 184, 166, 0.35)' },
  infrastructure: { bg: 'rgba(100, 116, 139, 0.18)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.35)' },
}

const COLUMN_CARD_TINTS: Record<string, string> = {
  todo: 'rgba(251, 191, 36, 0.04)',
  'in-progress': 'rgba(34, 197, 94, 0.04)',
  done: 'rgba(34, 197, 94, 0.03)',
}

interface TaskCardProps {
  key?: string
  task: Task
  index: number
  animKey: string
  columnStatus: "todo" | "in-progress" | "done"
  canDrag: boolean
  projects: any[]
}

function TaskCard({ task, index, animKey, columnStatus, canDrag, projects = [] }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task._id },
    canDrag: canDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const { data: membersData } = useQuery({
    queryKey: ['workspaceMembers'],
    queryFn: async () => {
      const response = await workspaceApi.getMembers(task.workspaceId || '')
      return response.data?.data || { activeMembers: [] }
    },
    enabled: !!task.workspaceId,
  })

  const activeMembers = membersData?.activeMembers?.filter(
    (m: any) => m.status === 'ACTIVE'
  ) || []

  const project = projects.find((p: any) => p._id === task.projectId)
  const assignedMember = activeMembers.find((m: any) => m.userId === task.assignedTo)

  const priorityConfig = {
    high: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'HIGH' },
    medium: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'MED' },
    low: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: 'LOW' },
  }

  const priority = priorityConfig[task.priority] || priorityConfig.medium
  const categoryStyle = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.infrastructure
  const columnTint = COLUMN_CARD_TINTS[columnStatus] || 'transparent'

  return (
    <motion.div
      key={`${task._id}-${animKey}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{
        scale: 1.01,
        y: -4,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(134, 239, 172, 0.2)',
      }}
    >
      <Link
        ref={drag as React.Ref<HTMLAnchorElement>}
        to={`/tasks/${task._id}`}
        className={`block p-3 rounded-xl cursor-move transition-all duration-200 ${
          isDragging ? 'opacity-50' : ''
        }`}
        style={{
          background: `linear-gradient(135deg, ${columnTint} 0%, transparent 60%), linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)`,
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Priority Badge */}
        <div className="flex items-center mb-2">
          <span
            className="px-1.5 py-0.5 text-[9px] font-bold rounded-md"
            style={{
              background: priority.bg,
              color: priority.color,
              border: `1px solid ${priority.color}40`,
            }}
          >
            {priority.label}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-bold text-white mb-2 text-sm leading-tight line-clamp-2">{task.title}</h4>

        {/* Category Badge */}
        <div className="mb-2">
          <span
            className="px-1.5 py-0.5 text-[9px] font-semibold rounded-md inline-block"
            style={{
              background: categoryStyle.bg,
              color: categoryStyle.color,
              border: `1px solid ${categoryStyle.border}`,
            }}
          >
            {task.category.toUpperCase()}
          </span>
        </div>

        {/* Project and Assignment */}
        <div className="flex items-center gap-1.5 mb-2">
          {assignedMember && (
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0" title={assignedMember.email || assignedMember.userId}>
              <span className="text-[9px] font-semibold text-primary">
                {getInitials(assignedMember.email || assignedMember.userId || 'U')}
              </span>
            </div>
          )}
          {project ? (
            <div className="flex items-center gap-1 text-[9px] text-secondary">
              <FolderKanban size={10} style={{ color: project.color }} />
              <span className="truncate max-w-[70px]">{project.name}</span>
            </div>
          ) : (
            <span className="text-[9px] text-secondary">No Project</span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-1 text-[9px]">
            <span className={`${
              isOverdue(task.dueDate) && task.status !== 'done' 
                ? 'text-red-400 font-medium' 
                : 'text-secondary'
            }`}>
              {getRelativeDate(task.dueDate)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5">
              <svg className="w-2.5 h-2.5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" />
              </svg>
              <span className="text-[9px] text-secondary">{task.comments?.length ?? 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

interface ColumnProps {
  key?: string
  column: typeof COLUMNS[0]
  tasks: Task[]
  onDrop: (taskId: string, status: string) => void
  animKey: string
  columnIndex: number
  userRole: string
  userId: string | undefined
  projects: any[]
}

function Column({ column, tasks, onDrop, animKey, columnIndex, userRole, userId, projects }: ColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item: { id: string }) => onDrop(item.id, column.status),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  // Determine if user can drag a task
  const canDragTask = (task: Task) => {
    // Owner and Admin can drag any task
    if (userRole === 'OWNER' || userRole === 'ADMIN') return true
    // Members can only drag tasks assigned to them
    if (userRole === 'MEMBER') return task.assignedTo === userId
    // Viewers cannot drag any task
    return false
  }

  return (
    <motion.div
      key={`col-${column.id}-${animKey}`}
      ref={drop as React.Ref<HTMLDivElement>}
      className={`flex-1 min-w-[260px] md:min-w-[300px] p-3 md:p-4 rounded-xl border transition-all duration-300 ${
        isOver 
          ? 'border-white/40 bg-[#14141a] shadow-lg' 
          : 'border-white/8 bg-[#121218]'
      }`}
      style={{
        boxShadow: isOver 
          ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
          : '0 1px 3px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)'
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: columnIndex * 0.1, duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ 
        backgroundColor: column.headerColor,
        border: `1px solid ${column.borderColor}20`
      }}>
        <div className="flex items-center gap-2">
          <span className="text-lg" style={{ color: column.borderColor }}>{column.icon}</span>
          <h3 className="font-semibold text-white text-sm">{column.title}</h3>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full text-white" style={{ 
          backgroundColor: column.borderColor,
          boxShadow: `0 2px 8px ${column.borderColor}40`
        }}>
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((task, index) => (
          <TaskCard 
            key={task._id} 
            task={task} 
            index={index} 
            animKey={animKey} 
            columnStatus={column.status} 
            canDrag={canDragTask(task)} 
            projects={projects}
          />
        ))}
      </div>
    </motion.div>
  )
}

function KanbanContent() {
  const location = useLocation()
  const animKey = location.key
  const queryClient = useQueryClient()
  const { currentWorkspace } = useWorkspace()
  const { user } = useAuth()
  const [filter, setFilter] = useState<string | null>(null)
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | 'my' | 'unassigned'>('all')
  const [showNewTask, setShowNewTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'cicd' as const,
    priority: 'medium' as const,
    dueDate: new Date().toISOString().split('T')[0],
    projectId: null as string | null,
    assignedTo: null as string | null,
  })

  const { data: members } = useQuery({
    queryKey: ['workspaceMembers', currentWorkspace?._id],
    queryFn: () => workspaceApi.getMembers(currentWorkspace?._id || ''),
    enabled: !!currentWorkspace?._id,
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', currentWorkspace?._id],
    queryFn: async () => {
      const response = await projectApi.getAll()
      return response.data?.data || []
    },
    enabled: !!currentWorkspace?._id,
  })

  // Get current user's role in the workspace
  // Defensive handling: ensure we have an array before calling .find()
  const membersArray = Array.isArray(members?.data?.activeMembers) 
    ? members.data.activeMembers 
    : Array.isArray(members?.data) 
      ? members.data 
      : []
  const currentUserMember = membersArray.find((m: any) => m.userId === user?.id)
  const userRole = currentUserMember?.role || 'MEMBER'
  const canCreate = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'MEMBER'

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', currentWorkspace?._id],
    queryFn: async () => {
      const response = await taskApi.getAll()

      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data as Task[]
      }

      if (Array.isArray(response.data)) {
        return response.data as Task[]
      }

      return [] as Task[]
    },
    enabled: !!currentWorkspace?._id,
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', currentWorkspace?._id] })
      toast.success('Task updated successfully')
    },
    onError: () => {
      toast.error('Failed to update task')
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', currentWorkspace?._id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setShowNewTask(false)
      setNewTask({
        title: '',
        description: '',
        category: 'cicd',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        projectId: null,
        assignedTo: null,
      })
      toast.success('Task created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create task')
    },
  })

  const handleDrop = (taskId: string, status: string) => {
    updateTaskMutation.mutate({ id: taskId, data: { status } })
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentWorkspace?._id) {
      toast.error('Please select a workspace first')
      return
    }
    if (!newTask.title.trim()) {
      toast.error('Title is required')
      return
    }
    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      priority: newTask.priority,
      status: 'todo',
      dueDate: newTask.dueDate,
      projectId: newTask.projectId,
      assignedTo: newTask.assignedTo,
      workspaceId: currentWorkspace._id,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  const allTasks = tasks || []
  
  // Apply category filter
  const categoryFilteredTasks = filter ? allTasks.filter((t) => t.category === filter) : allTasks
  
  // Apply assignee filter
  const assigneeFilteredTasks = categoryFilteredTasks.filter((t) => {
    if (assigneeFilter === 'my') {
      return t.assignedTo === user?.id
    }
    if (assigneeFilter === 'unassigned') {
      return !t.assignedTo
    }
    return true // 'all' - show all tasks
  })

  const getTasksByStatus = (status: string) => {
    return assigneeFilteredTasks.filter((t) => t.status === status)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div
        key={`header-${animKey}`}
        className="flex items-center justify-between flex-wrap gap-4 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="heading-xl gradient-text mb-1 text-2xl">Kanban Board</h1>
          <p className="text-secondary text-sm flex items-center gap-2">
            <span>{tasks?.length ?? 0} Tasks</span>
            <span className="text-white/20">•</span>
            <span>{projects?.length ?? 0} Projects</span>
            <span className="text-white/20">•</span>
            <span>Drag and drop to update status</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/15 transition-all">
            <Filter size={16} className="text-secondary" />
            <CategoryDropdown value={filter} onChange={setFilter} />
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 p-1">
            {[
              { value: 'all', label: 'All Tasks' },
              { value: 'my', label: 'My Tasks' },
              { value: 'unassigned', label: 'Unassigned' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setAssigneeFilter(option.value as 'all' | 'my' | 'unassigned')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  assigneeFilter === option.value
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {canCreate && (
            <button
              onClick={() => setShowNewTask(!showNewTask)}
              className="gradient-btn animate-pulse-glow flex items-center gap-2 px-4 py-2.5"
            >
              <Plus size={16} />
              <span className="hidden md:inline">New Task</span>
              <span className="md:hidden">New</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* New Task Modal */}
      <AnimatePresence>
        {showNewTask && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewTask(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300]"
              transition={{ duration: 0.2 }}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-[300] p-4">
              <motion.div
                key={`form-${animKey}`}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="relative w-full max-w-2xl bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="heading-lg text-white text-lg">Create New Task</h3>
                  <button
                    onClick={() => setShowNewTask(false)}
                    className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <X size={18} className="text-secondary" />
                  </button>
                </div>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="label-field text-sm mb-2 block">Title</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="input-field px-4 py-3 text-sm"
                      placeholder="Enter task title..."
                      required
                    />
                  </div>
                  <div>
                    <label className="label-field text-sm mb-2 block">Description</label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="input-field px-4 py-3 resize-none text-sm"
                      rows={3}
                      placeholder="Add a description..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative z-[400]">
                      <label className="label-field text-sm mb-2 block">Category</label>
                      <select
                        value={newTask.category}
                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value as typeof newTask.category })}
                        className="select-field px-4 py-3 text-sm"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="relative z-[400]">
                      <label className="label-field text-sm mb-2 block">Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as typeof newTask.priority })}
                        className="select-field px-4 py-3 text-sm"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative z-[400]">
                      <label className="label-field text-sm mb-2 block">Project</label>
                      <ProjectDropdown
                        value={newTask.projectId}
                        onChange={(value) => setNewTask({ ...newTask, projectId: value })}
                      />
                    </div>
                    <div className="relative z-[400]">
                      <label className="label-field text-sm mb-2 block">Assigned To</label>
                      <AssignedToDropdown
                        value={newTask.assignedTo}
                        onChange={(value) => setNewTask({ ...newTask, assignedTo: value })}
                      />
                    </div>
                  </div>
                  <div className="relative z-[400]">
                    <label className="label-field text-sm mb-2 block">Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="input-field px-4 py-3 text-sm"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <SecondaryButton
                      type="button"
                      onClick={() => setShowNewTask(false)}
                      className="px-6 py-2.5 text-sm"
                    >
                      Cancel
                    </SecondaryButton>
                    <PrimaryButton
                      type="submit"
                      disabled={createTaskMutation.isPending}
                      loading={createTaskMutation.isPending}
                      className="px-6 py-2.5 text-sm"
                    >
                      Create Task
                    </PrimaryButton>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 flex-1">
        {COLUMNS.map((column, index) => (
          <Column
            key={column.id}
            column={column}
            tasks={getTasksByStatus(column.status)}
            onDrop={handleDrop}
            animKey={animKey}
            columnIndex={index}
            userRole={userRole}
            userId={user?.id}
            projects={projects}
          />
        ))}
      </div>
    </div>
  )
}

export default function Kanban() {
  return (
    <DndProvider backend={HTML5Backend}>
      <KanbanContent />
    </DndProvider>
  )
}
