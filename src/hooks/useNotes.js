import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../store/AuthContext'

export function useNotes(courseId, lessonId) {
  const { user } = useAuthContext()
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const saveTimerRef = useRef(null)
  const latestContentRef = useRef('') // always holds latest value, no stale closure

  // Reset and load when lesson changes
  useEffect(() => {
    setContent('')
    setSaved(true)
    latestContentRef.current = ''
    clearTimeout(saveTimerRef.current)

    if (!user || !courseId || !lessonId) return

    async function loadNote() {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('content')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .eq('lesson_id', lessonId)
          .maybeSingle() // maybeSingle returns null instead of throwing when no row exists

        if (data?.content !== undefined) {
          setContent(data.content)
          latestContentRef.current = data.content
          setSaved(true)
        }
      } catch (e) {
        console.error('Note load error:', e)
      }
    }

    loadNote()
  }, [user?.id, courseId, lessonId])

  // Save function — uses onConflict so it properly updates existing rows
  const saveNote = useCallback(async (text) => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('notes')
        .upsert(
          {
            user_id: user.id,
            course_id: courseId,
            lesson_id: lessonId,
            content: text,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,course_id,lesson_id', // ← THIS was the bug — tells Supabase which unique key to use
          }
        )
      if (error) throw error
      setSaved(true)
    } catch (e) {
      console.error('Note save error:', e)
    } finally {
      setSaving(false)
    }
  }, [user, courseId, lessonId])

  function handleChange(value) {
    setContent(value)
    latestContentRef.current = value
    setSaved(false)
    // Debounce — save 1.5s after user stops typing
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveNote(value)
    }, 1500)
  }

  // Force save on unmount — uses ref so no stale closure
  useEffect(() => {
    return () => {
      clearTimeout(saveTimerRef.current)
      const unsavedContent = latestContentRef.current
      // Only save if there's content and it wasn't just saved
      if (unsavedContent) {
        saveNote(unsavedContent)
      }
    }
  }, [saveNote])

  return { content, handleChange, saving, saved }
}
