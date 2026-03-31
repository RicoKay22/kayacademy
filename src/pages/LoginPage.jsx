import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAuthContext } from '../store/AuthContext'
import { BookOpen, Mail, Lock, Eye, EyeOff, Github } from 'lucide-react'

// Typewriter effect for the right panel
function Typewriter({ text, speed = 60 }) {
  const [displayed, setDisplayed] = useState('')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setDisplayed('')
    setIndex(0)
  }, [text])

  useEffect(() => {
    if (index >= text.length) return
    const t = setTimeout(() => {
      setDisplayed(prev => prev + text[index])
      setIndex(i => i + 1)
    }, speed)
    return () => clearTimeout(t)
  }, [index, text, speed])

  return (
    <span>
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  )
}

export default function LoginPage() {
  const { signIn, signInWithProvider, loading } = useAuth()
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    await signIn({ email, password })
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-2 bg-navy-950">

      {/* ── Left: Form ── */}
      <div className="flex min-h-screen md:min-h-0 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2.5 mb-10 group">
            <div className="w-10 h-10 rounded-xl bg-electric-500 flex items-center justify-center shadow-lg shadow-electric-500/30">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="font-display font-semibold text-white text-xl tracking-tight">
              Kay<span className="text-gradient">Academy</span>
            </span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-slate-400 text-sm">Continue your learning journey</p>
          </div>

          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => signInWithProvider('google')}
              className="w-full flex items-center justify-center gap-3 h-11 bg-navy-800 hover:bg-navy-700 border border-white/10 hover:border-white/20 rounded-xl text-white text-sm font-medium transition-all duration-200">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
              Continue with Google
            </button>
            <button
              onClick={() => signInWithProvider('github')}
              className="w-full flex items-center justify-center gap-3 h-11 bg-navy-800 hover:bg-navy-700 border border-white/10 hover:border-white/20 rounded-xl text-white text-sm font-medium transition-all duration-200">
              <Github size={16} />
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-navy-950 px-3 text-slate-500">or sign in with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-electric-400 hover:text-electric-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Sign in'
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-electric-400 hover:text-electric-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right: Decorative panel — desktop only ── */}
      <div className="hidden md:flex relative bg-navy-900 overflow-hidden items-end">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80)`,
            filter: 'brightness(0.35)',
          }}
        />
        {/* Electric blue overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-electric-500/20 via-transparent to-navy-950/80" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-navy-950 to-transparent" />

        {/* Floating stats cards */}
        <div className="absolute top-1/4 left-10 glass p-4 rounded-2xl max-w-[200px]">
          <p className="text-xs text-slate-400 mb-1">Learners this month</p>
          <p className="font-display text-2xl font-bold text-white">+2,400</p>
          <div className="h-1 bg-electric-500/30 rounded-full mt-2">
            <div className="h-full w-3/4 bg-electric-500 rounded-full" />
          </div>
        </div>
        <div className="absolute top-2/4 right-10 glass p-4 rounded-2xl">
          <p className="text-xs text-slate-400 mb-1">Completion rate</p>
          <p className="font-display text-2xl font-bold text-emerald-400">94%</p>
        </div>

        {/* Quote */}
        <div className="relative z-10 p-12 w-full">
          <blockquote>
            <p className="font-display text-xl font-semibold text-white mb-3 leading-relaxed">
              "<Typewriter text="Welcome back. Your next lesson is waiting." />"
            </p>
            <cite className="text-sm text-slate-400 not-italic">— KayAcademy</cite>
          </blockquote>
        </div>
      </div>
    </div>
  )
}
