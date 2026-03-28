import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../store/AuthContext'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../store/ThemeContext'
import { NotificationBell } from '../ui/NotificationBell'
import { BookOpen, LogOut, LogIn, Sun, Moon, Bookmark, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { user } = useAuthContext()
  const { signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-navy-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-electric-500 flex items-center justify-center shadow-lg shadow-electric-500/30 group-hover:shadow-electric-500/50 transition-shadow">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-display font-semibold text-white text-lg tracking-tight">
            Kay<span className="text-gradient">Academy</span>
          </span>
        </Link>

        {/* Center nav — desktop only */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/catalog" className="btn-ghost text-sm">Courses</Link>
          {user && <Link to="/dashboard" className="btn-ghost text-sm">My Learning</Link>}
          {user && <Link to="/bookmarks" className="btn-ghost text-sm flex items-center gap-1.5">
            <Bookmark size={14} /> Saved
          </Link>}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="btn-ghost p-2 rounded-lg"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark'
              ? <Sun size={17} className="text-slate-400 hover:text-amber-400 transition-colors" />
              : <Moon size={17} className="text-slate-600 hover:text-electric-400 transition-colors" />
            }
          </button>

          {/* Notification bell — only for logged in users */}
          {user && <NotificationBell />}

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-electric-500/20 border border-electric-500/30 flex items-center justify-center text-electric-400 text-xs font-bold">
                    {user.user_metadata?.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
                  </div>
                </button>
                <button onClick={signOut} className="btn-ghost text-sm flex items-center gap-2">
                  <LogOut size={15} />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm flex items-center gap-2">
                  <LogIn size={15} /> Sign in
                </Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden btn-ghost p-2"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-navy-900 border-b border-white/5 px-4 py-4 flex flex-col gap-2">
          <Link to="/catalog" onClick={() => setMobileOpen(false)} className="btn-ghost text-sm text-left">Courses</Link>
          {user && <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="btn-ghost text-sm text-left">My Learning</Link>}
          {user && <Link to="/bookmarks" onClick={() => setMobileOpen(false)} className="btn-ghost text-sm text-left flex items-center gap-2"><Bookmark size={14} /> Saved Courses</Link>}
          <div className="border-t border-white/5 pt-2 mt-1">
            {user ? (
              <button onClick={() => { signOut(); setMobileOpen(false) }} className="btn-ghost text-sm text-left w-full flex items-center gap-2">
                <LogOut size={15} /> Sign out
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-ghost text-sm">Sign in</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
