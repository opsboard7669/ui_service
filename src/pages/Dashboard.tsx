import { useQuery } from '@tanstack/react-query'
import { useLocation, Link } from 'react-router-dom'
import { taskApi, projectApi, workspaceApi } from '../lib/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Calendar, Users, FolderKanban, Mail, Crown, Shield, Eye, ArrowRight } from 'lucide-react'
import { formatDate, isOverdue, getCategoryColor, getPriorityColor, getInitials } from '../lib/utils'
import type { Task } from '../types'
import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import AnimatedCounter from '../components/AnimatedCounter'
import ProgressBar from '../components/ProgressBar'
import { useWorkspace } from '../contexts/WorkspaceContext'
import { useAuth } from '../contexts/AuthContext'

const CATEGORIES = ['cicd', 'kubernetes', 'aws', 'security', 'monitoring', 'infrastructure'] as const

const CATEGORY_COLORS: Record<string, string> = {
  cicd: '#86efac',
  kubernetes: '#4ade80',
  aws: '#22c55e',
  security: '#16a34a',
  monitoring: '#15803d',
  infrastructure: '#166534',
}

// const CATEGORY_BG_COLORS: Record<string, string> = {
//   cicd: 'rgba(59,130,246,0.1)',
//   kubernetes: 'rgba(139,92,246,0.1)',
//   aws: 'rgba(245,158,11,0.1)',
//   security: 'rgba(239,68,68,0.1)',
//   monitoring: 'rgba(16,185,129,0.1)',
//   infrastructure: 'rgba(6,182,212,0.1)',
// }

const CATEGORY_LABELS: Record<string, string> = {
  cicd: 'CI/CD',
  kubernetes: 'Kubernetes',
  aws: 'AWS',
  security: 'Security',
  monitoring: 'Monitoring',
  infrastructure: 'Infrastructure',
}

