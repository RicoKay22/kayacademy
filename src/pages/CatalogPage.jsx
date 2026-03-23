import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { COURSES, CATEGORIES } from '../data/courses'
import { CourseCard } from '../components/course/CourseCard'

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all')
  const [activeLevel, setActiveLevel] = useState('All Levels')

  const filtered = useMemo(() => {
    return COURSES.filter(c => {
      const matchCategory = activeCategory === 'all' || c.category === activeCategory
      const matchLevel = activeLevel === 'All Levels' || c.level === activeLevel
      const matchSearch = !search || 
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      return matchCategory && matchLevel && matchSearch
    })
  }, [search, activeCategory, activeLevel])

  function setCategory(id) {
    setActiveCategory(id)
    if (id !== 'all') setSearchParams({ category: id })
    else setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-navy-950 pt-24 page-enter">
      {/* Header */}
      <div className="border-b border-white/5 pb-8 px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl font-bold text-white mb-2">Course Catalog</h1>
          <p className="text-slate-400">{COURSES.length} courses across {CATEGORIES.length} disciplines</p>

          {/* Search */}
          <div className="relative mt-6 max-w-xl">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses, instructors, topics..."
              className="input-field pl-11 pr-10 w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Filters row */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCategory('all')}
              className={`badge px-3 py-1.5 text-sm cursor-pointer transition-all ${
                activeCategory === 'all' ? 'bg-electric-500 text-white border-electric-500' : 'bg-navy-800 text-slate-400 border border-white/10 hover:border-electric-500/30'
              }`}>All</button>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`badge px-3 py-1.5 text-sm cursor-pointer transition-all ${
                  activeCategory === cat.id ? 'bg-electric-500 text-white' : 'bg-navy-800 text-slate-400 border border-white/10 hover:border-electric-500/30'
                }`}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Level filter */}
          <div className="flex items-center gap-2 ml-auto">
            <SlidersHorizontal size={14} className="text-slate-500" />
            <select value={activeLevel} onChange={(e) => setActiveLevel(e.target.value)}
              className="bg-navy-800 border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-electric-500/50">
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 glass max-w-lg mx-auto p-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-display text-2xl text-white mb-2">
              No courses found
            </p>
            <p className="text-slate-400 text-sm mb-1">
              We don't have <span className="text-white font-medium">"{search || activeCategory}"</span> courses yet — but we're growing fast.
            </p>
            <p className="text-slate-600 text-xs mb-8">
              KayAcademy is actively expanding its catalog across new disciplines. Check back soon.
            </p>
            <button
              onClick={() => { setSearch(''); setCategory('all'); setActiveLevel('All Levels') }}
              className="btn-secondary text-sm">
              Clear filters & browse all courses
            </button>
          </div>
        ) : (
          <>
            <p className="text-slate-500 text-sm mb-6">{filtered.length} course{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-16">
              {filtered.map(course => <CourseCard key={course.id} course={course} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
