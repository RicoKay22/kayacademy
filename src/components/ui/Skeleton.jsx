// Reusable skeleton components for loading states

export function SkeletonBox({ className = '' }) {
  return (
    <div className={`bg-navy-800 rounded-xl animate-pulse ${className}`} />
  )
}

export function CourseCardSkeleton() {
  return (
    <div className="card flex flex-col overflow-hidden">
      {/* Thumbnail */}
      <div className="aspect-video bg-navy-800 animate-pulse" />
      {/* Content */}
      <div className="p-5 flex flex-col gap-3">
        <SkeletonBox className="h-4 w-20" />
        <SkeletonBox className="h-5 w-full" />
        <SkeletonBox className="h-5 w-3/4" />
        <SkeletonBox className="h-4 w-24" />
        <div className="flex gap-3 mt-1">
          <SkeletonBox className="h-3 w-12" />
          <SkeletonBox className="h-3 w-16" />
          <SkeletonBox className="h-3 w-12" />
        </div>
      </div>
    </div>
  )
}

export function CourseCardSkeletonGrid({ count = 4 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass p-6 flex flex-col gap-3">
          <SkeletonBox className="h-5 w-5" />
          <SkeletonBox className="h-8 w-16" />
          <SkeletonBox className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

export function LessonListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-2 max-w-3xl">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5">
          <SkeletonBox className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <SkeletonBox className="h-4 w-3/4" />
            <SkeletonBox className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-navy-950 pt-24 page-enter">
      <div className="border-b border-white/5 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-4">
            <SkeletonBox className="h-4 w-48" />
            <SkeletonBox className="h-10 w-full" />
            <SkeletonBox className="h-10 w-3/4" />
            <SkeletonBox className="h-5 w-full" />
            <SkeletonBox className="h-5 w-2/3" />
            <div className="flex gap-3">
              <SkeletonBox className="h-6 w-20" />
              <SkeletonBox className="h-6 w-24" />
              <SkeletonBox className="h-6 w-20" />
            </div>
          </div>
          <div className="lg:w-80">
            <div className="glass p-6 space-y-4">
              <SkeletonBox className="aspect-video w-full" />
              <SkeletonBox className="h-8 w-24" />
              <SkeletonBox className="h-4 w-40" />
              <SkeletonBox className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <SkeletonBox className="h-7 w-48 mb-6" />
        <LessonListSkeleton count={6} />
      </div>
    </div>
  )
}
