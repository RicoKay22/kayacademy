import { Link } from 'react-router-dom'
import { Star, Users, Clock, Lock, Bookmark } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { ProgressBar } from '../ui/ProgressBar'
import { useAppContext } from '../../store/AppContext'
import { useAuthContext } from '../../store/AuthContext'
import { getCategoryById } from '../../data/courses'

export function CourseCard({ course, showProgress = false }) {
  const { isEnrolled, getProgress, isBookmarked, toggleBookmark } = useAppContext()
  const { user } = useAuthContext()
  const enrolled = isEnrolled(course.id)
  const progress = getProgress(course.id, course.lessons.length)
  const category = getCategoryById(course.category)
  const bookmarked = isBookmarked(course.id)

  function handleBookmark(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    toggleBookmark(course.id)
  }

  return (
    <Link to={`/course/${course.id}`} className="card group hover:border-electric-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-electric-500/5 hover:-translate-y-0.5 flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="badge bg-black/50 backdrop-blur-sm text-white border border-white/10 text-xs">
            {category?.icon} {category?.label}
          </span>
        </div>

        {/* Bookmark button */}
        {user && (
          <button
            onClick={handleBookmark}
            className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
              ${bookmarked
                ? 'bg-electric-500 text-white shadow-lg shadow-electric-500/30'
                : 'bg-black/50 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/70'
              }`}
          >
            <Bookmark size={14} className={bookmarked ? 'fill-white' : ''} />
          </button>
        )}

        {/* Enrolled indicator */}
        {enrolled && (
          <div className="absolute bottom-3 right-3 badge bg-electric-500/90 text-white text-xs">
            Enrolled
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="level" level={course.level}>{course.level}</Badge>
        </div>

        <h3 className="font-display font-semibold text-white text-base leading-snug mb-1 group-hover:text-electric-400 transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-slate-500 mb-4">{course.instructor}</p>

        <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto mb-3">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            {course.rating}
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {course.students.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {course.duration}
          </span>
        </div>

        {enrolled && showProgress && (
          <ProgressBar percentage={progress} showLabel />
        )}

        {!enrolled && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Lock size={11} />
            <span>{course.lessons.length} lessons · Enroll to unlock</span>
          </div>
        )}
      </div>
    </Link>
  )
}
