import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Users, Award, TrendingUp, Star } from 'lucide-react'
import { CATEGORIES, COURSES } from '../data/courses'
import { CourseCard } from '../components/course/CourseCard'
import { useAuthContext } from '../store/AuthContext'

const STATS = [
  { icon: BookOpen, value: '14+', label: 'Courses' },
  { icon: Users, value: '85K+', label: 'Learners' },
  { icon: Award, value: '7', label: 'Disciplines' },
  { icon: TrendingUp, value: '94%', label: 'Completion Rate' },
]

export default function HomePage() {
  const { user } = useAuthContext()
  const featuredCourses = COURSES.slice(0, 4)

  return (
    <div className="min-h-screen bg-navy-950 page-enter">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-electric-500/8 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-sky-400/5 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 badge bg-electric-500/10 border border-electric-500/20 text-electric-400 mb-6 text-sm px-4 py-2">
            <Star size={13} className="fill-electric-400" />
            The learning platform built for African professionals
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.05] mb-6 tracking-tight">
            Learn anything.<br />
            <span className="text-gradient">Build everything.</span>
          </h1>

          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            From frontend engineering to economics, civil engineering to data science — 
            KayAcademy brings world-class education to the next generation of African professionals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
                Continue Learning <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
                  Start Learning Free <ArrowRight size={18} />
                </Link>
                <Link to="/catalog" className="btn-secondary text-base px-8 py-4">
                  Browse Courses
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="glass p-6 text-center">
              <Icon size={20} className="text-electric-400 mx-auto mb-2" />
              <div className="font-display text-3xl font-bold text-white">{value}</div>
              <div className="text-slate-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-white mb-2">Browse by discipline</h2>
              <p className="text-slate-400">7 fields of study. Real-world curriculum.</p>
            </div>
            <Link to="/catalog" className="text-electric-400 hover:text-electric-300 text-sm flex items-center gap-1 transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} to={`/catalog?category=${cat.id}`}
                className="card p-5 hover:border-electric-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-electric-500/5 group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl mb-3 shadow-lg`}>
                  {cat.icon}
                </div>
                <h3 className="font-display font-semibold text-white text-sm group-hover:text-electric-400 transition-colors">{cat.label}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {COURSES.filter(c => c.category === cat.id).length} courses
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="py-20 px-6 bg-navy-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-white mb-2">Featured courses</h2>
              <p className="text-slate-400">Handpicked to get you started fast.</p>
            </div>
            <Link to="/catalog" className="text-electric-400 hover:text-electric-300 text-sm flex items-center gap-1 transition-colors">
              All courses <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="glass p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-electric-500/5 to-sky-400/5" />
              <div className="relative z-10">
                <h2 className="font-display text-4xl font-bold text-white mb-4">
                  Ready to start learning?
                </h2>
                <p className="text-slate-400 mb-8 text-lg">
                  Join thousands of African professionals building their future with KayAcademy.
                </p>
                <Link to="/signup" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
                  Get started — it's free <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-electric-500 flex items-center justify-center">
              <BookOpen size={13} className="text-white" />
            </div>
            <span className="font-display font-semibold text-white text-sm">Kay<span className="text-gradient">Academy</span></span>
          </div>
          <p className="text-slate-600 text-xs">© 2026 KayAcademy. Built for African professionals.</p>
          <div className="flex gap-6 text-xs text-slate-500">
            <button onClick={() => alert('Terms of Service\n\nBy using KayAcademy, you agree to use the platform for personal learning purposes only. All course content is provided for educational use. KayAcademy reserves the right to update these terms at any time.')} className="hover:text-slate-300 transition-colors">Terms</button>
            <button onClick={() => alert('Privacy Policy\n\nKayAcademy collects only the information necessary to provide our service — your email, name, and learning progress. We never sell your data. All data is stored securely via Supabase with Row Level Security enabled.')} className="hover:text-slate-300 transition-colors">Privacy</button>
            <a
              href="https://digital-business-card-beta-opal.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-electric-400 transition-colors"
              title="Built by Rico Kay — Frontend Engineer">
              Contact
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-white/5 text-center">
          <p className="text-xs text-slate-700">
            Designed & built by{' '}
            <a href="https://digital-business-card-beta-opal.vercel.app/" target="_blank" rel="noopener noreferrer"
              className="text-slate-500 hover:text-electric-400 transition-colors font-medium">
              Rico Kay
            </a>
            {' '}— Frontend Engineer passionate about accessible education for African professionals.
          </p>
        </div>
      </footer>
    </div>
  )
}
