import { Link } from 'react-router-dom'
import { Bookmark, BookOpen, ArrowRight } from 'lucide-react'
import { useAppContext } from '../store/AppContext'
import { COURSES } from '../data/courses'
import { CourseCard } from '../components/course/CourseCard'

export default function BookmarksPage() {
  const { bookmarks } = useAppContext()
  const savedCourses = COURSES.filter(c => bookmarks.includes(c.id))

  return (
    <div className="min-h-screen bg-navy-950 pt-24 px-6 pb-16 page-enter">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Bookmark size={32} className="text-electric-400" />
            Saved Courses
          </h1>
          <p className="text-slate-400">Courses you've bookmarked for later.</p>
        </div>

        {savedCourses.length === 0 ? (
          <div className="glass p-16 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-electric-500/10 flex items-center justify-center mx-auto mb-4">
              <Bookmark size={28} className="text-electric-400" />
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">No saved courses yet</h3>
            <p className="text-slate-400 text-sm mb-6">
              Click the bookmark icon on any course to save it for later.
            </p>
            <Link to="/catalog" className="btn-primary inline-flex items-center gap-2">
              Browse Courses <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedCourses.map(course => (
              <CourseCard key={course.id} course={course} showProgress />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
