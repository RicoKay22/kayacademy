import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Award, TrendingUp, Clock, Compass } from 'lucide-react'
import { useAuthContext } from '../store/AuthContext'
import { useAppContext } from '../store/AppContext'
import { COURSES, getCategoryById } from '../data/courses'
import { CourseCard } from '../components/course/CourseCard'
import { ProgressBar } from '../components/ui/ProgressBar'
import { DashboardStatsSkeleton, CourseCardSkeletonGrid } from '../components/ui/Skeleton'

export default function DashboardPage() {
  const { user } = useAuthContext()
  const { enrollments, getProgress, isLessonComplete, loadingData } = useAppContext()

  // Show skeleton while data loads
  if (loadingData) {
    return (
      <div className="min-h-screen bg-navy-950 pt-24 px-6 pb-16 page-enter">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 space-y-2">
            <div className="h-10 w-72 bg-navy-800 rounded-xl animate-pulse" />
            <div className="h-5 w-48 bg-navy-800 rounded-xl animate-pulse" />
          </div>
          <DashboardStatsSkeleton />
          <CourseCardSkeletonGrid count={4} />
        </div>
      </div>
    )
  }

  const enrolledCourses = COURSES.filter(c => enrollments.includes(c.id))
  const inProgress = enrolledCourses.filter(c => {
    const pct = getProgress(c.id, c.lessons.length)
    return pct > 0 && pct < 100
  })
  const completed = enrolledCourses.filter(c => getProgress(c.id, c.lessons.length) === 100)
  const notStarted = enrolledCourses.filter(c => getProgress(c.id, c.lessons.length) === 0)

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'Learner'
  const interests = user?.user_metadata?.interests ?? []

  const totalLessonsCompleted = enrolledCourses.reduce((acc, c) => {
    return acc + c.lessons.filter(l => isLessonComplete(c.id, l.id)).length
  }, 0)

  // Recommended: based on interests, exclude already enrolled
  const recommended = COURSES.filter(c =>
    !enrollments.includes(c.id) &&
    (interests.length === 0 || interests.includes(c.category))
  ).slice(0, 4)

  // Fallback if no interests or no matches — show top rated
  const suggestedCourses = recommended.length > 0
    ? recommended
    : COURSES.filter(c => !enrollments.includes(c.id))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4)

  return (
    <div className="min-h-screen bg-navy-950 pt-24 px-6 pb-16 page-enter">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-white mb-1">
              Welcome back, <span className="text-gradient">{name}</span> 👋
            </h1>
            <p className="text-slate-400">Keep the momentum going. You're doing great.</p>
          </div>
          {/* Show interests badges if set */}
          {interests.length > 0 && (
            <div className="hidden md:flex items-center gap-2 flex-wrap justify-end">
              {interests.map(id => {
                const cat = getCategoryById(id)
                return cat ? (
                  <span key={id} className="badge bg-electric-500/10 text-electric-400 border border-electric-500/20 text-xs">
                    {cat.icon} {cat.label}
                  </span>
                ) : null
              })}
              <Link to="/onboarding" className="text-xs text-slate-500 hover:text-electric-400 transition-colors ml-1">
                Edit
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: BookOpen, value: enrollments.length, label: 'Enrolled', color: 'text-electric-400' },
            { icon: TrendingUp, value: inProgress.length, label: 'In Progress', color: 'text-amber-400' },
            { icon: Award, value: completed.length, label: 'Completed', color: 'text-emerald-400' },
            { icon: Clock, value: totalLessonsCompleted, label: 'Lessons Done', color: 'text-sky-400' },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="glass p-6">
              <Icon size={20} className={`${color} mb-3`} />
              <div className="font-display text-3xl font-bold text-white">{value}</div>
              <div className="text-slate-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        {enrollments.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20 glass mb-12">
            <div className="w-16 h-16 rounded-full bg-electric-500/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-electric-400" />
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">Start your learning journey</h3>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto">
              You haven't enrolled in any courses yet. Browse the catalog and find something that excites you.
            </p>
            <Link to="/catalog" className="btn-primary inline-flex items-center gap-2">
              Browse Courses <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Continue learning */}
            {inProgress.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-6">Continue learning</h2>
                <div className="grid gap-4">
                  {inProgress.map(course => {
                    const pct = getProgress(course.id, course.lessons.length)
                    const nextLesson = course.lessons.find(l => !isLessonComplete(course.id, l.id))
                    return (
                      <div key={course.id} className="glass p-5 flex items-center gap-5 hover:border-electric-500/20 transition-all">
                        <img src={course.thumbnail} alt={course.title}
                          className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-white truncate mb-1">{course.title}</h3>
                          <p className="text-xs text-slate-500 mb-2">Next: {nextLesson?.title}</p>
                          <ProgressBar percentage={pct} showLabel />
                        </div>
                        <Link
                          to={`/course/${course.id}/lesson/${nextLesson?.id ?? course.lessons[0].id}`}
                          className="btn-primary text-sm py-2 px-4 flex-shrink-0 flex items-center gap-2">
                          Continue <ArrowRight size={14} />
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Not started */}
            {notStarted.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-6">Not started yet</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notStarted.map(c => <CourseCard key={c.id} course={c} showProgress />)}
                </div>
              </section>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-6">Completed 🎉</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completed.map(c => <CourseCard key={c.id} course={c} showProgress />)}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Recommended courses based on interests */}
        {suggestedCourses.length > 0 && (
          <section className="mt-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-white mb-1 flex items-center gap-2">
                  <Compass size={22} className="text-electric-400" />
                  {interests.length > 0 ? 'Recommended for you' : 'Explore more courses'}
                </h2>
                <p className="text-slate-500 text-sm">
                  {interests.length > 0
                    ? 'Based on your learning interests'
                    : 'Top-rated courses across all disciplines'}
                </p>
              </div>
              <Link to="/catalog" className="text-electric-400 hover:text-electric-300 text-sm flex items-center gap-1 transition-colors">
                See all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestedCourses.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
