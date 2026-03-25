import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, BookOpen } from 'lucide-react'
import { COURSES, CATEGORIES } from '../data/courses'
import { CourseCard } from '../components/course/CourseCard'

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

// Highlight matching text in a string
function Highlight({ text, query }) {
  if (!query || !text) return <span>{text}</span>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-electric-500/30 text-electric-300 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  )
}

// Score a course against a search query — higher = better match
function scoreMatch(course, query) {
  if (!query) return 1
  const q = query.toLowerCase()
  let score = 0
  // Title match is highest value
  if (course.title.toLowerCase().includes(q)) score += 10
  // Exact tag match
  if (course.tags.some(t => t.toLowerCase() === q)) score += 8
  // Partial tag match
  if (course.tags.some(t => t.toLowerCase().includes(q))) score += 5
  // Instructor match
  if (course.instructor.toLowerCase().includes(q)) score += 4
  // Description match
  if (course.description?.toLowerCase().includes(q)) score += 3
  // Lesson title match
  if (course.lessons.some(l => l.title.toLowerCase().includes(q))) score += 2
  // Category label match
  const cat = CATEGORIES.find(c => c.id === course.category)
  if (cat?.label.toLowerCase().includes(q)) score += 2
  return score
}

// Find which lesson titles match the query
function matchingLessons(course, query) {
  if (!query) return []
  const q = query.toLowerCase()
  return course.lessons.filter(l => l.title.toLowerCase().includes(q)).slice(0, 2)
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all')
  const [activeLevel, setActiveLevel] = useState('All Levels')

  const filtered = useMemo(() => {
    return COURSES
      .filter(c => {
        const matchCategory = activeCategory === 'all' || c.category === activeCategory
        const matchLevel = activeLevel === 'All Levels' || c.level === activeLevel
        const score = scoreMatch(c, search)
        return matchCategory && matchLevel && score > 0
      })
      .sort((a, b) => scoreMatch(b, search) - scoreMatch(a, search))
  }, [search, activeCategory, activeLevel])

  // Suggestions — popular tags across all courses
  const suggestions = useMemo(() => {
    const allTags = COURSES.flatMap(c => c.tags)
    const unique = [...new Set(allTags)]
    return unique.slice(0, 8)
  }, [])

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
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses, lessons, instructors, topics..."
              className="input-field pl-11 pr-10 w-full"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick suggestion pills — show when not searching */}
          {!search && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-slate-600 flex items-center">Try:</span>
              {suggestions.map(tag => (
                <button key={tag} onClick={() => setSearch(tag)}
                  className="text-xs bg-navy-800 hover:bg-electric-500/10 hover:text-electric-400 text-slate-500 border border-white/5 hover:border-electric-500/20 px-2.5 py-1 rounded-lg transition-all">
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Search summary when active */}
          {search && (
            <p className="text-sm text-slate-500 mt-3">
              {filtered.length > 0
                ? <>Found <span className="text-white font-medium">{filtered.length}</span> result{filtered.length !== 1 ? 's' : ''} for <span className="text-electric-400">"{search}"</span> — sorted by relevance</>
                : <>No results for <span className="text-white">"{search}"</span></>
              }
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Filters row */}
        <div className="flex flex-wrap gap-3 mb-8">
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
            <p className="font-display text-2xl text-white mb-2">No courses found</p>
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
            {!search && (
              <p className="text-slate-500 text-sm mb-6">
                {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
              </p>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-16">
              {filtered.map(course => {
                const lessonMatches = matchingLessons(course, search)
                return (
                  <div key={course.id} className="flex flex-col">
                    <CourseCard course={course} />
                    {/* Show matching lessons when searching */}
                    {search && lessonMatches.length > 0 && (
                      <div className="mt-2 px-3 py-2 bg-electric-500/5 border border-electric-500/15 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                          <BookOpen size={10} /> Matching lessons:
                        </p>
                        {lessonMatches.map(l => (
                          <p key={l.id} className="text-xs text-electric-400 truncate">
                            · <Highlight text={l.title} query={search} />
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
