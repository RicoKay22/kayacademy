import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Lock, Eye, EyeOff, BookOpen, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function getStrength(p) {
  const checks = {
    length: p.length >= 8 && p.length <= 14,
    uppercase: /[A-Z]/.test(p),
    number: /[0-9]/.test(p),
    special: /[^A-Za-z0-9]/.test(p),
  }
  const passed = Object.values(checks).filter(Boolean).length
  if (p.length === 0) return { score: 0, label: '', color: '', checks }
  if (passed <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500', checks }
  if (passed === 3) return { score: 2, label: 'Fair', color: 'bg-amber-500', checks }
  if (passed === 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500', checks }
  return { score: 3, label: 'Good', color: 'bg-yellow-400', checks }
}

const REQS = [
  { key: 'length', label: '8–14 characters' },
  { key: 'uppercase', label: 'One uppercase letter' },
  { key: 'number', label: 'One number' },
  { key: 'special', label: 'One special character' },
]

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const strength = getStrength(password)

  async function handleSubmit(e) {
    e.preventDefault()
    if (strength.score < 4) { toast.error('Please use a stronger password'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Password updated successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-electric-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-electric-500 flex items-center justify-center shadow-lg shadow-electric-500/30">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="font-display font-semibold text-white text-xl">Kay<span className="text-gradient">Academy</span></span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Set new password</h1>
          <p className="text-slate-400 text-sm">Choose a strong password for your account</p>
        </div>
        <div className="glass p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={show ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters" required className="input-field pl-11 pr-11" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-navy-800'}`} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {REQS.map(r => (
                      <div key={r.key} className={`flex items-center gap-1 text-xs ${strength.checks[r.key] ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {strength.checks[r.key] ? <CheckCircle2 size={11} /> : <XCircle size={11} />} {r.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button type="submit" disabled={loading || strength.score < 4}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
