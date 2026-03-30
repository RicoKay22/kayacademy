export function ProgressBar({ percentage, showLabel = false, size = 'default' }) {
  const height = size === 'sm' ? 'h-1' : 'h-1.5'
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 gap-2">
          <span className="text-xs text-slate-400 flex-shrink-0">Progress</span>
          <span className="text-xs font-semibold text-electric-400 flex-shrink-0 tabular-nums">{percentage}%</span>
        </div>
      )}
      <div className={`${height} bg-navy-800 rounded-full overflow-hidden w-full`}>
        <div
          className="h-full bg-gradient-to-r from-electric-500 to-sky-400 rounded-full transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
