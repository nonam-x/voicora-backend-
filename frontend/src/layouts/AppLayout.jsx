import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  RiDashboardLine,
  RiAddLine,
  RiBarChartBoxLine,
  RiSettings4Line,
  RiSearchLine,
  RiNotification3Line,
  RiUserLine,
  RiMenuLine,
  RiCloseLine,
  RiLogoutBoxLine,
} from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import { pollApi } from '../services/api'

const sidebarLinks = [
  { label: 'Dashboard', to: '/app', icon: RiDashboardLine, end: true },
  { label: 'Create Poll', to: '/app/create', icon: RiAddLine },
]

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [recentPolls, setRecentPolls] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Fetch recent polls for the sidebar
  useEffect(() => {
    pollApi.getMyPolls()
      .then((res) => {
        const polls = res.data.data || []
        setRecentPolls(polls.slice(0, 3))
      })
      .catch(() => {
        // Silently fail — sidebar just won't show recent polls
      })
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 bg-bg-base border-r border-border-subtle flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center gap-2 px-5 border-b border-border-subtle shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <img src="/voicora-logo.png" alt="Voicora" width="20" height="20" className="invert" />
            <span className="text-[14px] font-semibold text-text-primary tracking-tight">Voicora</span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-bg-secondary text-text-primary'
                    : 'text-text-faint hover:text-text-secondary hover:bg-bg-elevated'
                }`
              }
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </NavLink>
          ))}

          <div className="pt-4 mt-4 border-t border-border-subtle">
            <p className="px-3 mb-2 text-[10px] font-medium tracking-widest uppercase text-text-faint">Recent Polls</p>
            {recentPolls.length > 0 ? (
              recentPolls.map((poll) => (
                <Link
                  key={poll._id}
                  to={`/app/analytics/${poll._id}`}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] text-text-faint hover:text-text-secondary hover:bg-bg-elevated transition-colors"
                >
                  <RiBarChartBoxLine className="w-3 h-3 shrink-0" />
                  <span className="truncate">{poll.title}</span>
                </Link>
              ))
            ) : (
              <p className="px-3 text-[11px] text-text-faint/50">No polls yet</p>
            )}
          </div>
        </nav>

        {/* Bottom — user info + logout */}
        <div className="px-3 py-3 border-t border-border-subtle space-y-1">
          {user && (
            <div className="px-3 py-2">
              <p className="text-[12px] font-medium text-text-secondary truncate">{user.name}</p>
              <p className="text-[10px] text-text-faint truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-text-faint hover:text-red-400 hover:bg-bg-elevated transition-colors w-full"
          >
            <RiLogoutBoxLine className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="h-14 flex items-center justify-between px-5 border-b border-border-subtle bg-bg-base/80 backdrop-blur-sm sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-text-faint hover:text-text-primary transition-colors"
            >
              {sidebarOpen ? <RiCloseLine className="w-5 h-5" /> : <RiMenuLine className="w-5 h-5" />}
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[13px]">
              <span className="text-text-faint">Voicora</span>
              <span className="text-text-faint">/</span>
              <span className="text-text-primary font-medium">
                {location.pathname === '/app' && 'Dashboard'}
                {location.pathname === '/app/create' && 'Create Poll'}
                {location.pathname.includes('/app/analytics') && 'Analytics'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-subtle text-text-faint">
              <RiSearchLine className="w-3.5 h-3.5" />
              <span className="text-[12px]">Search...</span>
              <kbd className="ml-4 text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-faint border border-border-subtle">⌘K</kbd>
            </div>

            <button className="p-2 rounded-lg text-text-faint hover:text-text-primary hover:bg-bg-secondary transition-colors relative">
              <RiNotification3Line className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-violet" />
            </button>

            <button className="w-7 h-7 rounded-full bg-accent-violet/20 border border-accent-violet/30 flex items-center justify-center text-[10px] font-bold text-accent-violet">
              {user?.name?.charAt(0)?.toUpperCase() || <RiUserLine className="w-3.5 h-3.5 text-text-faint" />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
