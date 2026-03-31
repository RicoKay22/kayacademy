export function ProgressBar({ percentage, showLabel = false, size = 'default' }) {
  const height = size === 'sm' ? 'h-1' : 'h-1.5'
  return (
    <div className="w-full min-w-0">
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5" style={{ gap: '8px' }}>
          <span className="text-xs text-slate-400" style={{ flexShrink: 0 }}>Progress</span>
          <span
            className="text-xs font-semibold text-electric-400"
            style={{ flexShrink: 0, minWidth: '36px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {percentage}%
          </span>
        </div>
      )}
      <div className={`${height} bg-navy-800 rounded-full overflow-hidden w-full`}>
        <div
          className="h-full bg-gradient-to-r from-electric-500 to-sky-400 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}
