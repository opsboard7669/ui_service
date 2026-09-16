import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import ProjectDropdown from './ProjectDropdown'
import AssignedToDropdown from './AssignedToDropdown'
import { PrimaryButton, SecondaryButton } from './Button'

const CATEGORIES = ['cicd', 'kubernetes', 'aws', 'security', 'monitoring', 'infrastructure'] as const

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isSubmitting: boolean
  workspaceId?: string
  projectId?: string | null
  defaultStatus?: string
}

export default function CreateTaskModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting,
  workspaceId,
  projectId,
  defaultStatus = 'todo'
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('cicd' as const)
  const [priority, setPriority] = useState('medium' as const)
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projectId || null)
  const [assignedTo, setAssignedTo] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: defaultStatus,
      dueDate,
      projectId: selectedProjectId,
      assignedTo,
      workspaceId,
    })
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setCategory('cicd')
    setPriority('medium')
    setDueDate(new Date().toISOString().split('T')[0])
    setSelectedProjectId(projectId || null)
    setAssignedTo(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
                <h3 className="heading-lg text-white text-lg">Create New Task</h3>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X size={18} className="text-secondary" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-field text-sm mb-2 block">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field px-4 py-3 text-sm"
                    placeholder="Enter task title..."
                    required
                  />
                </div>
                <div>
                  <label className="label-field text-sm mb-2 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field px-4 py-3 resize-none text-sm"
                    rows={3}
                    placeholder="Add a description..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative z-[400]">
                    <label className="label-field text-sm mb-2 block">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as typeof category)}
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
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as typeof priority)}
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
                      value={selectedProjectId}
                      onChange={(value) => setSelectedProjectId(value)}
                    />
                  </div>
                  <div className="relative z-[400]">
                    <label className="label-field text-sm mb-2 block">Assigned To</label>
                    <AssignedToDropdown
                      value={assignedTo}
                      onChange={(value) => setAssignedTo(value)}
                    />
                  </div>
                </div>
                <div className="relative z-[400]">
                  <label className="label-field text-sm mb-2 block">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input-field px-4 py-3 text-sm"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <SecondaryButton
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2.5 text-sm"
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    loading={isSubmitting}
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
  )
}
