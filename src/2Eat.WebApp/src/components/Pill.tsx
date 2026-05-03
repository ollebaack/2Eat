import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type PillTone = 'default' | 'accent' | 'ink' | 'ghost'
type PillSize = 'sm' | 'md'

interface PillProps {
  children: React.ReactNode
  tone?: PillTone
  size?: PillSize
  className?: string
}

const toneStyles: Record<PillTone, React.CSSProperties> = {
  default: {
    background: 'var(--surface-2)',
    color: 'var(--ink-70)',
    borderColor: 'var(--line)',
  },
  accent: {
    background: 'color-mix(in oklch, var(--2eat-accent) 12%, transparent)',
    color: 'var(--2eat-accent-deep)',
    borderColor: 'color-mix(in oklch, var(--2eat-accent) 35%, transparent)',
  },
  ink: {
    background: 'var(--ink)',
    color: 'var(--paper)',
    borderColor: 'var(--ink)',
  },
  ghost: {
    background: 'rgba(255,255,255,0.82)',
    color: 'var(--ink)',
    borderColor: 'transparent',
  },
}

export function Pill({ children, tone = 'default', size = 'md', className }: PillProps) {
  return (
    <Badge
      variant="outline"
      className={cn('font-mono uppercase leading-none gap-1 whitespace-nowrap', className)}
      style={{
        ...toneStyles[tone],
        fontSize: size === 'sm' ? 10.5 : 11.5,
        letterSpacing: '0.06em',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
      }}
    >
      {children}
    </Badge>
  )
}
