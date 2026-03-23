import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../store/AuthContext'
import { useAuth } from '../../hooks/useAuth'
import { BookOpen, Search, LayoutDashboard, LogOut, LogIn } from 'lucide-react'

export function Navbar() {
  const { user } = useAuthContext()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-navy-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-electric-500 flex items-center justify-center shadow-lg shadow-electric-500/30 group-hover:shadow-electric-500/50 transition-shadow">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-display font-semibold text-white text-lg tracking-tight">
            Kay<span className="text-gradient">Academy</span>
          </span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/catalog" className="btn-ghost text-sm">Courses</Link>
          {user && <Link to="/dashboard" className="btn-ghost text-sm">My Learning</Link>}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="hidden md:flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-electric-500/20 border border-electric-500/30 flex items-center justify-center text-electric-400 text-xs font-bold">
                  {user.user_metadata?.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
                </div>
              </button>
              <button onClick={signOut} className="btn-ghost text-sm flex items-center gap-2">
                <LogOut size={15} />
                <span className="hidden md:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm flex items-center gap-2">
                <LogIn size={15} />
                Sign in
              </Link>
              <Link to="/signup" className="btn-primary text-sm py-2 px-4">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
