import { FileText, Check, Loader } from 'lucide-react'
import { useNotes } from '../../hooks/useNotes'
import { useAuthContext } from '../../store/AuthContext'
import { useEffect, useRef, useState } from 'react'

// Detects keyboard height using visualViewport API
// Returns the height in px that the keyboard is taking up (0 if not open)
function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    if (!window.visualViewport) return

    function update() {
      const viewport = window.visualViewport
      const keyboardH = window.innerHeight - viewport.height - viewport.offsetTop
      setKeyboardHeight(Math.max(0, keyboardH))
    }

    window.visualViewport.addEventListener('resize', update)
    window.visualViewport.addEventListener('scroll', update)
    return () => {
      window.visualViewport.removeEventListener('resize', update)
      window.visualViewport.removeEventListener('scroll', update)
    }
  }, [])

  return keyboardHeight
}

export function NotesPanel({ courseId, lessonId, lessonTitle }) {
  const { user } = useAuthContext()
  const { content, handleChange, saving, saved } = useNotes(courseId, lessonId)
  const keyboardHeight = useKeyboardHeight()
  const textareaRef = useRef(null)

  // When keyboard opens, ensure textarea is visible by scrolling it into view
  useEffect(() => {
    if (keyboardHeight > 0 && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    }
  }, [keyboardHeight])

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <FileText size={28} className="text-slate-600 mb-3" />
        <p className="text-slate-500 text-sm">Sign in to take notes</p>
      </div>
    )
  }

  // On mobile when keyboard is open: give notes a fixed minimum height
  // so user can see at least 6-7 lines without the video scrolling away
  const minTextareaHeight = keyboardHeight > 0 ? '140px' : '80px'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-electric-400" />
          <span className="font-display font-semibold text-white text-sm">My Notes</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {saving ? (
            <><Loader size={11} className="text-slate-500 animate-spin" /><span className="text-slate-500">Saving...</span></>
          ) : saved && content ? (
            <><Check size={11} className="text-emerald-400" /><span className="text-emerald-400">Saved</span></>
          ) : null}
        </div>
      </div>

      {/* Lesson context */}
      <div className="px-4 py-1.5 bg-electric-500/5 border-b border-white/5 flex-shrink-0">
        <p className="text-xs text-slate-500 truncate">
          📍 <span className="text-electric-400">{lessonTitle}</span>
        </p>
      </div>

      {/* Textarea — scrollable, keyboard-aware */}
      <div className="flex-1 overflow-y-auto p-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={'Take notes...\n\nSaves automatically as you type.'}
          className="w-full resize-none bg-transparent text-slate-300 placeholder-slate-600 text-sm leading-relaxed focus:outline-none"
          style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            minHeight: minTextareaHeight,
            height: keyboardHeight > 0 ? `${Math.max(140, window.innerHeight * 0.25)}px` : '100%',
          }}
        />
      </div>

      {content.length > 0 && (
        <div className="px-4 py-1.5 border-t border-white/5 flex-shrink-0">
          <p className="text-xs text-slate-600">{content.length} characters</p>
        </div>
      )}
    </div>
  )
}
