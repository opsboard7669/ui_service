import { LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

interface SidebarItemProps {
  icon: LucideIcon
  label: string
  path: string
  collapsed?: boolean
  onClick?: () => void
}

export default function SidebarItem({ icon: Icon, label, path, collapsed = false, onClick }: SidebarItemProps) {
  const location = useLocation()
  const isActive = location.pathname === path

  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl transition-all duration-200 group relative ${
        collapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'
      } ${
        isActive
          ? 'bg-gradient-to-r from-white/15 to-white/5 text-white border border-white/15 shadow-lg'
          : 'text-secondary hover:text-white hover:bg-white/8'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-green-500 rounded-r-full" />
      )}
      <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-white transition-colors'}`} />
      {!collapsed && <span className="font-medium text-sm">{label}</span>}
    </Link>
  )
}
