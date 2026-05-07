import { useState } from 'react'
import { Leaf, Pencil, Trash2, Wheat } from 'lucide-react'
import type { Ingredient } from '@/types'
import { Button } from '@/components/ui/button'

interface IngredientCardProps {
  ingredient: Ingredient
  onEdit: () => void
  onDelete: () => void
}

export function IngredientCard({ ingredient, onEdit, onDelete }: IngredientCardProps) {
  const [hovered, setHovered] = useState(false)
  const isVegan = ingredient.allergens?.some(a => a.id === 'Veganskt')
  const hasGluten = ingredient.allergens?.some(a => a.id === 'Gluten')

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3 px-[14px] py-3 bg-paper rounded-xl transition-[border-color] duration-150"
      style={{ border: `1px solid ${hovered ? 'var(--ink-30)' : 'var(--line)'}` }}
    >
      {/* Initial avatar */}
      <span
        className="w-8 h-8 rounded-lg shrink-0 bg-surface-2 grid place-items-center text-ink-60 italic"
        style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}
      >
        {ingredient.name[0]?.toUpperCase()}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5 }} className="text-ink">
          {ingredient.name}
        </div>
        <div
          className="text-ink-50 uppercase"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em' }}
        >
          {ingredient.category?.name ?? '—'}
        </div>
      </div>

      {/* Allergen icons */}
      <div className="flex items-center gap-1">
        {isVegan && (
          <Leaf
            size={14}
            strokeWidth={1.5}
            style={{ color: 'var(--2eat-accent-deep)' }}
            aria-label="Veganskt"
          />
        )}
        {hasGluten && (
          <Wheat
            size={14}
            strokeWidth={1.5}
            style={{ color: 'oklch(0.62 0.1 70)' }}
            aria-label="Gluten"
          />
        )}
      </div>

      {/* Edit / Delete */}
      {hovered && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-ink-50 hover:text-ink"
            aria-label="Redigera ingrediens"
            onClick={onEdit}
          >
            <Pencil size={14} strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
            aria-label="Ta bort ingrediens"
            onClick={onDelete}
          >
            <Trash2 size={14} strokeWidth={1.5} />
          </Button>
        </div>
      )}
    </div>
  )
}
