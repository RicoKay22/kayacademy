import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { BookOpen, Mail, Lock, Eye, EyeOff, User, Github, CheckCircle2, XCircle } from 'lucide-react'

// ── Password strength ─────────────────────────────────────────────────────
function getPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    maxLength: password.length <= 14,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
  const passed = Object.values(checks).filter(Boolean).length
  if (password.length === 0) return { score: 0, label: '', color: '', checks }
  if (passed <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500', checks }
  if (passed === 3) return { score: 2, label: 'Fair', color: 'bg-amber-500', checks }
  if (passed === 4) return { score: 3, label: 'Good', color: 'bg-yellow-400', checks }
  return { score: 4, label: 'Strong', color: 'bg-emerald-500', checks }
}

const REQUIREMENTS = [
  { key: 'length', label: '8–14 characters' },
  { key: 'uppercase', label: 'One uppercase letter' },
  { key: 'number', label: 'One number' },
  { key: 'special', label: 'One special character (!@#$...)' },
]

// ── Typewriter for right panel ────────────────────────────────────────────
import { useEffect } from 'react'
function Typewriter({ text, speed = 60 }) {
  const [displayed, setDisplayed] = useState('')
  const [index, setIndex] = useState(0)

  useEffect(() => { setDisplayed(''); setIndex(0) }, [text])
  useEffect(() => {
    if (index >= text.length) return
    const t = setTimeout(() => {
      setDisplayed(p => p + text[index])
      setIndex(i => i + 1)
    }, speed)
    return () => clearTimeout(t)
  }, [index, text, speed])

  return <span>{displayed}<span className="animate-pulse">|</span></span>
}

// ─────────────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const { signUp, signInWithProvider, loading } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)

  const strength = getPasswordStrength(password)
  const isPasswordValid = strength.score === 4

  function handleSubmit(e) {
    e.preventDefault()
    if (!isPasswordValid) { setTouched(true); return }
    signUp({ email, password, fullName })
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-2 bg-navy-950">

      {/* ── Left: Form ── */}
      <div className="flex min-h-screen md:min-h-0 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 group">
            <div className="w-10 h-10 rounded-xl bg-electric-500 flex items-center justify-center shadow-lg shadow-electric-500/30">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="font-display font-semibold text-white text-xl tracking-tight">
              Kay<span className="text-gradient">Academy</span>
            </span>
          </Link>

          <div className="text-center mb-6">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-slate-400 text-sm">Join thousands of African professionals learning daily</p>
          </div>

          {/* OAuth */}
          <div className="space-y-3 mb-5">
            <button
              onClick={() => signInWithProvider('google')}
              className="w-full flex items-center justify-center gap-3 h-11 bg-navy-800 hover:bg-navy-700 border border-white/10 hover:border-white/20 rounded-xl text-white text-sm font-medium transition-all">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
              Continue with Google
            </button>
            <button
              onClick={() => signInWithProvider('github')}
              className="w-full flex items-center justify-center gap-3 h-11 bg-navy-800 hover:bg-navy-700 border border-white/10 hover:border-white/20 rounded-xl text-white text-sm font-medium transition-all">
              <Github size={16} />
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-navy-950 px-3 text-slate-500">or sign up with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="input-field pl-10"
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); setTouched(true) }}
                  placeholder="Create a strong password"
                  className="input-field pl-10 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        strength.score >= i ? strength.color : 'bg-navy-700'
                      }`} />
                    ))}
                  </div>
                  {strength.label && (
                    <p className={`text-xs font-medium ${
                      strength.score === 1 ? 'text-red-400' :
                      strength.score === 2 ? 'text-amber-400' :
                      strength.score === 3 ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>{strength.label}</p>
                  )}
                </div>
              )}

              {/* Requirements */}
              {touched && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {REQUIREMENTS.map(req => (
                    <div key={req.key} className="flex items-center gap-1.5">
                      {strength.checks[req.key]
                        ? <CheckCircle2 size={11} className="text-emerald-400 flex-shrink-0" />
                        : <XCircle size={11} className="text-red-400 flex-shrink-0" />}
                      <span className={`text-xs ${strength.checks[req.key] ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Create account'
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-electric-400 hover:text-electric-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-slate-600 mt-3 leading-relaxed">
            By creating an account you agree to our{' '}
            <span className="text-slate-500">Terms of Service</span> and{' '}
            <span className="text-slate-500">Privacy Policy</span>
          </p>
        </div>
      </div>

      {/* ── Right: Decorative panel — desktop only ── */}
      <div className="hidden md:flex relative bg-navy-900 overflow-hidden items-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1200&q=80)`,
            filter: 'brightness(0.3)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-electric-500/15 via-transparent to-navy-950/80" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-navy-950 to-transparent" />

        {/* Floating cards */}
        <div className="absolute top-1/4 left-10 glass p-4 rounded-2xl max-w-[210px]">
          <p className="text-xs text-slate-400 mb-1">Courses available</p>
          <p className="font-display text-2xl font-bold text-white">15+ Courses</p>
          <p className="text-xs text-electric-400 mt-1">Across 8 disciplines</p>
        </div>
        <div className="absolute top-2/4 right-10 glass p-4 rounded-2xl text-center">
          <p className="font-display text-2xl font-bold text-emerald-400">Free</p>
          <p className="text-xs text-slate-400">Always free to start</p>
        </div>

        <div className="relative z-10 p-12 w-full">
          <blockquote>
            <p className="font-display text-xl font-semibold text-white mb-3 leading-relaxed">
              "<Typewriter text="A new chapter awaits. Start learning today." />"
            </p>
            <cite className="text-sm text-slate-400 not-italic">— KayAcademy</cite>
          </blockquote>
        </div>
      </div>
    </div>
  )
}
