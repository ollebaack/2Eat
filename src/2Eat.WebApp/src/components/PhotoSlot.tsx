import { ImageOff } from 'lucide-react'
import { recipeSwatch } from '@/lib/recipeUtils'
import { cn } from '@/lib/utils'
import { useAuthenticatedSrc } from '@/hooks/useAuthenticatedSrc'

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

  const src = useAuthenticatedSrc(imageUrl)

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

  return (
    <div
      style={{ ...containerStyle, background: resolvedSwatch }}
      className={cn('overflow-hidden', !src && !imageUrl && 'flex items-center justify-center', className)}
    >
      {src ? (
        <img src={src} alt={label} className="w-full h-full object-cover" />
      ) : !imageUrl ? (
        <div className="flex flex-col items-center gap-1.5 text-white/50 select-none">
          <ImageOff size={28} strokeWidth={1.5} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Ingen bild
          </span>
        </div>
      ) : null}
    </div>
  )
}
