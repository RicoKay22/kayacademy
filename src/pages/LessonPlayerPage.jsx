import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle, ChevronLeft, ChevronRight, List, X, Lock, Award, Clock, PlayCircle } from 'lucide-react'
import { getCourseById } from '../data/courses'
import { useAppContext } from '../store/AppContext'
import { useProgress } from '../hooks/useProgress'
import { ProgressBar } from '../components/ui/ProgressBar'

function parseDuration(str) {
  if (!str) return 300
  const parts = str.split(':').map(Number)
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 300
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Extract YouTube video ID from embed URL
function getYouTubeId(url) {
  const match = url?.match(/embed\/([^?&]+)/)
  return match ? match[1] : null
}

// Load YouTube IFrame API once globally
let ytApiLoaded = false
let ytApiCallbacks = []

function loadYouTubeAPI(callback) {
  if (window.YT && window.YT.Player) {
    callback()
    return
  }
  ytApiCallbacks.push(callback)
  if (!ytApiLoaded) {
    ytApiLoaded = true
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
    window.onYouTubeIframeAPIReady = () => {
      ytApiCallbacks.forEach(cb => cb())
      ytApiCallbacks = []
    }
  }
}

export default function LessonPlayerPage() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const course = getCourseById(courseId)
  const { isEnrolled, isLessonComplete } = useAppContext()
  const { percentage, completedCount, markComplete } = useProgress(courseId, course?.lessons ?? [])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Watch time tracking
  const [watchedSeconds, setWatchedSeconds] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const playerRef = useRef(null)
  const playerContainerRef = useRef(null)
  const watchIntervalRef = useRef(null)
  const watchedRef = useRef(0) // ref to avoid stale closure in interval

  if (!course) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <Link to="/catalog" className="btn-primary">Back to Catalog</Link>
    </div>
  )

  const enrolled = isEnrolled(course.id)
  const lessonIndex = course.lessons.findIndex(l => l.id === lessonId)
  const lesson = course.lessons[lessonIndex]
  const prevLesson = course.lessons[lessonIndex - 1]
  const nextLesson = course.lessons[lessonIndex + 1]
  const isComplete = isLessonComplete(courseId, lessonId)
  const prevLessonDone = lessonIndex === 0 || isLessonComplete(courseId, course.lessons[lessonIndex - 1]?.id)
  const isSequentialLocked = !prevLessonDone && !isComplete
  const isEnrollLocked = !enrolled && !lesson?.free

  const totalSeconds = parseDuration(lesson?.duration)
  const requiredSeconds = Math.floor(totalSeconds * 0.7)
  const watchTimerDone = watchedSeconds >= requiredSeconds || isComplete
  const watchProgress = Math.min((watchedSeconds / requiredSeconds) * 100, 100)
  const timeRemaining = Math.max(requiredSeconds - watchedSeconds, 0)
  const videoId = getYouTubeId(lesson?.videoUrl)

  // Reset when lesson changes
  useEffect(() => {
    setWatchedSeconds(0)
    watchedRef.current = 0
    setIsPlaying(false)
    setPlayerReady(false)
    clearInterval(watchIntervalRef.current)

    // Destroy old player
    if (playerRef.current) {
      try { playerRef.current.destroy() } catch (e) {}
      playerRef.current = null
    }
  }, [lessonId])

  // Init YouTube player
  useEffect(() => {
    if (!videoId || isComplete) return

    const containerId = `yt-player-${lessonId}`

    loadYouTubeAPI(() => {
      if (playerRef.current) return // already created

      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => setPlayerReady(true),
          onStateChange: (event) => {
            const YT = window.YT.PlayerState
            if (event.data === YT.PLAYING) {
              setIsPlaying(true)
            } else {
              setIsPlaying(false)
            }
          },
        },
      })
    })

    return () => {
      clearInterval(watchIntervalRef.current)
    }
  }, [videoId, lessonId, isComplete])

  // Count watch time only when actually playing
  useEffect(() => {
    clearInterval(watchIntervalRef.current)
    if (isPlaying && !watchTimerDone) {
      watchIntervalRef.current = setInterval(() => {
        watchedRef.current += 1
        setWatchedSeconds(watchedRef.current)
      }, 1000)
    }
    return () => clearInterval(watchIntervalRef.current)
  }, [isPlaying, watchTimerDone])

  if (!lesson) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <Link to={`/course/${courseId}`} className="btn-primary">Back to Course</Link>
    </div>
  )

  if (isEnrollLocked) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="glass p-10 text-center max-w-sm">
        <Lock size={40} className="text-slate-500 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-white mb-2">Lesson Locked</h2>
        <p className="text-slate-400 text-sm mb-6">Enroll in this course to access all lessons.</p>
        <Link to={`/course/${courseId}`} className="btn-primary inline-flex">Enroll Now</Link>
      </div>
    </div>
  )

  if (isSequentialLocked) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="glass p-10 text-center max-w-sm">
        <Lock size={40} className="text-amber-500 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-white mb-2">Complete Previous Lesson First</h2>
        <p className="text-slate-400 text-sm mb-6">
          Finish <span className="text-white font-medium">"{prevLesson?.title}"</span> to unlock this lesson.
        </p>
        <button onClick={() => navigate(`/course/${courseId}/lesson/${prevLesson.id}`)}
          className="btn-primary inline-flex items-center gap-2">
          <ChevronLeft size={16} /> Go to Previous Lesson
        </button>
      </div>
    </div>
  )

  const allComplete = percentage === 100

  function handleMarkComplete() {
    if (!watchTimerDone) return
    markComplete(lessonId)
  }

  function handleNext() {
    if (!watchTimerDone) return
    markComplete(lessonId)
    navigate(`/course/${courseId}/lesson/${nextLesson.id}`)
  }

  return (
    <div className="h-screen bg-navy-950 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="h-14 bg-navy-900/80 backdrop-blur-xl border-b border-white/5 flex items-center px-4 gap-4 flex-shrink-0 z-10">
        <Link to={`/course/${courseId}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={16} /> {course.title}
        </Link>
        <div className="flex-1 hidden md:block">
          <ProgressBar percentage={percentage} />
        </div>
        <span className="text-xs text-slate-500 hidden md:block">{completedCount}/{course.lessons.length} lessons</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-ghost p-2 ml-auto md:ml-0">
          {sidebarOpen ? <X size={18} /> : <List size={18} />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* YouTube Player */}
          <div className="relative bg-black" style={{ paddingTop: '56.25%' }}>
            {isComplete ? (
              // Already complete — just show normal iframe
              <iframe
                key={lesson.videoUrl}
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              // YT API player div
              <div
                id={`yt-player-${lessonId}`}
                ref={playerContainerRef}
                className="absolute inset-0 w-full h-full"
              />
            )}
          </div>

          {/* Lesson info & controls */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="max-w-3xl">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Lesson {lessonIndex + 1} of {course.lessons.length}</p>
                  <h1 className="font-display text-2xl font-bold text-white">{lesson.title}</h1>
                </div>

                {/* Mark complete + watch tracker */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-[200px]">
                  <button
                    onClick={handleMarkComplete}
                    disabled={!watchTimerDone}
                    className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all
                      ${isComplete
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 cursor-default'
                        : watchTimerDone
                          ? 'btn-primary'
                          : 'bg-navy-800 text-slate-500 border border-white/10 cursor-not-allowed'}`}>
                    <CheckCircle size={16} />
                    {isComplete ? '✓ Lesson Complete' : watchTimerDone ? 'Mark Complete' : 'Watch to Unlock'}
                  </button>

                  {/* Watch time progress — only when not complete */}
                  {!isComplete && (
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          {isPlaying
                            ? <><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" /> Tracking watch time</>
                            : <><PlayCircle size={11} /> Play video to track</>
                          }
                        </span>
                        <span className={`text-xs font-medium ${watchTimerDone ? 'text-emerald-400' : 'text-electric-400'}`}>
                          {watchTimerDone ? '✓ Done' : `${formatTime(timeRemaining)} left`}
                        </span>
                      </div>
                      <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${watchTimerDone ? 'bg-emerald-500' : 'bg-electric-500'}`}
                          style={{ width: `${watchProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {Math.round(watchProgress)}% watched · {formatTime(watchedSeconds)} / {formatTime(requiredSeconds)} required
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Nav buttons */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => prevLesson && navigate(`/course/${courseId}/lesson/${prevLesson.id}`)}
                  disabled={!prevLesson}
                  className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft size={16} /> Previous
                </button>

                {nextLesson ? (
                  <button
                    onClick={handleNext}
                    disabled={!watchTimerDone}
                    title={!watchTimerDone ? 'Watch at least 70% of this lesson first' : ''}
                    className={`flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl font-medium transition-all
                      ${watchTimerDone
                        ? 'btn-primary'
                        : 'bg-navy-800 text-slate-500 border border-white/10 cursor-not-allowed opacity-60'}`}>
                    Next Lesson <ChevronRight size={16} />
                  </button>
                ) : !isComplete ? (
                  <button
                    onClick={handleMarkComplete}
                    disabled={!watchTimerDone}
                    className={`flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl font-medium transition-all
                      ${watchTimerDone
                        ? 'btn-primary bg-emerald-600 hover:bg-emerald-500'
                        : 'bg-navy-800 text-slate-500 border border-white/10 cursor-not-allowed opacity-60'}`}>
                    <Award size={16} /> {watchTimerDone ? 'Complete Course' : 'Watch to Unlock'}
                  </button>
                ) : (
                  <Link to={`/certificate/${courseId}`}
                    className="btn-primary flex items-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-500">
                    <Award size={16} /> View Certificate
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-72 border-l border-white/5 flex flex-col bg-navy-900/50 flex-shrink-0 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-display font-semibold text-white text-sm mb-2">Course Content</h3>
              <ProgressBar percentage={percentage} showLabel size="sm" />
            </div>
            <div className="overflow-y-auto flex-1 lesson-scroll">
              {course.lessons.map((l, idx) => {
                const done = isLessonComplete(courseId, l.id)
                const active = l.id === lessonId
                const prevDone = idx === 0 || isLessonComplete(courseId, course.lessons[idx - 1]?.id)
                const seqLocked = !prevDone && !done
                const locked = (!enrolled && !l.free) || seqLocked

                return (
                  <button key={l.id}
                    onClick={() => !locked && navigate(`/course/${courseId}/lesson/${l.id}`)}
                    disabled={locked}
                    title={seqLocked ? 'Complete previous lesson first' : ''}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all
                      ${active ? 'bg-electric-500/10 border-r-2 border-electric-500' : 'hover:bg-white/5'}
                      ${locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs
                      ${done ? 'bg-emerald-500/20 text-emerald-400' : active ? 'bg-electric-500 text-white' : 'bg-navy-800 text-slate-600'}`}>
                      {done ? <CheckCircle size={12} /> : locked ? <Lock size={10} /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`truncate text-xs ${active ? 'text-electric-400 font-medium' : done ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {l.title}
                      </p>
                      <p className="text-xs text-slate-600">{l.duration}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
