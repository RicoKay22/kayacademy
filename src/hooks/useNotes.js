import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../store/AuthContext'

export function useNotes(courseId, lessonId) {
  const { user } = useAuthContext()
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const saveTimerRef = useRef(null)

  // Load note for this lesson on mount
  useEffect(() => {
    if (!user || !courseId || !lessonId) return
    loadNote()
  }, [user, courseId, lessonId])

  async function loadNote() {
    try {
      const { data } = await supabase
        .from('notes')
        .select('content')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('lesson_id', lessonId)
        .single()
      if (data) {
        setContent(data.content)
        setSaved(true)
      }
    } catch (e) {
      // No note yet — that's fine
      setContent('')
    }
  }

  function handleChange(value) {
    setContent(value)
    setSaved(false)
    // Debounce save — waits 1.5s after user stops typing
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveNote(value)
    }, 1500)
  }

  async function saveNote(text) {
    if (!user) return
    setSaving(true)
    try {
      await supabase.from('notes').upsert({
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessonId,
        content: text,
        updated_at: new Date().toISOString(),
      })
      setSaved(true)
    } catch (e) {
      console.error('Note save error:', e)
    } finally {
      setSaving(false)
    }
  }

  // Force save on unmount
  useEffect(() => {
    return () => {
      clearTimeout(saveTimerRef.current)
      if (content && !saved) saveNote(content)
    }
  }, [content, saved])

  return { content, handleChange, saving, saved }
}
