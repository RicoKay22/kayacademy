import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, Users, Clock, BookOpen, Lock, PlayCircle, CheckCircle, ChevronRight } from 'lucide-react'
import { getCourseById, getCategoryById } from '../data/courses'
import { useAuthContext } from '../store/AuthContext'
import { useAppContext } from '../store/AppContext'
import { useProgress } from '../hooks/useProgress'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'

export default function CourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const course = getCourseById(courseId)
  const category = getCategoryById(course?.category)
  const { user } = useAuthContext()
  const { enroll, isEnrolled, isLessonComplete } = useAppContext()
  const { percentage, completedCount } = useProgress(courseId, course?.lessons ?? [])

  if (!course) return (
    <div className="min-h-screen bg-navy-950 pt-24 flex items-center justify-center">
      <div className="text-center">
        <h2 className="font-display text-2xl text-white mb-2">Course not found</h2>
        <Link to="/catalog" className="btn-primary mt-4 inline-flex">Back to Catalog</Link>
      </div>
    </div>
  )

  const enrolled = isEnrolled(course.id)

  function handleEnroll() {
    if (!user) { navigate('/login'); return }
    enroll(course.id)
  }

  function handleStartLesson(lesson) {
    if (!enrolled && !lesson.free) { handleEnroll(); return }
    navigate(`/course/${course.id}/lesson/${lesson.id}`)
  }

  return (
    <div className="min-h-screen bg-navy-950 pt-24 page-enter">
      {/* Hero */}
      <div className="relative border-b border-white/5">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-30" />
        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4 text-sm text-slate-400">
                <Link to="/catalog" className="hover:text-electric-400 transition-colors">Catalog</Link>
                <ChevronRight size={14} />
                <Link to={`/catalog?category=${course.category}`} className="hover:text-electric-400 transition-colors">
                  {category?.label}
                </Link>
              </div>

              <h1 className="font-display text-4xl font-bold text-white mb-4 leading-tight">{course.title}</h1>
              <p className="text-slate-400 text-lg mb-6 leading-relaxed">{course.description}</p>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Badge variant="level" level={course.level}>{course.level}</Badge>
                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-white">{course.rating}</span>
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Users size={14} />
                  {course.students.toLocaleString()} students
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Clock size={14} />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                  <BookOpen size={14} />
                  {course.lessons.length} lessons
                </span>
              </div>

              <p className="text-sm text-slate-500">
                Instructor: <span className="text-white font-medium">{course.instructor}</span>
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {course.tags.map(tag => (
                  <span key={tag} className="badge bg-electric-500/10 text-electric-400 border border-electric-500/20 text-xs">{tag}</span>
                ))}
              </div>
            </div>

            {/* Enrollment card */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="glass p-6 sticky top-24">
                <div className="aspect-video rounded-xl overflow-hidden mb-5">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                </div>

                {enrolled ? (
                  <>
                    <ProgressBar percentage={percentage} showLabel size="default" />
                    <p className="text-xs text-slate-500 mt-2 mb-4">{completedCount} of {course.lessons.length} lessons complete</p>
                    <Link
                      to={`/course/${course.id}/lesson/${course.lessons.find(l => !isLessonComplete(course.id, l.id))?.id ?? course.lessons[0].id}`}
                      className="btn-primary w-full text-center block">
                      {percentage === 0 ? 'Start Course' : percentage === 100 ? 'Review Course' : 'Continue Learning'}
                    </Link>
                    {percentage === 100 && (
                      <Link to={`/certificate/${course.id}`} className="btn-secondary w-full text-center block mt-3">
                        🎓 View Certificate
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-display text-2xl font-bold text-white mb-1">Free</p>
                    <p className="text-xs text-slate-500 mb-5">Enroll to unlock all {course.lessons.length} lessons</p>
                    <button onClick={handleEnroll} className="btn-primary w-full">
                      {user ? 'Enroll Now — Free' : 'Sign in to Enroll'}
                    </button>
                    <p className="text-xs text-slate-600 text-center mt-3">First 2 lessons free to preview</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons list */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="font-display text-2xl font-bold text-white mb-6">Course Curriculum</h2>
        <div className="space-y-2 max-w-3xl">
          {course.lessons.map((lesson, idx) => {
            const isComplete = isLessonComplete(course.id, lesson.id)
            const isLocked = !enrolled && !lesson.free
            return (
              <button key={lesson.id} onClick={() => handleStartLesson(lesson)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 group
                  ${isLocked ? 'cursor-pointer opacity-60' : 'hover:bg-white/5 cursor-pointer'}
                  ${isComplete ? 'border border-emerald-500/20 bg-emerald-500/5' : 'border border-white/5'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                  ${isComplete ? 'bg-emerald-500/20 text-emerald-400' : isLocked ? 'bg-navy-800 text-slate-600' : 'bg-electric-500/10 text-electric-400'}`}>
                  {isComplete ? <CheckCircle size={16} /> : isLocked ? <Lock size={14} /> : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${isComplete ? 'text-emerald-400' : 'text-white'}`}>{lesson.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{lesson.duration}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {lesson.free && !enrolled && (
                    <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs">Free</span>
                  )}
                  {!isLocked && <PlayCircle size={18} className="text-slate-600 group-hover:text-electric-400 transition-colors" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
