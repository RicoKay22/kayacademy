import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../store/AuthContext'
import { supabase } from '../lib/supabase'
import { BookOpen, ArrowRight, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const INTERESTS = [
  { id: 'technology', label: 'Technology', icon: '💻', desc: 'Web dev, programming, software' },
  { id: 'economics', label: 'Economics & Business', icon: '📈', desc: 'Markets, finance, entrepreneurship' },
  { id: 'engineering', label: 'Engineering', icon: '⚙️', desc: 'Electrical, mechanical, systems' },
  { id: 'data', label: 'Data & Analytics', icon: '📊', desc: 'Python, SQL, machine learning' },
  { id: 'teaching', label: 'Education & Teaching', icon: '🎓', desc: 'Pedagogy, curriculum design' },
  { id: 'creative', label: 'Creative Arts', icon: '🎨', desc: 'Design, UI/UX, visual arts' },
  { id: 'civil', label: 'Civil Engineering', icon: '🏗️', desc: 'Structures, construction, infrastructure' },
  { id: 'health', label: 'Health Sciences', icon: '🩺', desc: 'Medicine, nutrition, wellness' },
]

export default function OnboardingPage() {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  function toggleInterest(id) {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id)
      if (prev.length >= 3) {
        toast.error('Pick up to 3 interests')
        return prev
      }
      return [...prev, id]
    })
  }

  async function handleContinue() {
    if (selected.length === 0) {
      toast.error('Please select at least one interest')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          interests: selected,
          onboarding_complete: true,
        }
      })
      if (error) throw error
      navigate('/dashboard')
    } catch (err) {
      toast.error('Could not save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSkip() {
    setSaving(true)
    try {
      await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          interests: [],
          onboarding_complete: true,
        }
      })
    } catch (e) {}
    navigate('/dashboard')
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-electric-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-xl bg-electric-500 flex items-center justify-center shadow-lg shadow-electric-500/30">
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="font-display font-semibold text-white text-xl">
            Kay<span className="text-gradient">Academy</span>
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-white mb-3">
            Welcome, {name}! 🎉
          </h1>
          <p className="text-slate-400 text-lg">
            What do you want to learn? Pick up to <span className="text-white font-medium">3 areas</span> and
            we'll personalise your experience.
          </p>
        </div>

        {/* Interest grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {INTERESTS.map(interest => {
            const isSelected = selected.includes(interest.id)
            return (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`relative p-4 rounded-2xl border text-left transition-all duration-200 group
                  ${isSelected
                    ? 'bg-electric-500/15 border-electric-500/60 shadow-lg shadow-electric-500/10'
                    : 'bg-navy-900 border-white/5 hover:border-electric-500/30 hover:bg-navy-800'
                  }`}
              >
                {/* Checkmark */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5">
                    <CheckCircle size={16} className="text-electric-400 fill-electric-500/20" />
                  </div>
                )}

                <div className="text-2xl mb-2">{interest.icon}</div>
                <p className={`font-display font-semibold text-sm mb-1 ${isSelected ? 'text-electric-300' : 'text-white'}`}>
                  {interest.label}
                </p>
                <p className="text-xs text-slate-500 leading-snug">{interest.desc}</p>
              </button>
            )
          })}
        </div>

        {/* Selection counter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < selected.length ? 'bg-electric-500' : 'bg-navy-800'
              }`} />
            ))}
            <span className="text-xs text-slate-500 ml-1">
              {selected.length}/3 selected
            </span>
          </div>
          <button
            onClick={handleSkip}
            disabled={saving}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={handleContinue}
          disabled={saving || selected.length === 0}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <>Start Learning <ArrowRight size={18} /></>
          }
        </button>
      </div>
    </div>
  )
}
