import { cn, STATUS_CONFIG } from '@/lib/utils'
import { Status } from '@prisma/client'

interface StatusBadgeProps {
  status: Status
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'badge',
        cfg.bg,
        cfg.color,
        cfg.border,
        size === 'sm' && 'text-[10px] px-2 py-0.5',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}
