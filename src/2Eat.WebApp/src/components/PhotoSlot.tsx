import { useId } from 'react'
import { getFileUrl } from '@/lib/api'
import { recipeSwatch } from '@/lib/recipeUtils'
import { cn } from '@/lib/utils'

interface PhotoSlotProps {
  imageUrl?: string
  /** Explicit swatch color. Falls back to recipeSwatch(recipeId) or a default. */
  swatch?: string
  recipeId?: number
  label?: string
  aspect?: string
  height?: string
  className?: string
  /** Fills the nearest positioned ancestor (position: absolute inset-0). */
  fill?: boolean
}

export function PhotoSlot({
  imageUrl,
  swatch,
  recipeId,
  label = '',
  aspect = '5/4',
  height,
  className,
  fill = false,
}: PhotoSlotProps) {
  const uid = useId()
  const resolvedSwatch =
    swatch ?? (recipeId != null ? recipeSwatch(recipeId) : 'oklch(0.65 0.08 60)')

  const containerStyle: React.CSSProperties = fill
    ? { position: 'absolute', inset: 0 }
    : {
        position: 'relative',
        width: '100%',
        height: height ?? 'auto',
        aspectRatio: height ? undefined : aspect,
        overflow: 'hidden',
        borderRadius: 'inherit',
      }

  if (imageUrl) {
    return (
      <div style={containerStyle} className={cn('overflow-hidden', className)}>
        <img
          src={getFileUrl(imageUrl)}
          alt={label}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div style={{ ...containerStyle, background: resolvedSwatch }} className={cn('overflow-hidden', className)}>
      <svg width="100%" height="100%" className="absolute inset-0" aria-hidden>
        <defs>
          <pattern
            id={uid}
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(35)"
          >
            <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          </pattern>
          <radialGradient id={uid + 'r'} cx="30%" cy="25%" r="80%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${uid})`} />
        <rect width="100%" height="100%" fill={`url(#${uid}r)`} />
      </svg>
    </div>
  )
}
