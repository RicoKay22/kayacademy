import { createContext, useContext, useEffect, useReducer } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from './AuthContext'

const NotificationContext = createContext(null)

const initialState = {
  notifications: [],
  unreadCount: 0,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET':
      return {
        notifications: action.data,
        unreadCount: action.data.filter(n => !n.read).length,
      }
    case 'ADD': {
      const updated = [action.notification, ...state.notifications]
      return { notifications: updated, unreadCount: state.unreadCount + 1 }
    }
    case 'MARK_ALL_READ':
      return {
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }
    case 'CLEAR':
      return initialState
    default:
      return state
  }
}

export function NotificationProvider({ children }) {
  const { user } = useAuthContext()
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!user) { dispatch({ type: 'CLEAR' }); return }
    loadNotifications(user.id)
  }, [user])

  async function loadNotifications(userId) {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) dispatch({ type: 'SET', data })
    } catch (e) {
      console.error('Notifications load error:', e)
    }
  }

  async function addNotification({ title, message, type = 'info', icon = '🔔' }) {
    if (!user) return
    const notification = {
      id: crypto.randomUUID(),
      user_id: user.id,
      title,
      message,
      type,
      icon,
      read: false,
      created_at: new Date().toISOString(),
    }
    dispatch({ type: 'ADD', notification })
    try {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title,
        message,
        type,
        icon,
        read: false,
      })
    } catch (e) {}
  }

  async function markAllRead() {
    if (!user) return
    dispatch({ type: 'MARK_ALL_READ' })
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
    } catch (e) {}
  }

  const value = { ...state, addNotification, markAllRead }
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
