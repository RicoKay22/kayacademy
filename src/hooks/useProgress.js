import { useAppContext } from '../store/AppContext'

export function useProgress(courseId, lessons = []) {
  const { progress, completeLesson, isLessonComplete, getProgress } = useAppContext()

  const completedCount = progress[courseId]?.completedLessons?.length ?? 0
  const totalCount = lessons.length
  const percentage = getProgress(courseId, totalCount)
  const isComplete = totalCount > 0 && completedCount === totalCount

  const nextLesson = lessons.find((l) => !isLessonComplete(courseId, l.id))

  function markComplete(lessonId) {
    completeLesson(courseId, lessonId)
  }

  return {
    completedCount,
    totalCount,
    percentage,
    isComplete,
    nextLesson,
    markComplete,
    isLessonComplete: (lessonId) => isLessonComplete(courseId, lessonId),
  }
}
