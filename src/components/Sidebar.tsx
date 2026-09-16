import { useState } from 'react'
import { LayoutDashboard, KanbanSquare, FolderKanban, Users, Calendar, BarChart3, Settings, Mail, LogOut, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useWorkspace } from '../contexts/WorkspaceContext'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import SidebarItem from './SidebarItem'
import ContactUsModal from './ContactUsModal'
import toast from 'react-hot-toast'

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  isMobile?: boolean
  onClose?: () => void
}

const navItemClass = (collapsed: boolean, disabled = false) =>
  `flex items-center gap-3 rounded-lg transition-all duration-200 w-full text-left ${
    collapsed ? 'justify-center px-0 py-3' : 'px-3 py-3'
  } ${
    disabled
      ? 'text-secondary/50 cursor-not-allowed'
      : 'text-secondary hover:text-white hover:bg-white/6'
  }`

export default function Sidebar({ collapsed = false, onToggle, isMobile = false, onClose }: SidebarProps) {
  const { logout } = useAuth()
  const { canAccessNavigation } = useWorkspace()
  const [contactOpen, setContactOpen] = useState(false)

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', navKey: 'dashboard' },
    { icon: KanbanSquare, label: 'Kanban', path: '/kanban', navKey: 'kanban' },
    { icon: FolderKanban, label: 'Projects', path: '/projects', navKey: 'projects' },
    { icon: Users, label: 'Members', path: '/members', navKey: 'members' },
    { icon: Settings, label: 'Workspace Settings', path: '/workspace-settings', navKey: 'workspace-settings' },
  ]

  const futureNavItems = [
    { icon: Calendar, label: 'Calendar', path: '#', disabled: true, navKey: 'calendar' },
    { icon: BarChart3, label: 'Analytics', path: '#', disabled: true, navKey: 'analytics' },
  ]

  // Filter nav items based on permissions
  const filteredMainNavItems = mainNavItems.filter(item => 
    canAccessNavigation(item.navKey)
  )

  const filteredFutureNavItems = futureNavItems.filter(item => {
    if (item.disabled) return canAccessNavigation(item.navKey)
    return canAccessNavigation(item.navKey)
  })

  const handleLogout = () => {
    logout()
    toast.success('Logging out...', { icon: '👋' })
    if (onClose) onClose()
  }

  const handleContact = () => {
    setContactOpen(true)
    if (onClose) onClose()
  }

  return (
    <>
      <aside
        className={`fixed left-0 top-12 md:top-14 h-[calc(100vh-48px)] md:h-[calc(100vh-56px)] backdrop-blur-lg border-r transition-all duration-300 z-40 ${
          isMobile
            ? 'w-[272px] transform translate-x-0'
            : collapsed
            ? 'w-16'
            : 'w-[260px]'
        }`}
        style={{
          background: 'var(--color-navbar-glass)',
          borderColor: 'var(--color-border-primary)',
        }}
      >
        <div className="h-full flex flex-col px-4 py-4">
          {/* Workspace Switcher */}
          <div className="mb-4 flex-shrink-0">
            <WorkspaceSwitcher />
          </div>

          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto transition-all duration-300 -mx-4 px-4">
            <div>
              <p
                className={`text-[11px] font-semibold text-secondary/80 uppercase tracking-widest mb-2 px-3 ${
                  collapsed ? 'hidden' : 'mt-0'
                }`}
              >
                Main
              </p>
              <div className="space-y-1">
                {filteredMainNavItems.map((item) => (
                  <SidebarItem
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    collapsed={collapsed}
                    onClick={isMobile ? onClose : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Future Placeholders */}
            <div className="mt-5">
              <p
                className={`text-[11px] font-semibold text-secondary/80 uppercase tracking-widest mb-2 px-3 ${
                  collapsed ? 'hidden' : ''
                }`}
              >
                Coming Soon
              </p>
              <div className="space-y-1">
                {filteredFutureNavItems.map((item) => (
                  <button
                    key={item.label}
                    disabled={item.disabled}
                    onClick={() => toast(`${item.label} coming soon`, { icon: '🚧' })}
                    className={navItemClass(collapsed, item.disabled)}
                  >
                    <item.icon size={20} className="flex-shrink-0" />
                    {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex-shrink-0 space-y-1 pt-4 mt-2 border-t" style={{ borderColor: 'var(--color-border-primary)' }}>
            <button onClick={handleContact} className={navItemClass(collapsed)}>
              <Mail size={20} className="flex-shrink-0" />
              {!collapsed && <span className="font-medium text-sm">Contact Us</span>}
            </button>
            <button onClick={handleLogout} className={navItemClass(collapsed)}>
              <LogOut size={20} className="flex-shrink-0" />
              {!collapsed && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>

          {/* Collapse Toggle (Desktop only) */}
          {!isMobile && (
            <button
              onClick={onToggle}
              className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
              style={{
                background: 'var(--color-primary-500)',
                boxShadow: 'var(--shadow-primary-sm)',
              }}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Close Button */}
      {isMobile && (
        <button
          onClick={onClose}
          className="fixed top-12 md:top-14 right-4 z-50 p-1.5 rounded-lg backdrop-blur-lg text-white transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          <X size={16} />
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        />
      )}

      <ContactUsModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  )
}
