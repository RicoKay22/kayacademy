import { useAppContext } from '../store/AppContext'

export function useProgress(courseId, lessons = []) {
  const { progress, completeLesson, isLessonComplete, getProgress } = useAppContext()

  const completedCount = progress[courseId]?.completedLessons?.length ?? 0
  const totalCount = lessons.length
  const percentage = getProgress(courseId, totalCount)
  const isComplete = totalCount > 0 && completedCount === totalCount
  const nextLesson = lessons.find((l) => !isLessonComplete(courseId, l.id))

  // addNotification is optional — passed from pages that have access to it
  function markComplete(lessonId, addNotification) {
    completeLesson(courseId, lessonId, addNotification)
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
