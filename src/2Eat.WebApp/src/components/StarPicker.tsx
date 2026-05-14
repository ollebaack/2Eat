import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarPickerProps {
  value: number
  onChange: (value: number) => void
  size?: number
  className?: string
}

export function StarPicker({ value, onChange, size = 22, className }: StarPickerProps) {
  return (
    <span className={cn('inline-flex gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`${i} stjärnor`}
          style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', lineHeight: 0 }}
        >
          <Star
            size={size}
            strokeWidth={1.5}
            fill={i <= value ? 'var(--2eat-accent)' : 'none'}
            stroke={i <= value ? 'var(--2eat-accent)' : 'var(--ink-30)'}
          />
        </button>
      ))}
    </span>
  )
}
