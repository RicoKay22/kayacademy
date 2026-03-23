import { Link } from 'react-router-dom'
import { BookOpen, Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-electric-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-md relative z-10 text-center">
        <div className="w-20 h-20 rounded-full bg-electric-500/15 border border-electric-500/20 flex items-center justify-center mx-auto mb-6">
          <Mail size={36} className="text-electric-400" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-3">Verify your email</h1>
        <p className="text-slate-400 mb-2">We sent a confirmation link to your email address.</p>
        <p className="text-slate-500 text-sm mb-8">Click the link in the email to activate your account and start learning.</p>
        <Link to="/login" className="btn-primary inline-flex">Back to sign in</Link>
      </div>
    </div>
  )
}
