import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { BookOpen, Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { resetPassword, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const result = await resetPassword(email)
    // Only show success screen if email was actually found
    if (result?.exists) setSent(true)
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
          <h1 className="font-display text-3xl font-bold text-white mb-2">Reset your password</h1>
          <p className="text-slate-400 text-sm">We'll send a reset link to your registered email</p>
        </div>

        <div className="glass p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-emerald-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">Check your inbox</h3>
              <p className="text-slate-400 text-sm mb-6">
                We sent a password reset link to <span className="text-white font-medium">{email}</span>.
                Check your spam folder if you don't see it.
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                <ArrowLeft size={16} /> Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required className="input-field pl-11" />
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Enter the email address you used to create your KayAcademy account.
                </p>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {loading ? 'Checking...' : 'Send reset link'}
              </button>

              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
