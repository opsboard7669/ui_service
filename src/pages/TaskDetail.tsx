import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { taskApi, projectApi, workspaceApi } from '../lib/api'
import { ArrowLeft, Edit2, Trash2, Save, X, MessageSquare, Calendar, Clock, AlertCircle, FolderKanban, User } from 'lucide-react'
import { formatDate, isOverdue, getCategoryColor, getPriorityColor, getStatusColor, getInitials } from '../lib/utils'
import type { Task, Comment } from '../types'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import ProjectDropdown from '../components/ProjectDropdown'
import AssignedToDropdown from '../components/AssignedToDropdown'
import { useWorkspace } from '../contexts/WorkspaceContext'

const CATEGORIES = ['cicd', 'kubernetes', 'aws', 'security', 'monitoring', 'infrastructure'] as const

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const animKey = location.key
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { currentWorkspace } = useWorkspace()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
   title: '',
   description: '',
   category: 'cicd' as Task['category'],
   priority: 'medium' as Task['priority'],
   status: 'todo' as Task['status'],
   dueDate: '',
   projectId: null as string | null,
   assignedTo: null as string | null,
 })
  const [newComment, setNewComment] = useState('')

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await taskApi.getById(id!)

      if (response.data?.success && response.data.data) {
        return response.data.data as Task
      }

      throw new Error('Failed to fetch task')
    },
    enabled: !!id && !!currentWorkspace?._id,
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectApi.getAll()
      return response.data?.data || []
    },
    enabled: !!currentWorkspace?._id,
  })

  const { data: membersData } = useQuery({
    queryKey: ['workspaceMembers', task?.workspaceId],
    queryFn: async () => {
      if (!task?.workspaceId) return { activeMembers: [] }
      const response = await workspaceApi.getMembers(task.workspaceId)
      return response.data?.data || { activeMembers: [] }
    },
    enabled: !!task?.workspaceId,
  })

  const activeMembers = membersData?.activeMembers?.filter(
    (m: any) => m.status === 'ACTIVE'
  ) || []

  const project = projects.find((p: any) => p._id === task?.projectId)
  const assignedMember = activeMembers.find((m: any) => m.userId === task?.assignedTo)

  const { data: comments = [] } = useQuery({
    queryKey: ['task', id, 'comments'],
    queryFn: async () => {
      const response = await taskApi.getComments(id!)

      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data as Comment[]
      }

      return [] as Comment[]
    },
    enabled: !!id && !!currentWorkspace?._id,
  })

  const updateTaskMutation = useMutation({
    mutationFn: (data: any) => taskApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setIsEditing(false)
      toast.success('Task updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update task')
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: () => taskApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      navigate('/kanban')
    },
  })

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => taskApi.addComment(id!, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['task', id, 'comments'] })
      setNewComment('')
    },
  })

  const handleEdit = () => {
    if (task) {
      setEditForm({
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        projectId: task.projectId || null,
        assignedTo: task.assignedTo || null,
      })
      setIsEditing(true)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateTaskMutation.mutate(editForm)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate()
    }
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary">Task not found</p>
        <Link to="/kanban" className="text-white hover:text-gray-300 mt-4 inline-block">
          Back to Kanban
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      key={animKey}
      className="space-y-3 md:space-y-6 h-full overflow-y-auto overflow-x-hidden pb-20"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="flex items-center space-x-2 md:space-x-4">
        <Link
          to="/kanban"
          className="p-1.5 md:p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={18} className="text-secondary" />
        </Link>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="text-xl md:text-3xl font-bold bg-transparent border-b-2 border-white text-white outline-none w-full"
            />
          ) : (
            <h1 className="heading-lg md:heading-xl text-white truncate">{task.title}</h1>
          )}
        </div>
        <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-1.5 md:p-2 rounded-lg transition-all duration-300 text-white"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)' }
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)' }
              >
                <Save size={16} />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 md:p-2 rounded-lg transition-all duration-300 text-white"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)' }
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)' }
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="p-1.5 md:p-2 rounded-lg transition-all duration-300 text-white"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)' }
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)' }
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 md:p-2 rounded-lg transition-all duration-300 text-white"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)' }
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)' }
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Task Details */}
      <div className="glass-card card-hover">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 md:space-y-6">
            <div>
              <label className="label-field text-xs md:text-sm">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="input-field px-3 md:px-4 py-2 md:py-3 resize-none text-xs md:text-sm"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="label-field text-xs md:text-sm">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                  className="select-field px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field text-xs md:text-sm">Priority</label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
                  className="select-field px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="label-field text-xs md:text-sm">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="select-field px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm"
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="label-field text-xs md:text-sm">Due Date</label>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="input-field px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="label-field text-xs md:text-sm">Project</label>
                <ProjectDropdown
                  value={editForm.projectId}
                  onChange={(value) => setEditForm({ ...editForm, projectId: value })}
                />
              </div>
              <div>
                <label className="label-field text-xs md:text-sm">Assigned To</label>
                <AssignedToDropdown
                  value={editForm.assignedTo}
                  onChange={(value) => setEditForm({ ...editForm, assignedTo: value })}
                />
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4 md:space-y-6">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-secondary mb-1 md:mb-2">Description</h3>
              <p className="text-white whitespace-pre-wrap text-xs md:text-sm">{task.description || 'No description'}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 md:gap-3">
              <div className="flex items-center space-x-2">
                <span className={`px-2 md:px-3 py-0.5 md:py-1 text-xs rounded-lg border ${getCategoryColor(task.category)}`}>
                  {task?.category?.toUpperCase() ?? "N/A"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 md:px-3 py-0.5 md:py-1 text-xs rounded-lg border ${getPriorityColor(task.priority)}`}>
                  {task?.priority?.toUpperCase() ?? "N/A"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 md:px-3 py-0.5 md:py-1 text-xs rounded-lg border ${getStatusColor(task.status)}`}>
                  {task?.status?.toUpperCase() ?? "N/A"}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0 text-xs md:text-sm">
              <div className="flex items-center space-x-2 text-secondary">
                <Calendar size={14} />
                <span>Due: {formatDate(task.dueDate)}</span>
                {isOverdue(task.dueDate) && task.status !== 'done' && (
                  <span className="text-white flex items-center space-x-1">
                    <AlertCircle size={12} />
                    <span>Overdue</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-secondary">
                <Clock size={14} />
                <span>Created: {formatDate(task.createdAt)}</span>
              </div>
            </div>

            {/* Project and Assignment Info */}
            <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <FolderKanban size={14} className="text-secondary" />
                <span className="text-secondary">Project:</span>
                {project ? (
                  <span className="text-white flex items-center gap-1">
                    <span style={{ color: project.color }}>{project.name}</span>
                  </span>
                ) : (
                  <span className="text-secondary">No Project</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <User size={14} className="text-secondary" />
                <span className="text-secondary">Assigned To:</span>
                {assignedMember ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-[10px] font-medium text-primary">
                        {getInitials(assignedMember.email || assignedMember.userId || 'U')}
                      </span>
                    </div>
                    <span className="text-white">{assignedMember.email || assignedMember.userId}</span>
                  </div>
                ) : (
                  <span className="text-secondary">Unassigned</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="glass-card card-hover">
        <div className="flex items-center space-x-2 mb-3 md:mb-6">
          <MessageSquare size={18} className="text-white" />
          <h3 className="heading-lg text-white">Comments ({comments.length})</h3>
        </div>

        {/* Add Comment */}
        <form onSubmit={handleAddComment} className="mb-3 md:mb-6">
          <div className="flex space-x-2 md:space-x-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 input-field px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm"
            />
            <button type="submit" className="gradient-btn px-3 md:px-6 text-xs md:text-sm">
              Add
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-2 md:space-y-4">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-10">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mb-4 shadow-md">
                <MessageSquare size={32} className="text-primary" />
              </div>
              <p className="text-secondary text-sm text-center">No comments yet</p>
            </div>
          ) : (
            comments.map((comment, index) => (
              <div
                key={comment._id ?? comment.id ?? `comment-${index}-${comment.createdAt}`}
                className="p-3 md:p-4 card-inner card-hover"
              >
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <span className="text-[10px] md:text-sm text-secondary">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-white text-xs md:text-sm">{comment.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}
