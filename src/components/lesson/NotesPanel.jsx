import { FileText, Check, Loader } from 'lucide-react'
import { useNotes } from '../../hooks/useNotes'
import { useAuthContext } from '../../store/AuthContext'

export function NotesPanel({ courseId, lessonId, lessonTitle }) {
  const { user } = useAuthContext()
  const { content, handleChange, saving, saved } = useNotes(courseId, lessonId)

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <FileText size={28} className="text-slate-600 mb-3" />
        <p className="text-slate-500 text-sm">Sign in to take notes</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-electric-400" />
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
      <div className="px-4 py-2 bg-electric-500/5 border-b border-white/5 flex-shrink-0">
        <p className="text-xs text-slate-500 truncate">
          📍 <span className="text-electric-400">{lessonTitle}</span>
        </p>
      </div>

      {/* Textarea */}
      <div className="flex-1 p-3 overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={'Take notes for this lesson...\n\nTip: Notes save automatically as you type.'}
          className="w-full h-full resize-none bg-transparent text-slate-300 placeholder-slate-600 text-sm leading-relaxed focus:outline-none"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        />
      </div>

      {content.length > 0 && (
        <div className="px-4 py-2 border-t border-white/5 flex-shrink-0">
          <p className="text-xs text-slate-600">{content.length} characters</p>
        </div>
      )}
    </div>
  )
}
