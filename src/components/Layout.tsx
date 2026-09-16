import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './PageTransition'
import TopHeader from './TopHeader'
import Sidebar from './Sidebar'

export default function Layout() {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="h-screen bg-dark-bg overflow-hidden flex flex-col">
      <div className="flex-shrink-0 z-50">
        <TopHeader onMenuClick={() => setMobileSidebarOpen(true)} />
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <Sidebar
              isMobile
              onClose={() => setMobileSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main
          className={`flex-1 h-full overflow-y-auto overflow-x-hidden transition-all duration-300 ${
            sidebarCollapsed ? 'md:ml-16' : 'md:ml-[260px]'
          }`}
        >
          <div className="p-2 md:p-3 h-full">
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname} pageKey={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
