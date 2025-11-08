export default function ProgressBar({ value, max = 100, className = '' }) {
  const pct = Math.min(100, Math.max(0, max === 0 ? 0 : (value / max) * 100))
  return (
    <div className={`w-full h-3 rounded-full bg-neutral-200 overflow-hidden ${className}`} title={`${Math.round(pct)}%`}>
      <div
        className="h-full bg-gradient-to-r from-pink-400 via-violet-400 to-sky-400 transition-all"
        style={{ width: pct + '%' }}
      />
    </div>
  )
}
