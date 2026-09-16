import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import UserMenu from './UserMenu'
import NotificationDropdown from './NotificationDropdown'
import { notificationApi } from '../lib/api'

export default function TopHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, isAuthenticated } = useAuth()
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [prevCount, setPrevCount] = useState(0)
  const badgeRef = useRef<HTMLSpanElement>(null)

  const fetchPendingCount = async () => {
    try {
      const response = await notificationApi.getInvitations()
      if (response.data.success) {
        setPendingCount(response.data.count || response.data.data?.length || 0)
      }
    } catch (error) {
      console.error('Failed to fetch pending count:', error)
    }
  }

  const handleCountChange = (count: number) => {
    setPendingCount(count)
  }

  // Badge pop animation when count changes
  useEffect(() => {
    if (pendingCount !== prevCount && pendingCount > 0) {
      if (badgeRef.current) {
        badgeRef.current.classList.remove('badge-pop')
        void badgeRef.current.offsetWidth // Trigger reflow
        badgeRef.current.classList.add('badge-pop')
      }
    }
    setPrevCount(pendingCount)
  }, [pendingCount, prevCount])

  // Fetch notifications on mount when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingCount()
    }
  }, [isAuthenticated])

  // Fetch notifications when user changes (after login)
  useEffect(() => {
    if (user) {
      fetchPendingCount()
    }
  }, [user])

  // Refetch on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        fetchPendingCount()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [isAuthenticated])

  return (
    <header
      className="h-12 md:h-14 backdrop-blur-lg border-b sticky top-0 z-50"
      style={{
        background: 'var(--color-navbar-glass)',
        borderColor: 'var(--color-border-primary)',
      }}
    >
      <div className="h-full px-3 md:px-4 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuClick}
            className="md:hidden p-1.5 rounded-lg transition-all text-white"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)' }
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent' }
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 cursor-pointer rounded-lg px-1.5 py-1 -ml-1.5 transition-opacity duration-200 hover:opacity-80"
            aria-label="Go to Dashboard"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="url(#paint0_linear)" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="url(#paint1_linear)" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="url(#paint2_linear)" strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="url(#paint3_linear)" strokeWidth="2"/>
              <defs>
                <linearGradient id="paint0_linear" x1="3" y1="3" x2="10" y2="10" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#86efac"/>
                  <stop offset="1" stopColor="#4ade80"/>
                </linearGradient>
                <linearGradient id="paint1_linear" x1="14" y1="3" x2="21" y2="10" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4ade80"/>
                  <stop offset="1" stopColor="#22c55e"/>
                </linearGradient>
                <linearGradient id="paint2_linear" x1="3" y1="14" x2="10" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22c55e"/>
                  <stop offset="1" stopColor="#86efac"/>
                </linearGradient>
                <linearGradient id="paint3_linear" x1="14" y1="14" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#86efac"/>
                  <stop offset="1" stopColor="#4ade80"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-lg font-bold text-white">OpsBoard</span>
          </Link>
        </div>

        {/* Right: Notification + User */}
        <div className="flex items-center gap-2 relative">
          {/* Notification */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-1.5 rounded-lg transition-all text-secondary hover:text-white relative"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)' }
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent' }
              aria-label="Notifications"
            >
              <Bell size={16} />
              {pendingCount > 0 && (
                <span
                  ref={badgeRef}
                  className="notification-badge absolute -top-1 -right-1 min-w-[18px] h-[18px] text-dark-bg text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                >
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>
            <NotificationDropdown
              isOpen={notificationOpen}
              onClose={() => {
                setNotificationOpen(false)
              }}
              onCountChange={handleCountChange}
            />
          </div>

          {/* User Menu */}
          <UserMenu
            username={user?.username || user?.name || 'User'}
            name={user?.name || user?.username || 'User'}
          />
        </div>
      </div>
    </header>
  )
}
