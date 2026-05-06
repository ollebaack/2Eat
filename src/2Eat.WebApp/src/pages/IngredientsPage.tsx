import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '@/lib/api'
import type { Ingredient } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SearchBar } from '@/components/SearchBar'
import { CategoryFilter } from '@/components/CategoryFilter'
import { EmptyState } from '@/components/EmptyState'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { IngredientCard } from '@/components/IngredientCard'

export function IngredientsPage() {
  const queryClient = useQueryClient()
  const [toDelete, setToDelete] = useState<Ingredient | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [toEdit, setToEdit] = useState<Ingredient | null>(null)
  const [editName, setEditName] = useState('')
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState('Alla')

  const { data: ingredients, isLoading } = useQuery({
    queryKey: ['ingredients'],
    queryFn: getIngredients,
  })

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
      setShowAdd(false)
    },
    onError: () => toast.error('Kunde inte lägga till ingrediens'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name, categoryId }: { id: number; name: string; categoryId: number }) =>
      updateIngredient(id, { name, categoryId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingrediens uppdaterad')
      setToEdit(null)
    },
    onError: () => toast.error('Kunde inte uppdatera ingrediensen'),
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
    <div className="max-w-[1240px] mx-auto px-10 pt-9 pb-[60px] w-full">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <span
            className="text-brand-deep uppercase"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em' }}
          >
            Bibliotek · {ingredients?.length ?? 0} st
          </span>
          <h1
            className="text-ink m-0 font-normal"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(42px, 5vw, 60px)',
              letterSpacing: '-0.035em',
              lineHeight: 0.95,
              marginTop: 6,
            }}
          >
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
      <div className="flex gap-[14px] items-center mb-8 flex-wrap">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Sök ingrediens…"
          className="flex-1 max-w-[460px]"
        />
        <CategoryFilter
          categories={categories}
          active={activeCat}
          onChange={setActiveCat}
        />
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col gap-6">
          {[60, 45, 80].map(w => (
            <div key={w}>
              <Skeleton className="h-12 mb-3" style={{ width: w }} />
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          icon={<Search size={28} strokeWidth={1.5} />}
          title="Inga ingredienser hittades."
        />
      ) : (
        <div className="flex flex-col gap-9">
          {grouped.map(([letter, items]) => (
            <section key={letter}>
              {/* Letter divider */}
              <div className="flex items-baseline gap-4 mb-[14px]">
                <span
                  className="italic text-brand-deep"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 54,
                    lineHeight: 0.85,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {letter}
                </span>
                <span className="flex-1 h-px bg-line mb-1" />
                <span
                  className="text-ink-50 uppercase"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em' }}
                >
                  {items.length} st
                </span>
              </div>
              {/* Ingredient cards */}
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                {items.map(ing => (
                  <IngredientCard
                    key={ing.id}
                    ingredient={ing}
                    onEdit={() => { setToEdit(ing); setEditName(ing.name) }}
                    onDelete={() => setToDelete(ing)}
                  />
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
            <DialogTitle
              style={{ fontFamily: 'var(--font-serif)', fontSize: 26, letterSpacing: '-0.02em', fontWeight: 400 }}
            >
              Ny ingrediens
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label
              className="uppercase text-ink-50"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.12em' }}
            >
              Namn
            </Label>
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="t.ex. Lax"
              style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}
              onKeyDown={e => e.key === 'Enter' && newName.trim() && createMutation.mutate()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setShowAdd(false)}>
              Avbryt
            </Button>
            <Button
              className="rounded-full"
              style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
              disabled={!newName.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Lägg till
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ────────────────────────────────────────── */}
      <Dialog open={!!toEdit} onOpenChange={o => !o && setToEdit(null)}>
        <DialogContent style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 20 }}>
          <DialogHeader>
            <DialogTitle
              style={{ fontFamily: 'var(--font-serif)', fontSize: 26, letterSpacing: '-0.02em', fontWeight: 400 }}
            >
              Redigera ingrediens
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label
              className="uppercase text-ink-50"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.12em' }}
            >
              Namn
            </Label>
            <Input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="t.ex. Lax"
              style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}
              onKeyDown={e => e.key === 'Enter' && editName.trim() && toEdit &&
                updateMutation.mutate({ id: toEdit.id, name: editName, categoryId: toEdit.categoryId })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setToEdit(null)}>
              Avbryt
            </Button>
            <Button
              className="rounded-full"
              style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
              disabled={!editName.trim() || updateMutation.isPending}
              onClick={() => toEdit && updateMutation.mutate({ id: toEdit.id, name: editName, categoryId: toEdit.categoryId })}
            >
              Spara
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete dialog ───────────────────────────────────────── */}
      <DeleteConfirmDialog
        open={!!toDelete}
        onOpenChange={o => !o && setToDelete(null)}
        title="Ta bort ingrediens?"
        description={
          <>Det här raderar <strong style={{ color: 'var(--ink)' }}>{toDelete?.name}</strong> permanent.</>
        }
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
