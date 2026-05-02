import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number // 0-100
  className?: string
  showLabel?: boolean
  color?: string
}

export function ProgressBar({ value, className, showLabel = false, color }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))

  const fillColor =
    color ??
    (pct === 100
      ? 'bg-emerald-500'
      : pct >= 60
      ? 'bg-blue-500'
      : pct >= 30
      ? 'bg-amber-500'
      : 'bg-slate-500')

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 progress-bar">
        <div
          className={cn('progress-fill', fillColor)}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-400 font-mono w-8 text-right shrink-0">
          {pct}%
        </span>
      )}
    </div>
  )
}
