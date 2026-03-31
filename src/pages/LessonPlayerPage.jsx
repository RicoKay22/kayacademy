import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { CheckCircle, ChevronLeft, ChevronRight, List, X, Lock, Award, PlayCircle, FileText, Loader } from 'lucide-react'
import { getCourseById } from '../data/courses'
import { useAppContext } from '../store/AppContext'
import { useProgress } from '../hooks/useProgress'
import { useNotifications } from '../store/NotificationContext'
import { ProgressBar } from '../components/ui/ProgressBar'
import { NotesPanel } from '../components/lesson/NotesPanel'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function parseDurationStr(str) {
  if (!str) return 0
  const parts = str.split(':').map(Number)
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

function isTimestampChapter(url) {
  return url?.includes('?start=') || url?.includes('&start=')
}

function getStartSeconds(url) {
  const match = url?.match(/[?&]start=(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

function getYouTubeId(url) {
  const match = url?.match(/embed\/([^?&]+)/)
  return match ? match[1] : null
}

// Load YouTube IFrame API once globally
let ytApiLoaded = false
let ytApiCallbacks = []

function loadYouTubeAPI(callback) {
  if (window.YT && window.YT.Player) { callback(); return }
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

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function LessonPlayerPage() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const course = getCourseById(courseId)
  const { isEnrolled, isLessonComplete } = useAppContext()
  const { percentage, completedCount, markComplete } = useProgress(courseId, course?.lessons ?? [])
  const { addNotification } = useNotifications()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarTab, setSidebarTab] = useState('lessons')
  const [isPlaying, setIsPlaying] = useState(false)
  const [actualDuration, setActualDuration] = useState(0)
  const [playerLoading, setPlayerLoading] = useState(true) // show loading spinner

  const playerInstanceRef = useRef(null)
  const watchIntervalRef = useRef(null)
  const positionIntervalRef = useRef(null)
  const watchedRef = useRef(0)
  const isMountedRef = useRef(true)

  const storageKey = `ka_watch_${courseId}_${lessonId}`
  const positionKey = `ka_pos_${courseId}_${lessonId}`

  const savedSeconds = parseInt(localStorage.getItem(storageKey) ?? '0', 10) || 0
  const [watchedSeconds, setWatchedSeconds] = useState(savedSeconds)

  // ── Mount/unmount + popstate ──────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true

    function handlePopState() {
      clearInterval(watchIntervalRef.current)
      clearInterval(positionIntervalRef.current)
      if (playerInstanceRef.current) {
        try { playerInstanceRef.current.pauseVideo() } catch (e) {}
      }
      destroyPlayer()
    }
    window.addEventListener('popstate', handlePopState)

    return () => {
      isMountedRef.current = false
      window.removeEventListener('popstate', handlePopState)
      clearInterval(watchIntervalRef.current)
      clearInterval(positionIntervalRef.current)
      destroyPlayer()
    }
  }, [])

  // ── Page Visibility: pause when tab hidden ────────────────────────────────
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        clearInterval(watchIntervalRef.current)
        clearInterval(positionIntervalRef.current)
        setIsPlaying(false)
        if (playerInstanceRef.current) {
          try { playerInstanceRef.current.pauseVideo() } catch (e) {}
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // ── Derived values ────────────────────────────────────────────────────────
  const enrolled = isEnrolled(course?.id ?? '')
  const lessonIndex = course?.lessons.findIndex(l => l.id === lessonId) ?? -1
  const lesson = course?.lessons[lessonIndex]
  const prevLesson = course?.lessons[lessonIndex - 1]
  const nextLesson = course?.lessons[lessonIndex + 1]
  const isComplete = isLessonComplete(courseId, lessonId)
  const prevLessonDone = lessonIndex === 0 || isLessonComplete(courseId, course?.lessons[lessonIndex - 1]?.id ?? '')
  const isSequentialLocked = !prevLessonDone && !isComplete
  const isEnrollLocked = !enrolled && !lesson?.free
  const videoId = getYouTubeId(lesson?.videoUrl)
  const isChapter = isTimestampChapter(lesson?.videoUrl)

  const lessonDurationSeconds = parseDurationStr(lesson?.duration)
  const effectiveDuration = isChapter
    ? lessonDurationSeconds
    : actualDuration > 0 ? actualDuration : 0

  const requiredSeconds = effectiveDuration > 0 ? Math.floor(effectiveDuration * 0.97) : 0
  const watchTimerDone = (requiredSeconds > 0 && watchedSeconds >= requiredSeconds) || isComplete
  const watchProgress = requiredSeconds > 0 ? Math.min((watchedSeconds / requiredSeconds) * 100, 100) : 0
  const timeRemaining = Math.max(requiredSeconds - watchedSeconds, 0)
  const allComplete = percentage === 100

  // ── destroyPlayer ─────────────────────────────────────────────────────────
  function destroyPlayer() {
    if (!playerInstanceRef.current) return
    const player = playerInstanceRef.current
    playerInstanceRef.current = null
    try {
      if (typeof player.destroy === 'function') player.destroy()
    } catch (e) {}
  }

  // ── Reset watch state on lesson change ────────────────────────────────────
  useEffect(() => {
    if (!isMountedRef.current) return
    const saved = parseInt(localStorage.getItem(storageKey) ?? '0', 10) || 0
    setWatchedSeconds(saved)
    watchedRef.current = saved
    setIsPlaying(false)
    setActualDuration(0)
    setPlayerLoading(true)
    clearInterval(watchIntervalRef.current)
  }, [lessonId])

  // ── YouTube player init ───────────────────────────────────────────────────
  useEffect(() => {
    if (!videoId || isComplete || !lesson) {
      setPlayerLoading(false)
      return
    }

    const containerId = `yt-player-${lessonId}`

    // Reduced to 150ms — enough for DOM to commit the new node, faster load
    const initTimeout = setTimeout(() => {
      if (!isMountedRef.current) return
      if (playerInstanceRef.current) return
      if (!window.document.getElementById(containerId)) return

      loadYouTubeAPI(() => {
        if (!isMountedRef.current) return
        if (playerInstanceRef.current) return
        if (!window.YT?.Player) return

        try {
          const startSeconds = getStartSeconds(lesson?.videoUrl)
          playerInstanceRef.current = new window.YT.Player(containerId, {
            videoId,
            playerVars: {
              autoplay: 0,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
              origin: window.location.origin,
              ...(startSeconds > 0 && { start: startSeconds }),
            },
            events: {
              onReady: (event) => {
                if (!isMountedRef.current) return
                setIsPlaying(false)
                setPlayerLoading(false) // hide loading spinner

                if (!isChapter) {
                  try {
                    const dur = event.target.getDuration()
                    if (dur && dur > 0) setActualDuration(dur)
                  } catch (e) {}
                }

                // Restore saved position
                try {
                  const savedPos = parseFloat(localStorage.getItem(positionKey) ?? '0') || 0
                  const chapterStart = getStartSeconds(lesson?.videoUrl)
                  if (savedPos > 5 && savedPos > chapterStart) {
                    event.target.seekTo(savedPos, true)
                  }
                } catch (e) {}

                // Save position every 5s
                clearInterval(positionIntervalRef.current)
                positionIntervalRef.current = setInterval(() => {
                  if (!isMountedRef.current) { clearInterval(positionIntervalRef.current); return }
                  try {
                    const pos = playerInstanceRef.current?.getCurrentTime?.()
                    if (pos && pos > 0) localStorage.setItem(positionKey, String(pos))
                  } catch (e) {}
                }, 5000)
              },
              onStateChange: (event) => {
                if (!isMountedRef.current) return
                const YT = window.YT?.PlayerState
                if (!YT) return
                setIsPlaying(event.data === YT.PLAYING)
                // Hide loading once video actually starts
                if (event.data === YT.PLAYING || event.data === YT.PAUSED) {
                  setPlayerLoading(false)
                }
              },
              onError: (e) => {
                console.warn('YouTube player error:', e.data)
                if (isMountedRef.current) {
                  setIsPlaying(false)
                  setPlayerLoading(false)
                }
              },
            },
          })
        } catch (e) {
          console.warn('YT init error:', e)
          setPlayerLoading(false)
        }
      })
    }, 150) // reduced from 400ms

    return () => clearTimeout(initTimeout)
  }, [videoId, lessonId, isComplete])

  // ── Watch timer ───────────────────────────────────────────────────────────
  useEffect(() => {
    clearInterval(watchIntervalRef.current)
    if (isPlaying && !watchTimerDone) {
      watchIntervalRef.current = setInterval(() => {
        if (!isMountedRef.current) { clearInterval(watchIntervalRef.current); return }
        watchedRef.current += 1
        setWatchedSeconds(watchedRef.current)
        localStorage.setItem(storageKey, String(watchedRef.current))
      }, 1000)
    }
    return () => clearInterval(watchIntervalRef.current)
  }, [isPlaying, watchTimerDone])

  // ── Safe navigation ───────────────────────────────────────────────────────
  function safeNavigate(path, actionBeforeNav = null) {
    clearInterval(watchIntervalRef.current)
    clearInterval(positionIntervalRef.current)
    destroyPlayer()
    setTimeout(() => {
      if (!isMountedRef.current) return
      if (actionBeforeNav) actionBeforeNav()
      navigate(path)
    }, 100)
  }

  function handleMarkComplete() {
    if (!watchTimerDone) return
    clearInterval(watchIntervalRef.current)
    clearInterval(positionIntervalRef.current)
    destroyPlayer()
    localStorage.removeItem(storageKey)
    localStorage.removeItem(positionKey)
    setTimeout(() => {
      if (isMountedRef.current) markComplete(lessonId, addNotification)
    }, 100)
  }

  function handleNext() {
    if (!watchTimerDone || !nextLesson) return
    localStorage.removeItem(storageKey)
    localStorage.removeItem(positionKey)
    safeNavigate(`/course/${courseId}/lesson/${nextLesson.id}`, () => markComplete(lessonId, addNotification))
  }

  function handlePrev() {
    if (!prevLesson) return
    safeNavigate(`/course/${courseId}/lesson/${prevLesson.id}`)
  }

  function handleSidebarNav(targetLessonId) {
    if (targetLessonId === lessonId) return
    safeNavigate(`/course/${courseId}/lesson/${targetLessonId}`)
  }

  // ── Early returns ─────────────────────────────────────────────────────────
  if (!course) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <Link to="/catalog" className="btn-primary">Back to Catalog</Link>
    </div>
  )

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
        <button onClick={handlePrev} className="btn-primary inline-flex items-center gap-2">
          <ChevronLeft size={16} /> Go to Previous Lesson
        </button>
      </div>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  // KEY FIX for keyboard issue: position:fixed + overflow:hidden on the outer
  // container prevents the browser from ever window-scrolling the page when
  // the notes textarea gets focus. Without this, Chrome Android scrolls the
  // entire page up to reveal the focused input, hiding the video.
  return (
    <div
      className="bg-navy-950 flex flex-col"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}
    >
      {/* Top bar */}
      <div className="h-14 bg-navy-900/80 backdrop-blur-xl border-b border-white/5 flex items-center px-3 gap-2 flex-shrink-0 z-10">
        <Link to={`/course/${courseId}`} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors flex-shrink-0">
          <ChevronLeft size={16} />
          <span className="hidden sm:inline truncate max-w-[200px]">{course.title}</span>
        </Link>
        <div className="flex-1">
          <ProgressBar percentage={percentage} />
        </div>
        <span className="text-xs text-slate-500 flex-shrink-0">{completedCount}/{course.lessons.length}</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-ghost p-2 flex-shrink-0">
          {sidebarOpen ? <X size={18} /> : <List size={18} />}
        </button>
      </div>

      {/* Main content — vertical on mobile, horizontal on desktop */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">

        {/* Video + Controls */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

          {/* Video section — sticky/fixed height, never scrolls away */}
          <div
            className="relative bg-black flex-shrink-0"
            style={{ paddingTop: 'min(56.25%, 40vh)' }}
          >
            {isComplete ? (
              <iframe
                key={`done-${lessonId}`}
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <>
                <div
                  key={lessonId}
                  id={`yt-player-${lessonId}`}
                  className="absolute inset-0 w-full h-full bg-black"
                />
                {/* Loading spinner shown while YouTube API attaches */}
                {playerLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
                    <Loader size={28} className="text-electric-400 animate-spin" />
                    <p className="text-xs text-slate-400">Loading video...</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Controls — scrollable area below video */}
          <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-4">
            <div className="max-w-3xl mx-auto">
              {/* Lesson title */}
              <div className="mb-2">
                <p className="text-xs text-slate-500 mb-0.5">Lesson {lessonIndex + 1} of {course.lessons.length}</p>
                <h1 className="font-display text-base sm:text-xl font-bold text-white leading-tight">{lesson.title}</h1>
              </div>

              {/* Watch tracker */}
              {!isComplete && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      {effectiveDuration === 0
                        ? <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" /> Loading...</>
                        : isPlaying
                          ? <><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" /> Tracking</>
                          : <><PlayCircle size={11} /> Play to track</>
                      }
                    </span>
                    <span className={`text-xs font-semibold flex-shrink-0 ${watchTimerDone ? 'text-emerald-400' : 'text-electric-400'}`}>
                      {effectiveDuration === 0 ? '—' : watchTimerDone ? '✓ Done' : `${formatTime(timeRemaining)} left`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${watchTimerDone ? 'bg-emerald-500' : 'bg-electric-500'}`}
                      style={{ width: `${watchProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handlePrev}
                  disabled={!prevLesson}
                  className="btn-secondary flex items-center gap-1 text-sm py-2 px-3 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0">
                  <ChevronLeft size={15} /> Prev
                </button>

                <button
                  onClick={handleMarkComplete}
                  disabled={!watchTimerDone}
                  className={`flex items-center gap-1.5 text-sm py-2 px-3 rounded-xl font-medium transition-all flex-1 justify-center min-w-0
                    ${isComplete
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 cursor-default'
                      : watchTimerDone
                        ? 'btn-primary'
                        : 'bg-navy-800 text-slate-500 border border-white/10 cursor-not-allowed'}`}>
                  <CheckCircle size={15} className="flex-shrink-0" />
                  <span className="truncate">
                    {isComplete ? '✓ Complete' : watchTimerDone ? 'Mark Complete' : 'Watch to Unlock'}
                  </span>
                </button>

                {nextLesson ? (
                  <button
                    onClick={handleNext}
                    disabled={!watchTimerDone}
                    className={`flex items-center gap-1 text-sm py-2 px-3 rounded-xl font-medium transition-all flex-shrink-0
                      ${watchTimerDone ? 'btn-primary' : 'bg-navy-800 text-slate-500 border border-white/10 cursor-not-allowed opacity-60'}`}>
                    Next <ChevronRight size={15} />
                  </button>
                ) : !isComplete ? (
                  <button
                    onClick={handleMarkComplete}
                    disabled={!watchTimerDone}
                    className={`flex items-center gap-1 text-sm py-2 px-3 rounded-xl font-medium transition-all flex-shrink-0
                      ${watchTimerDone ? 'btn-primary bg-emerald-600 hover:bg-emerald-500' : 'bg-navy-800 text-slate-500 border border-white/10 cursor-not-allowed opacity-60'}`}>
                    <Award size={15} /> Finish
                  </button>
                ) : (
                  <Link
                    to={`/certificate/${courseId}`}
                    className="btn-primary flex items-center gap-1 text-sm py-2 px-3 bg-emerald-600 hover:bg-emerald-500 flex-shrink-0">
                    <Award size={15} /> Certificate
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="border-white/5 flex flex-col bg-navy-900/80 md:w-72 md:border-l md:flex-shrink-0 border-t md:border-t-0 flex-shrink-0"
            style={{ height: sidebarTab === 'notes' ? '45%' : '40%', maxHeight: sidebarTab === 'notes' ? '60%' : '40%' }}
          >
            {/* Tab switcher */}
            <div className="flex border-b border-white/5 flex-shrink-0">
              <button
                onClick={() => setSidebarTab('lessons')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all
                  ${sidebarTab === 'lessons' ? 'text-white border-b-2 border-electric-500' : 'text-slate-500 hover:text-slate-300'}`}>
                <List size={13} /> Lessons
              </button>
              <button
                onClick={() => setSidebarTab('notes')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all
                  ${sidebarTab === 'notes' ? 'text-white border-b-2 border-electric-500' : 'text-slate-500 hover:text-slate-300'}`}>
                <FileText size={13} /> Notes
              </button>
            </div>

            {sidebarTab === 'lessons' && (
              <>
                <div className="px-3 py-2 border-b border-white/5 flex-shrink-0">
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
                        onClick={() => { if (!locked) handleSidebarNav(l.id) }}
                        disabled={locked}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-all
                          ${active ? 'bg-electric-500/10 border-r-2 border-electric-500' : 'hover:bg-white/5'}
                          ${locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs
                          ${done ? 'bg-emerald-500/20 text-emerald-400' : active ? 'bg-electric-500 text-white' : 'bg-navy-800 text-slate-600'}`}>
                          {done ? <CheckCircle size={11} /> : locked ? <Lock size={9} /> : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`truncate text-xs ${active ? 'text-electric-400 font-medium' : done ? 'text-emerald-400' : 'text-slate-400'}`}>{l.title}</p>
                          <p className="text-xs text-slate-600">{l.duration}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {sidebarTab === 'notes' && (
              <div className="flex-1 overflow-hidden min-h-0">
                <NotesPanel courseId={courseId} lessonId={lessonId} lessonTitle={lesson?.title ?? ''} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
