import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Clock, Trash2, Users } from 'lucide-react'
import type { Recipe } from '@/types'
import { Button } from '@/components/ui/button'
import { PhotoSlot } from '@/components/PhotoSlot'
import { StarRating } from '@/components/StarRating'
import { Pill } from '@/components/Pill'
import { recipeSwatch } from '@/lib/recipeUtils'

interface RecipeCardProps {
  recipe: Recipe
  onDelete: (recipe: Recipe) => void
}

export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col bg-paper rounded-[18px] overflow-hidden cursor-pointer transition-[transform,border-color,box-shadow] duration-200"
      style={{
        border: `1px solid ${hovered ? 'var(--ink-30)' : 'var(--line)'}`,
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 24px -16px rgba(0,0,0,0.18)' : 'none',
      }}
    >
      <Link to={`/recept/${recipe.id}`} className="flex flex-col no-underline flex-1">
        <div className="block relative">
          <PhotoSlot
            imageUrl={recipe.imageUrl}
            swatch={recipeSwatch(recipe.id)}
            label={recipe.category?.name}
            aspect="5/4"
          />
          <div className="absolute top-3 left-3">
            <Pill tone="ink" size="sm">{recipe.totalTime} MIN</Pill>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Spara recept"
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-paper/90 backdrop-blur-sm hover:bg-paper/95"
            style={{ border: 'none' }}
            onClick={e => { e.preventDefault(); e.stopPropagation() }}
          >
            <Bookmark size={14} strokeWidth={1.5} className="text-ink" />
          </Button>
        </div>

        <div className="p-[18px] flex flex-col gap-3 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3
              className="text-ink m-0 font-normal leading-[1.15]"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: '-0.025em' }}
            >
              {recipe.name}
            </h3>
            <span
              className="text-ink-50 whitespace-nowrap pt-[6px]"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5 }}
            >
              №{String(recipe.id).padStart(3, '0')}
            </span>
          </div>

          <p
            className="text-ink-60 m-0 line-clamp-2"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.45 }}
          >
            {recipe.description}
          </p>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-line">
            <div
              className="flex items-center gap-[10px] text-ink-50"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.04em' }}
            >
              <span className="inline-flex items-center gap-1">
                <Users size={12} strokeWidth={1.5} className="text-ink-40" />
                {recipe.servings}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={12} strokeWidth={1.5} className="text-ink-40" />
                {recipe.totalTime}m
              </span>
            </div>
            <div className="flex items-center gap-[6px]">
              <StarRating value={recipe.rating} size={11} />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Ta bort recept"
                className="h-6 w-6 p-0"
                onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(recipe) }}
              >
                <Trash2 size={12} strokeWidth={1.5} className="text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
