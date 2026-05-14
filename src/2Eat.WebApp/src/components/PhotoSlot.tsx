import { ImageOff } from 'lucide-react'
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
    <div
      style={{ ...containerStyle, background: resolvedSwatch }}
      className={cn('overflow-hidden flex items-center justify-center', className)}
    >
      <div className="flex flex-col items-center gap-1.5 text-white/50 select-none">
        <ImageOff size={28} strokeWidth={1.5} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Ingen bild
        </span>
      </div>
    </div>
  )
}
