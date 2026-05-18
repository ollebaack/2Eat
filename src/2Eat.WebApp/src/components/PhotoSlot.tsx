import { useState } from 'react'
import { recipeSwatch } from '@/lib/recipeUtils'
import { cn } from '@/lib/utils'
import { useAuthenticatedSrc } from '@/hooks/useAuthenticatedSrc'
import recipePlaceholder from '@/assets/recipe-placeholder.svg'

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
  const [errored, setErrored] = useState(false)
  const [prevImageUrl, setPrevImageUrl] = useState(imageUrl)
  if (prevImageUrl !== imageUrl) {
    setPrevImageUrl(imageUrl)
    setErrored(false)
  }

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
      className={cn('overflow-hidden', className)}
    >
      {src && !errored ? (
        <img src={src} alt={label} className="w-full h-full object-cover" onError={() => setErrored(true)} />
      ) : !imageUrl || errored ? (
        <img src={recipePlaceholder} alt="" className="w-full h-full object-cover select-none" draggable={false} />
      ) : null}
    </div>
  )
}