export default function Dashboard() {
  const location = useLocation()
  const animKey = location.key
  const { currentWorkspace, getAvailableWidgets, userRole } = useWorkspace()
  const { user } = useAuth()

  const availableWidgets = getAvailableWidgets()

  const { data: members } = useQuery({
    queryKey: ['workspaceMembers', currentWorkspace?._id],
    queryFn: () => workspaceApi.getMembers(currentWorkspace?._id || ''),
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
  const displayRole = currentUserMember?.role || userRole || 'MEMBER'
  const isOwner = displayRole === 'OWNER'
  const isAdmin = displayRole === 'ADMIN'
  const isMember = displayRole === 'MEMBER' || displayRole === 'VIEWER'
  const canManage = isOwner || isAdmin

  // Calculate workspace statistics for owners
  const activeMembersCount = membersArray.length
  const pendingInvitationsCount = Array.isArray(members?.data?.pendingInvitations) 
    ? members.data.pendingInvitations.length 
    : 0

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

      if (Array.isArray(response.data?.data)) {
        return response.data.data as Task[]
      }

      if (Array.isArray(response.data?.tasks)) {
        return response.data.tasks as Task[]
      }

      return [] as Task[]
    },
    enabled: !!currentWorkspace?._id,
  })

  const { data: projectStatistics = { totalProjects: 0, activeProjects: 0, archivedProjects: 0 } } = useQuery({
    queryKey: ['projectStatistics', currentWorkspace?._id],
    queryFn: async () => {
      if (!currentWorkspace?._id) return { totalProjects: 0, activeProjects: 0, archivedProjects: 0 }
      try {
        const response = await projectApi.getStatistics(currentWorkspace._id)
        return response.data?.data || { totalProjects: 0, activeProjects: 0, archivedProjects: 0 }
      } catch (error) {
        console.error('Failed to fetch project statistics:', error)
        return { totalProjects: 0, activeProjects: 0, archivedProjects: 0 }
      }
    },
    enabled: !!currentWorkspace?._id,
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  const allTasks = Array.isArray(tasks) ? tasks : []
  
  // For Members, filter to only show assigned tasks
  const filteredTasks = isMember 
    ? allTasks.filter((t) => t.assignedTo === user?.id)
    : allTasks

  const completedTasks = filteredTasks.filter((t) => t.status === 'done')
  const completionRate = filteredTasks.length > 0 ? Math.round((completedTasks.length / filteredTasks.length) * 100) : 0

  const categoryData = CATEGORIES.map((cat) => ({
    name: cat.toUpperCase(),
    value: filteredTasks.filter((t) => t.category === cat).length,
    color: CATEGORY_COLORS[cat],
  })).filter((d) => d.value > 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaysTasks = filteredTasks.filter((t) => {
    const dueDate = new Date(t.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate.getTime() === today.getTime() && t.status !== 'done'
  })

  const overdueTasks = filteredTasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'done')

  // Build stats based on available widgets
  const stats = []
  
  if (availableWidgets.includes('my-tasks')) {
    stats.push({
      label: 'My Tasks',
      value: filteredTasks.length,
      icon: TrendingUp,
      iconClass: 'text-white',
      hoverShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
      delay: 0.1,
      borderColor: '#3b82f6',
    })
  }
  
  if (availableWidgets.includes('tasks')) {
    stats.push({
      label: 'Completed',
      value: completedTasks.length,
      icon: CheckCircle2,
      iconClass: 'text-white',
      hoverShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
      delay: 0.2,
      borderColor: '#10b981',
    })
    stats.push({
      label: 'Completion Rate',
      value: completionRate,
      suffix: '%',
      icon: Clock,
      iconClass: 'text-white',
      hoverShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
      delay: 0.3,
      borderColor: '#8b5cf6',
    })
    stats.push({
      label: 'Overdue',
      value: overdueTasks.length,
      icon: AlertTriangle,
      iconClass: 'text-white',
      hoverShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
      delay: 0.4,
      borderColor: '#ef4444',
    })
  }

  // Owner-specific stats based on widgets
  const ownerStats = []
  
  if (availableWidgets.includes('team-members')) {
    ownerStats.push({
      label: 'Members',
      value: activeMembersCount,
      suffix: '',
      icon: Users,
      iconClass: 'text-white',
      hoverShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
      delay: 0.1,
      borderColor: '#3b82f6',
    })
  }
  
  if (availableWidgets.includes('pending-invitations')) {
    ownerStats.push({
      label: 'Pending Invitations',
      value: pendingInvitationsCount,
      suffix: '',
      icon: Mail,
      iconClass: 'text-white',
      hoverShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
      delay: 0.2,
      borderColor: '#f59e0b',
    })
  }
  
  if (availableWidgets.includes('projects')) {
    ownerStats.push({
      label: 'Projects',
      value: projectStatistics.totalProjects,
      suffix: '',
      icon: FolderKanban,
      iconClass: 'text-white',
      hoverShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
      delay: 0.3,
      borderColor: '#06b6d4',
    })
  }
  
  if (availableWidgets.includes('tasks')) {
    ownerStats.push({
      label: 'Tasks',
      value: allTasks.length,
      suffix: '',
      icon: TrendingUp,
      iconClass: 'text-white',
      hoverShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
      delay: 0.4,
      borderColor: '#10b981',
    })
  }

  return (
    <div className="space-y-3 md:space-y-4 h-full overflow-y-auto overflow-x-hidden pb-16">
      {/* Header */}
      <motion.div
        key={`header-${animKey}`}
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="heading-xl gradient-text mb-1">
            {currentWorkspace ? `${currentWorkspace.name} Dashboard` : 'Dashboard'}
          </h1>
          <p className="text-secondary text-xs">
            {currentWorkspace ? `Overview of tasks in ${currentWorkspace.name}` : 'Overview of your tasks'}
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={`stat-${stat.label}-${animKey}`}
              className="glass-card card-hover relative"
              style={{ borderLeft: `3px solid ${stat.borderColor}` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay, duration: 0.4 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-secondary text-[10px] md:text-xs mb-1">{stat.label}</p>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                  </h3>
                </div>
                <div className={`p-1.5 md:p-2 rounded-md bg-white/5 ${stat.iconClass}`}>
                  <Icon size={14} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Owner Dashboard Section - Only for Owners/Admins */}
      {canManage && (
        <>
          {/* Owner Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
            {ownerStats.map((stat) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={`owner-stat-${stat.label}-${animKey}`}
                  className="glass-card card-hover relative"
                  style={{ borderLeft: `3px solid ${stat.borderColor}` }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: stat.delay, duration: 0.4 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-secondary text-[10px] md:text-xs mb-1">{stat.label}</p>
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                      </h3>
                    </div>
                    <div className={`p-1.5 md:p-2 rounded-md bg-white/5 ${stat.iconClass}`}>
                      <Icon size={14} />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Team Members Preview */}
          {membersArray.length > 0 && (
            <motion.div
              key={`team-preview-${animKey}`}
              className="glass-card card-hover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="heading-lg text-white">Team Members</h3>
                <Link
                  to="/members"
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  View All
                  <ArrowRight size={12} />
                </Link>
              </div>
              <div className="space-y-2">
                {membersArray.slice(0, 5).map((member: any, index: number) => (
                  <motion.div
                    key={member._id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                        {getInitials(member.name || member.email || '?')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{member.name || 'Unknown User'}</p>
                        <div className="flex items-center gap-1.5">
                          {member.role === 'OWNER' && <Crown size={10} className="text-yellow-400" />}
                          {member.role === 'ADMIN' && <Shield size={10} className="text-purple-400" />}
                          {member.role === 'VIEWER' && <Eye size={10} className="text-gray-400" />}
                          <span className="text-xs text-secondary">{member.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${member.status === 'ACTIVE' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                      <span className="text-xs text-secondary">
                        {member.status === 'ACTIVE' ? 'Active' : 'Pending'}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {membersArray.length > 5 && (
                  <div className="text-center pt-2">
                    <Link
                      to="/members"
                      className="text-xs text-primary hover:text-primary/80 flex items-center justify-center gap-1 transition-colors"
                    >
                      +{membersArray.length - 5} more members
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Workspace Information Card */}
          <motion.div
            key={`workspace-info-${animKey}`}
            className="glass-card card-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <h3 className="heading-lg text-white mb-3">Workspace Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Workspace Name</p>
                <p className="text-sm font-medium text-white">{currentWorkspace?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Owner</p>
                <p className="text-sm font-medium text-white">
                  {membersArray.find((m: any) => m.role === 'OWNER')?.name || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Created</p>
                <p className="text-sm font-medium text-white">
                  {currentWorkspace?.createdAt ? formatDate(currentWorkspace.createdAt) : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Total Members</p>
                <p className="text-sm font-medium text-white">{activeMembersCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Projects</p>
                <p className="text-sm font-medium text-white">{projectStatistics.totalProjects}</p>
              </div>
              <div>
                <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Tasks</p>
                <p className="text-sm font-medium text-white">{allTasks.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Pending Invitations</p>
                <p className="text-sm font-medium text-white">{pendingInvitationsCount}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Category Cards */}
      <div>
        <motion.h3
          key={`cat-title-${animKey}`}
          className="heading-lg text-white mb-2 md:mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Categories
        </motion.h3>
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-1.5 md:gap-2">
          {CATEGORIES.map((cat, index) => {
            const count = filteredTasks.filter((t) => t.category === cat).length
            const done = filteredTasks.filter((t) => t.category === cat && t.status === 'done').length
            return (
              <motion.div
                key={`cat-${cat}-${animKey}`}
                className="glass-card card-hover category-card-glow text-center"
                style={{
                  borderLeft: `2px solid ${CATEGORY_COLORS[cat]}`,
                } as CSSProperties}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.35 }}
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  borderColor: CATEGORY_COLORS[cat],
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mx-auto mb-1.5"
                  style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                />
                <h4 className="text-[9px] md:text-[10px] font-medium text-white mb-1 uppercase tracking-wide">{CATEGORY_LABELS[cat]}</h4>
                <p className="text-sm md:text-base font-bold text-white">
                  <AnimatedCounter value={count} resetKey={animKey} duration={800} />
                </p>
                <p className="text-[9px] md:text-[10px] text-secondary mt-0.5">{done} done</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Progress Bars */}
      <motion.div
        key={`progress-${animKey}`}
        className="glass-card card-hover"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h3 className="heading-lg text-white mb-2 md:mb-3">Progress by Category</h3>
        <div className="space-y-1.5 md:space-y-2">
          {CATEGORIES.map((cat, index) => {
            const catTasks = filteredTasks.filter((t) => t.category === cat)
            const catDone = catTasks.filter((t) => t.status === 'done').length
            return (
              <ProgressBar
                key={`progress-${cat}-${animKey}`}
                label={CATEGORY_LABELS[cat]}
                value={catDone}
                max={catTasks.length || 1}
                color={CATEGORY_COLORS[cat]}
                resetKey={animKey}
                delay={0.1 * index}
              />
            )
          })}
        </div>
      </motion.div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">
        {/* Pie Chart */}
        <motion.div
          key={`pie-${animKey}`}
          className="glass-card card-hover"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h3 className="heading-lg text-white mb-2 md:mb-3">Task Distribution by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart key={`chart-${animKey}`}>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  isAnimationActive
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}-${animKey}`} fill={entry.color} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-secondary text-center py-6 md:py-8 text-xs">No tasks to display</p>
          )}
        </motion.div>

        {/* Today's Tasks */}
        <motion.div
          key={`today-${animKey}`}
          className="glass-card card-hover"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <h3 className="heading-lg text-white">Today's Tasks</h3>
            <Calendar className="text-white" size={14} />
          </div>
          {todaysTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-10">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mb-4 shadow-md">
                <Calendar size={32} className="text-primary" />
              </div>
              <p className="text-secondary text-sm text-center">No tasks due today</p>
            </div>
          ) : (
            <div className="space-y-1.5 md:space-y-2">
              {todaysTasks.map((task, index) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link
                    to={`/tasks/${task._id}`}
                    className="block p-2 md:p-3 card-inner card-hover"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1 text-xs">{task.title}</h4>
                        <div className="flex flex-wrap items-center gap-1">
                          <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getCategoryColor(task.category)}`}>
                            {task.category}
                          </span>
                          <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <motion.div
          key={`overdue-${animKey}`}
          className="glass-card card-hover"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <h3 className="heading-lg text-white">Overdue Tasks</h3>
            <AlertTriangle className="text-white" size={14} />
          </div>
          <div className="space-y-1.5 md:space-y-2">
            {overdueTasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  to={`/tasks/${task._id}`}
                  className="block p-2 md:p-3 bg-white/5 border border-white/15 rounded-md card-hover"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1 text-xs">{task.title}</h4>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-white text-[9px] md:text-[10px]">Due: {formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
