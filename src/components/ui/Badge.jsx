const variants = {
  level: {
    Beginner: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    Intermediate: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    Advanced: 'bg-red-500/15 text-red-400 border border-red-500/20',
  },
  category: 'bg-electric-500/10 text-electric-400 border border-electric-500/20',
  free: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
}

export function Badge({ children, variant = 'category', level }) {
  const cls = level ? (variants.level[level] ?? variants.category) : variants[variant] ?? variants.category
  return <span className={`badge ${cls}`}>{children}</span>
}
