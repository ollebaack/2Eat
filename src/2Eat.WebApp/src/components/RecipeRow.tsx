import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import type { Recipe } from '@/types'
import { Button } from '@/components/ui/button'
import { PhotoSlot } from '@/components/PhotoSlot'
import { StarRating } from '@/components/StarRating'
import { Pill } from '@/components/Pill'
import { recipeSwatch } from '@/lib/recipeUtils'

interface RecipeRowProps {
  recipe: Recipe
  onDelete: (recipe: Recipe) => void
}

export function RecipeRow({ recipe, onDelete }: RecipeRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="grid gap-5 items-center px-[18px] py-[14px] bg-paper rounded-[14px] transition-[border-color] duration-150"
      style={{
        gridTemplateColumns: '120px 1fr auto auto auto auto',
        border: `1px solid ${hovered ? 'var(--ink-30)' : 'var(--line)'}`,
      }}
    >
      <div className="rounded-[10px] overflow-hidden h-[70px]">
        <PhotoSlot imageUrl={recipe.imageUrl} swatch={recipeSwatch(recipe.id)} height="70px" />
      </div>

      <div className="flex flex-col gap-1 min-w-0">
        <Link to={`/recipes/${recipe.id}`} className="no-underline">
          <h3
            className="text-ink m-0 font-normal leading-[1.1]"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: '-0.02em' }}
          >
            {recipe.name}
          </h3>
        </Link>
        <p
          className="text-ink-60 m-0 truncate"
          style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5 }}
        >
          {recipe.description}
        </p>
      </div>

      {recipe.category && <Pill tone="default" size="sm">{recipe.category.name}</Pill>}

      <div
        className="text-ink-50 text-right"
        style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em' }}
      >
        <div>{recipe.totalTime} MIN</div>
        <div>{recipe.servings} PERS</div>
      </div>

      <StarRating value={recipe.rating} size={12} />

      <Button
        variant="ghost"
        size="icon"
        aria-label="Ta bort recept"
        className="h-8 w-8"
        onClick={() => onDelete(recipe)}
      >
        <Trash2 size={14} className="text-destructive" />
      </Button>
    </article>
  )
}
