import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  size?: number
  className?: string
}

export function StarRating({ value = 0, size = 11, className }: StarRatingProps) {
  return (
    <span className={cn('inline-flex gap-[2px]', className)}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          fill={i <= value ? 'var(--2eat-accent)' : 'none'}
          stroke={i <= value ? 'var(--2eat-accent)' : 'var(--ink-30)'}
        />
      ))}
    </span>
  )
}
