import { useParams, Link } from 'react-router-dom'
import { useRef } from 'react'
import { getCourseById } from '../data/courses'
import { useAuthContext } from '../store/AuthContext'
import { useAppContext } from '../store/AppContext'
import { Download, ArrowLeft, Award } from 'lucide-react'

export default function CertificatePage() {
  const { courseId } = useParams()
  const { user } = useAuthContext()
  const { isEnrolled, getProgress } = useAppContext()
  const certRef = useRef(null)
  const course = getCourseById(courseId)

  const enrolled = isEnrolled(courseId)
  const progress = getProgress(courseId, course?.lessons?.length ?? 0)
  const isComplete = progress === 100

  const studentName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'
  const completionDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const certId = `KA-${(courseId ?? '').toUpperCase().replace(/-/g, '').slice(0, 8)}-${(user?.id ?? '').slice(0, 8).toUpperCase()}`

  if (!course || !enrolled || !isComplete) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 pt-24">
        <div className="glass p-10 text-center max-w-sm">
          <Award size={40} className="text-slate-500 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">Certificate Not Available</h2>
          <p className="text-slate-400 text-sm mb-6">Complete all lessons in this course to earn your certificate.</p>
          <Link to={`/course/${courseId}`} className="btn-primary inline-flex">Back to Course</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-950 py-12 px-4 pt-28 page-enter">
      {/* Controls */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between print:hidden">
        <Link to={`/course/${courseId}`} className="btn-ghost flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Back to Course
        </Link>
        <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
          <Download size={16} /> Download / Print Certificate
        </button>
      </div>

      {/* Certificate card */}
      <div ref={certRef} className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl print:rounded-none"
          style={{ position: 'relative', minHeight: '560px' }}>

          {/* Top gradient bar */}
          <div style={{ height: '6px', background: 'linear-gradient(90deg, #1E90FF, #38bdf8, #1E90FF)' }} />

          {/* Watermark */}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.025, fontSize: '200px', fontWeight: 900, color: '#1E90FF',
            fontFamily: 'Clash Display, sans-serif', pointerEvents: 'none', userSelect: 'none',
          }}>KA</div>

          {/* Corner brackets */}
          {[
            { top: 20, left: 20 },
            { top: 20, right: 20 },
            { bottom: 20, left: 20 },
            { bottom: 20, right: 20 },
          ].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', width: 50, height: 50, ...pos,
              borderTop: i < 2 ? '3px solid #1E90FF' : undefined,
              borderBottom: i >= 2 ? '3px solid #1E90FF' : undefined,
              borderLeft: i % 2 === 0 ? '3px solid #1E90FF' : undefined,
              borderRight: i % 2 === 1 ? '3px solid #1E90FF' : undefined,
              borderRadius: i === 0 ? '4px 0 0 0' : i === 1 ? '0 4px 0 0' : i === 2 ? '0 0 0 4px' : '0 0 4px 0',
            }} />
          ))}

          {/* Certificate content */}
          <div style={{ padding: '48px 80px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '32px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1E90FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 22, color: '#0a1628' }}>
                Kay<span style={{ color: '#1E90FF' }}>Academy</span>
              </span>
            </div>

            {/* Header text */}
            <p style={{ fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>
              Certificate of Completion
            </p>
            <p style={{ fontSize: 15, color: '#64748b', marginBottom: 28 }}>
              This is to certify that
            </p>

            {/* Name */}
            <div style={{ borderBottom: '2px solid #1E90FF', paddingBottom: 12, marginBottom: 28, display: 'inline-block', minWidth: 340 }}>
              <p style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 42, fontWeight: 700, color: '#0a1628', lineHeight: 1.1 }}>
                {studentName}
              </p>
            </div>

            <p style={{ fontSize: 15, color: '#64748b', marginBottom: 12 }}>
              has successfully completed the course
            </p>

            {/* Course title */}
            <p style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 24, fontWeight: 700, color: '#0a1628', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
              {course.title}
            </p>

            {/* Meta */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginBottom: 40 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Instructor</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0a1628' }}>{course.instructor}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Duration</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0a1628' }}>{course.duration}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Issued</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0a1628' }}>{completionDate}</p>
              </div>
            </div>

            {/* Signatures row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 20, fontWeight: 700, color: '#1E90FF', marginBottom: 4 }}>KayAcademy</p>
                <div style={{ width: 120, height: '1px', background: '#e2e8f0', margin: '0 auto 4px' }} />
                <p style={{ fontSize: 11, color: '#94a3b8' }}>Platform Signature</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1E90FF, #38bdf8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 8px',
                }}>
                  <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>Verified Completion</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Certificate ID</p>
                <p style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#475569' }}>{certId}</p>
                <div style={{ width: 120, height: '1px', background: '#e2e8f0', margin: '4px auto 0' }} />
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #1E90FF, #38bdf8, #1E90FF)' }} />
        </div>

        <p className="text-center text-xs text-slate-600 mt-4 print:hidden">
          Use your browser's Print dialog to save as PDF (File → Print → Save as PDF)
        </p>
      </div>
    </div>
  )
}
