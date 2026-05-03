import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Plus, Search, Leaf, Wheat } from 'lucide-react'
import { toast } from 'sonner'
import { getIngredients, createIngredient, deleteIngredient } from '@/lib/api'
import type { Ingredient } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState('Alla')

  const { data: ingredients, isLoading } = useQuery({ queryKey: ['ingredients'], queryFn: getIngredients })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteIngredient(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ingredients'] }); toast.success('Ingrediens borttagen'); setToDelete(null) },
    onError: () => toast.error('Kunde inte ta bort ingrediensen'),
  })

  const createMutation = useMutation({
    mutationFn: () => createIngredient({ name: newName }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ingredients'] }); toast.success('Ingrediens tillagd'); setNewName(''); setShowAdd(false) },
    onError: () => toast.error('Kunde inte lägga till ingrediens'),
  })

  const categories = useMemo(() => {
    const cats = [...new Set((ingredients ?? []).map(i => i.category?.name).filter(Boolean) as string[])]
    return ['Alla', ...cats.sort()]
  }, [ingredients])

  const filtered = useMemo(() => {
    return (ingredients ?? []).filter(i => {
      if (activeCat !== 'Alla' && i.category?.name !== activeCat) return false
      if (query && !i.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [ingredients, activeCat, query])

  // Group by first letter
  const grouped = useMemo(() => {
    const g: Record<string, Ingredient[]> = {}
    filtered.forEach(i => {
      const k = i.name[0]?.toUpperCase() ?? '#'
      if (!g[k]) g[k] = []
      g[k].push(i)
    })
    return Object.keys(g).sort().map(k => [k, g[k]] as [string, Ingredient[]])
  }, [filtered])

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '36px 40px 60px', width: '100%' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', color: 'var(--2eat-accent-deep)', textTransform: 'uppercase' }}>
            Bibliotek · {ingredients?.length ?? 0} st
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(42px, 5vw, 60px)', letterSpacing: '-0.035em', lineHeight: 0.95, margin: '6px 0 0', fontWeight: 400 }}>
            Ingredienser
          </h1>
        </div>
        <Button
          className="rounded-full gap-2"
          style={{ background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'var(--font-sans)', fontSize: 13, border: 'none' }}
          onClick={() => setShowAdd(true)}
        >
          <Plus size={14} /> Ny ingrediens
        </Button>
      </header>

      {/* ── Search + category filter ────────────────────────────── */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', background: 'var(--surface-1)', border: '1px solid var(--line)', borderRadius: 999, flex: '1 1 320px', maxWidth: 460 }}>
          <Search size={15} strokeWidth={1.5} style={{ color: 'var(--ink-50)', flexShrink: 0 }} />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Sök ingrediens…"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--ink)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(c => {
            const active = activeCat === c
            return (
              <Button
                key={c}
                variant={active ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
                onClick={() => setActiveCat(c)}
                style={{
                  background: active ? 'var(--ink)' : 'transparent',
                  color: active ? 'var(--paper)' : 'var(--ink-70)',
                  borderColor: active ? 'var(--ink)' : 'var(--line)',
                  fontFamily: 'var(--font-sans)', fontSize: 12.5,
                }}
              >{c}</Button>
            )
          })}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[60, 45, 80].map(w => (
            <div key={w}>
              <Skeleton className="h-12 mb-3" style={{ width: w }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 0', background: 'var(--surface-1)', borderRadius: 18, border: '1px dashed var(--line)', color: 'var(--ink-50)' }}>
          <Search size={28} strokeWidth={1.5} style={{ color: 'var(--ink-40)' }} />
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)', margin: 0 }}>Inga ingredienser hittades.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {grouped.map(([letter, items]) => (
            <section key={letter}>
              {/* Letter divider */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 54, lineHeight: 0.85, letterSpacing: '-0.04em', color: 'var(--2eat-accent-deep)', fontStyle: 'italic' }}>{letter}</span>
                <span style={{ flex: 1, height: 1, background: 'var(--line)', marginBottom: 4 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{items.length} st</span>
              </div>
              {/* Ingredient cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                {items.map(ing => (
                  <IngredientCard key={ing.id} ingredient={ing} onDelete={() => setToDelete(ing)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ── Add dialog ─────────────────────────────────────────── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 20 }}>
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
            <Button variant="outline" className="rounded-full" onClick={() => setShowAdd(false)}>Avbryt</Button>
            <Button
              className="rounded-full"
              style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
              disabled={!newName.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >Lägg till</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete dialog ───────────────────────────────────────── */}
      <Dialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}>
        <DialogContent style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 20 }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-serif)', fontSize: 26, letterSpacing: '-0.02em', fontWeight: 400 }}>Ta bort ingrediens?</DialogTitle>
            <DialogDescription style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-60)' }}>
              Det här raderar <strong style={{ color: 'var(--ink)' }}>{toDelete?.name}</strong> permanent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setToDelete(null)}>Avbryt</Button>
            <Button variant="destructive" className="rounded-full" disabled={deleteMutation.isPending} onClick={() => toDelete && deleteMutation.mutate(toDelete.id)}>Ta bort</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Ingredient card ───────────────────────────────────────────────────────
function IngredientCard({ ingredient, onDelete }: { ingredient: Ingredient; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false)
  const isVegan = ingredient.allergens?.some(a => a.id === 'Veganskt')
  const hasGluten = ingredient.allergens?.some(a => a.id === 'Gluten')

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        background: 'var(--paper)',
        border: `1px solid ${hovered ? 'var(--ink-30)' : 'var(--line)'}`,
        borderRadius: 12, transition: 'border-color 0.15s',
      }}
    >
      {/* Initial avatar */}
      <span style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: 'var(--surface-2)', display: 'grid', placeItems: 'center',
        fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--ink-60)', fontStyle: 'italic',
      }}>
        {ingredient.name[0]?.toUpperCase()}
      </span>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--ink)' }}>{ingredient.name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-50)' }}>
          {ingredient.category?.name ?? '—'}
        </div>
      </div>
      {/* Allergen icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {isVegan  && <Leaf  size={14} strokeWidth={1.5} style={{ color: 'var(--2eat-accent-deep)' }} aria-label="Veganskt" />}
        {hasGluten && <Wheat size={14} strokeWidth={1.5} style={{ color: 'oklch(0.62 0.1 70)' }}    aria-label="Gluten" />}
      </div>
      {/* Delete */}
      {hovered && (
        <button
          onClick={onDelete}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0, color: 'var(--destructive)' }}
        ><Trash2 size={14} strokeWidth={1.5} /></button>
      )}
    </div>
  )
}
