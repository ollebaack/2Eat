import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { getIngredients, createIngredient, deleteIngredient } from '@/lib/api'
import type { Ingredient } from '@/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function IngredientsPage() {
  const queryClient = useQueryClient()
  const [toDelete, setToDelete] = useState<Ingredient | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newName, setNewName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Alla')

  const { data: ingredients = [], isLoading } = useQuery({ queryKey: ['ingredients'], queryFn: getIngredients })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteIngredient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingrediens borttagen')
      setToDelete(null)
    },
    onError: () => toast.error('Kunde inte ta bort ingrediensen'),
  })

  const createMutation = useMutation({
    mutationFn: () => createIngredient({ name: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingrediens tillagd')
      setNewName('')
      setShowAddDialog(false)
    },
    onError: () => toast.error('Kunde inte lägga till ingrediens'),
  })

  const categories = useMemo(() => {
    return [...new Set(ingredients.map(i => i.category?.name).filter(Boolean) as string[])].sort()
  }, [ingredients])

  const groupedIngredients = useMemo(() => {
    const filtered = ingredients.filter(i => {
      if (activeCategory !== 'Alla' && i.category?.name !== activeCategory) return false
      if (searchQuery && !i.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    const groups: Record<string, typeof filtered> = {}
    filtered.forEach(i => {
      const k = i.name[0]?.toUpperCase() ?? '#'
      if (!groups[k]) groups[k] = []
      groups[k].push(i)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [ingredients, activeCategory, searchQuery])

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '36px 40px 60px', width: '100%' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', color: 'var(--2eat-accent-deep)', textTransform: 'uppercase' }}>
            Bibliotek · {ingredients.length} st
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(42px, 5vw, 60px)', letterSpacing: '-0.035em', lineHeight: 0.95, margin: '6px 0 0', fontWeight: 400, color: 'var(--ink)' }}>
            Ingredienser
          </h1>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 999, background: 'var(--ink)', color: 'var(--paper)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500 }}
        >
          + Ny ingrediens
        </button>
      </header>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        {/* Pill-shaped search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'var(--surface-1)', border: '1px solid var(--line)', borderRadius: 999, flex: '1 1 320px', maxWidth: 460 }}>
          <span style={{ color: 'var(--ink-50)', fontSize: 15 }}>⌕</span>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Sök ingrediens…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--ink)' }}
          />
        </div>
        {/* Category chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Alla', ...categories].map(cat => {
            const active = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 14px', borderRadius: 999,
                  border: '1px solid ' + (active ? 'var(--ink)' : 'var(--line)'),
                  background: active ? 'var(--ink)' : 'transparent',
                  color: active ? 'var(--paper)' : 'var(--ink-70)',
                  fontFamily: 'var(--font-sans)', fontSize: 12.5, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >{cat}</button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[60, 45, 80].map(w => (
            <div key={w}>
              <Skeleton className="h-12 mb-3" style={{ width: w }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : groupedIngredients.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 0', background: 'var(--surface-1)', borderRadius: 18, border: '1px dashed var(--line)', color: 'var(--ink-50)' }}>
          <Search size={28} strokeWidth={1.5} style={{ color: 'var(--ink-40)' }} />
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)', margin: 0 }}>Inga ingredienser hittades.</p>
        </div>
      ) : (
        /* A-Z grouped list */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {groupedIngredients.map(([letter, items]) => (
            <section key={letter}>
              {/* Section header: big italic letter + line + count */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 56, lineHeight: 0.85, letterSpacing: '-0.04em', color: 'var(--2eat-accent-deep)', fontStyle: 'italic' }}>
                  {letter}
                </span>
                <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {items.length} st
                </span>
              </div>
              {/* Ingredient cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                {items.map(ingredient => (
                  <IngredientCard key={ingredient.id} ingredient={ingredient} onDelete={() => setToDelete(ingredient)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 18 }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-serif)', fontSize: 26, letterSpacing: '-0.02em', fontWeight: 400 }}>Ny ingrediens</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-50)' }}>Namn</Label>
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="t.ex. Lax"
              style={{ fontFamily: 'var(--font-sans)', fontSize: 14, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10 }}
              onKeyDown={e => e.key === 'Enter' && newName.trim() && createMutation.mutate()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setShowAddDialog(false)}>Avbryt</Button>
            <Button
              className="rounded-full"
              style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
              disabled={!newName.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >Lägg till</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}>
        <DialogContent style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 18 }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-serif)', fontSize: 26, letterSpacing: '-0.02em', fontWeight: 400 }}>Ta bort ingrediens?</DialogTitle>
            <DialogDescription style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-60)' }}>
              Det här raderar <strong style={{ color: 'var(--ink)' }}>{toDelete?.name}</strong> permanent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setToDelete(null)}>Avbryt</Button>
            <Button
              variant="destructive"
              className="rounded-full"
              disabled={deleteMutation.isPending}
              onClick={() => toDelete && deleteMutation.mutate(toDelete.id)}
            >Ta bort</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Ingredient card with hover-reveal delete button
function IngredientCard({ ingredient, onDelete }: { ingredient: Ingredient; onDelete: () => void }) {
  const isVegan = ingredient.allergens?.some(a => a.id === 'Veganskt')
  const hasGluten = ingredient.allergens?.some(a => a.id === 'Gluten')
  const hasNuts = ingredient.allergens?.some(a => a.id === 'Nötter')

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, cursor: 'pointer', transition: 'border-color 0.15s', position: 'relative' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--ink-30)'
        const btn = e.currentTarget.querySelector('.del-btn') as HTMLElement
        if (btn) btn.style.display = 'grid'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--line)'
        const btn = e.currentTarget.querySelector('.del-btn') as HTMLElement
        if (btn) btn.style.display = 'none'
      }}
    >
      {/* Initial letter square */}
      <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--ink-60)', fontStyle: 'italic', flexShrink: 0 }}>
        {ingredient.name[0]?.toUpperCase()}
      </span>
      {/* Name + category */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--ink)' }}>{ingredient.name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-50)' }}>
          {ingredient.category?.name ?? '—'}
        </div>
      </div>
      {/* Allergen icons */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {isVegan && (
          <span title="Veganskt" style={{ color: 'var(--2eat-accent-deep)', fontSize: 14 }}>🌿</span>
        )}
        {hasGluten && (
          <span title="Gluten" style={{ color: 'oklch(0.62 0.1 70)', fontSize: 14 }}>🌾</span>
        )}
        {hasNuts && (
          <span title="Nötter" style={{ fontSize: 14 }}>🥜</span>
        )}
      </div>
      {/* Delete button — revealed on hover */}
      <button
        className="del-btn"
        onClick={e => { e.stopPropagation(); onDelete() }}
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper)', cursor: 'pointer', display: 'none', color: 'var(--ink-50)', placeItems: 'center' }}
      >✕</button>
    </div>
  )
}
