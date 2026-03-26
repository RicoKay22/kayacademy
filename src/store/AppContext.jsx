import { createContext, useContext, useEffect, useReducer } from 'react'
import { useAuthContext } from './AuthContext'
import { supabase } from '../lib/supabase'
import { COURSES } from '../data/courses'

const AppContext = createContext(null)

const initialState = {
  enrollments: [],
  progress: {},
  certificates: {}, // { courseId: { issued_at: '2026-03-23T...' } }
  loadingData: true,
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        enrollments: action.enrollments,
        progress: action.progress,
        certificates: action.certificates,
        loadingData: false,
      }

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

    case 'ISSUE_CERTIFICATE':
      return {
        ...state,
        certificates: {
          ...state.certificates,
          [action.courseId]: { issued_at: action.issued_at },
        },
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

  useEffect(() => {
    if (!user) {
      dispatch({ type: 'RESET' })
      return
    }
    loadUserData(user.id)
  }, [user])

  async function loadUserData(userId) {
    try {
      const [{ data: enrollData }, { data: progressData }, { data: certData }] = await Promise.all([
        supabase.from('enrollments').select('course_id').eq('user_id', userId),
        supabase.from('progress').select('course_id, lesson_id').eq('user_id', userId),
        supabase.from('certificates').select('course_id, issued_at').eq('user_id', userId),
      ])

      const enrollments = enrollData?.map((e) => e.course_id) ?? []

      const progress = {}
      progressData?.forEach(({ course_id, lesson_id }) => {
        if (!progress[course_id]) progress[course_id] = { completedLessons: [] }
        progress[course_id].completedLessons.push(lesson_id)
      })

      const certificates = {}
      certData?.forEach(({ course_id, issued_at }) => {
        certificates[course_id] = { issued_at }
      })

      dispatch({ type: 'SET_DATA', enrollments, progress, certificates })
    } catch (err) {
      console.error('Error loading user data:', err)
      dispatch({ type: 'SET_DATA', enrollments: [], progress: {}, certificates: {} })
    }
  }

  async function enroll(courseId) {
    if (!user || state.enrollments.includes(courseId)) return
    dispatch({ type: 'ENROLL', courseId })
    await supabase.from('enrollments').insert({ user_id: user.id, course_id: courseId })
    await supabase.from('activity').upsert({ user_id: user.id, last_active_at: new Date().toISOString() })
  }

  async function completeLesson(courseId, lessonId) {
    if (!user) return
    dispatch({ type: 'COMPLETE_LESSON', courseId, lessonId })
    await supabase.from('progress').upsert({ user_id: user.id, course_id: courseId, lesson_id: lessonId })
    await supabase.from('activity').upsert({ user_id: user.id, last_active_at: new Date().toISOString() })

    // Check if this lesson completion finishes the course
    const course = COURSES.find(c => c.id === courseId)
    if (!course) return

    const currentCompleted = state.progress[courseId]?.completedLessons ?? []
    const allLessonIds = course.lessons.map(l => l.id)
    const newCompleted = [...new Set([...currentCompleted, lessonId])]
    const isNowComplete = allLessonIds.every(id => newCompleted.includes(id))

    if (isNowComplete && !state.certificates[courseId]) {
      // Issue certificate with today's date — stored permanently in Supabase
      const issuedAt = new Date().toISOString()
      const certCode = `KA-${courseId.toUpperCase().replace(/-/g, '').slice(0, 8)}-${user.id.slice(0, 8).toUpperCase()}`

      dispatch({ type: 'ISSUE_CERTIFICATE', courseId, issued_at: issuedAt })

      await supabase.from('certificates').upsert({
        user_id: user.id,
        course_id: courseId,
        issued_at: issuedAt,
        certificate_code: certCode,
      })
    }
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

  function getCertificate(courseId) {
    return state.certificates[courseId] ?? null
  }

  const value = { ...state, enroll, completeLesson, getProgress, isEnrolled, isLessonComplete, getCertificate }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}
