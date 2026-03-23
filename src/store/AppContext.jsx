import { createContext, useContext, useEffect, useReducer } from 'react'
import { useAuthContext } from './AuthContext'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

const initialState = {
  enrollments: [],     // [courseId, ...]
  progress: {},        // { courseId: { completedLessons: [lessonId, ...] } }
  loadingData: true,
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, enrollments: action.enrollments, progress: action.progress, loadingData: false }

    case 'ENROLL':
      return { ...state, enrollments: [...state.enrollments, action.courseId] }

    case 'COMPLETE_LESSON': {
      const { courseId, lessonId } = action
      const existing = state.progress[courseId] ?? { completedLessons: [] }
      const alreadyDone = existing.completedLessons.includes(lessonId)
      if (alreadyDone) return state
      return {
        ...state,
        progress: {
          ...state.progress,
          [courseId]: { completedLessons: [...existing.completedLessons, lessonId] },
        },
      }
    }

    case 'RESET':
      return { ...initialState, loadingData: false }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const { user } = useAuthContext()
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load user data from Supabase when user logs in
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'RESET' })
      return
    }
    loadUserData(user.id)
  }, [user])

  async function loadUserData(userId) {
    try {
      const [{ data: enrollData }, { data: progressData }] = await Promise.all([
        supabase.from('enrollments').select('course_id').eq('user_id', userId),
        supabase.from('progress').select('course_id, lesson_id').eq('user_id', userId),
      ])

      const enrollments = enrollData?.map((e) => e.course_id) ?? []

      const progress = {}
      progressData?.forEach(({ course_id, lesson_id }) => {
        if (!progress[course_id]) progress[course_id] = { completedLessons: [] }
        progress[course_id].completedLessons.push(lesson_id)
      })

      dispatch({ type: 'SET_DATA', enrollments, progress })
    } catch (err) {
      console.error('Error loading user data:', err)
      dispatch({ type: 'SET_DATA', enrollments: [], progress: {} })
    }
  }

  async function enroll(courseId) {
    if (!user || state.enrollments.includes(courseId)) return
    dispatch({ type: 'ENROLL', courseId })
    await supabase.from('enrollments').insert({ user_id: user.id, course_id: courseId })
    // Update last_active
    await supabase.from('activity').upsert({ user_id: user.id, last_active_at: new Date().toISOString() })
  }

  async function completeLesson(courseId, lessonId) {
    if (!user) return
    dispatch({ type: 'COMPLETE_LESSON', courseId, lessonId })
    await supabase.from('progress').upsert({ user_id: user.id, course_id: courseId, lesson_id: lessonId })
    await supabase.from('activity').upsert({ user_id: user.id, last_active_at: new Date().toISOString() })
  }

  function getProgress(courseId, totalLessons) {
    const done = state.progress[courseId]?.completedLessons?.length ?? 0
    return totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0
  }

  function isEnrolled(courseId) {
    return state.enrollments.includes(courseId)
  }

  function isLessonComplete(courseId, lessonId) {
    return state.progress[courseId]?.completedLessons?.includes(lessonId) ?? false
  }

  const value = { ...state, enroll, completeLesson, getProgress, isEnrolled, isLessonComplete }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}
