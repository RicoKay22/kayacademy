import { useState, useRef, useEffect } from 'react'
import { Bell, X, CheckCheck } from 'lucide-react'
import { useNotifications } from '../../store/NotificationContext'

const TYPE_COLORS = {
  success: 'text-emerald-400',
  info: 'text-electric-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleOpen() {
    setOpen(prev => !prev)
    if (!open && unreadCount > 0) markAllRead()
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="btn-ghost p-2 relative"
        title="Notifications"
      >
        <Bell size={17} className="text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-electric-500 rounded-full text-white text-xs flex items-center justify-center font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-navy-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="font-display font-semibold text-white text-sm">Notifications</h3>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto lesson-scroll">
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell size={24} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.read ? 'bg-electric-500/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${TYPE_COLORS[n.type] ?? 'text-white'}`}>{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-slate-600 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-electric-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-white/5 text-center">
              <button onClick={markAllRead} className="text-xs text-slate-500 hover:text-electric-400 flex items-center gap-1 mx-auto transition-colors">
                <CheckCheck size={12} /> Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
