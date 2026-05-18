import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, GripVertical, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import {
  getSamlingById, renameSamling, deleteSamling,
  addReceptToSamling, removeReceptFromSamling,
  updateSamlingOrder, getRecipes,
} from '@/lib/api'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AuthImg } from '@/components/AuthImg'
import type { SamlingReceptItem, Recipe } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { PhotoSlot } from '@/components/PhotoSlot'
import { StarRating } from '@/components/StarRating'
import { SearchBar } from '@/components/SearchBar'
import { recipeSwatch } from '@/lib/recipeUtils'
import { Skeleton } from '@/components/ui/skeleton'

// ── Sortable item ─────────────────────────────────────────────────────────────
function SortableItem({ item }: { item: SamlingReceptItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.receptId })
  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        display: 'grid', gridTemplateColumns: '28px 44px 1fr',
        alignItems: 'center', gap: 12,
        padding: '10px 14px',
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 12, cursor: 'grab',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
      }}
    >
      <GripVertical size={16} style={{ color: 'var(--ink-30)' }} />
      <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
        {item.imageUrl ? (
          <AuthImg src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: recipeSwatch(item.receptId) }} />
        )}
      </div>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink)' }}>{item.name}</span>
    </li>
  )
}

// ── Reorder list with dnd-kit (mouse + touch) ─────────────────────────────────
function ReorderList({
  items,
  onReorder,
}: {
  items: SamlingReceptItem[]
  onReorder: (newOrder: SamlingReceptItem[]) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(i => i.receptId === active.id)
    const newIndex = items.findIndex(i => i.receptId === over.id)
    onReorder(arrayMove(items, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i.receptId)} strategy={verticalListSortingStrategy}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.map(item => <SortableItem key={item.receptId} item={item} />)}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

// ── Recipe picker modal ───────────────────────────────────────────────────────
function RecipePickerModal({
  open,
  onOpenChange,
  currentReceptIds,
  onAdd,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  currentReceptIds: number[]
  onAdd: (recipe: Recipe) => void
}) {
  const [search, setSearch] = useState('')
  const { data: allRecipes } = useQuery({ queryKey: ['recipes'], queryFn: getRecipes, enabled: open })

  const filtered = (allRecipes ?? []).filter(r =>
    !currentReceptIds.includes(r.id) &&
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setSearch('') }}>
      <DialogContent style={{ background: 'var(--paper)', borderRadius: 18, maxWidth: 520 }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em' }}>
            Lägg till recept
          </DialogTitle>
        </DialogHeader>
        <SearchBar value={search} onChange={setSearch} placeholder="Sök recept…" />
        <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink-50)', padding: '16px 0' }}>
              {search ? 'Inga recept matchar sökningen.' : 'Alla recept är redan tillagda.'}
            </p>
          ) : filtered.map(r => (
            <button
              key={r.id}
              onClick={() => { onAdd(r); onOpenChange(false); setSearch('') }}
              style={{
                display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12, alignItems: 'center',
                padding: '8px 10px', border: '1px solid transparent', borderRadius: 10,
                background: 'transparent', cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden' }}>
                <PhotoSlot imageUrl={r.imageUrl} swatch={recipeSwatch(r.id)} aspect="1/1" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink)' }}>{r.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-50)' }}>
                  {r.totalTime} MIN · {r.servings} PERS
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function SamlingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const samlingId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: samling, isLoading } = useQuery({
    queryKey: ['samlingar', samlingId],
    queryFn: () => getSamlingById(samlingId),
    enabled: !!id,
  })

  const [reorderMode, setReorderMode] = useState(false)
  const [localOrder, setLocalOrder] = useState<SamlingReceptItem[] | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameName, setRenameName] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [removeReceptId, setRemoveReceptId] = useState<number | null>(null)

  const renameMutation = useMutation({
    mutationFn: () => renameSamling(samlingId, renameName.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samlingar'] })
      queryClient.invalidateQueries({ queryKey: ['samlingar', samlingId] })
      toast.success('Samling omdöpt')
      setRenameOpen(false)
    },
    onError: () => toast.error('Kunde inte döpa om samlingen'),
  })

  const deleteSamlingMutation = useMutation({
    mutationFn: () => deleteSamling(samlingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samlingar'] })
      toast.success('Samling borttagen')
      navigate('/samlingar')
    },
    onError: () => toast.error('Kunde inte ta bort samlingen'),
  })

  const addReceptMutation = useMutation({
    mutationFn: (receptId: number) => addReceptToSamling(samlingId, receptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samlingar', samlingId] })
      queryClient.invalidateQueries({ queryKey: ['samlingar'] })
      toast.success('Recept tillagt')
    },
    onError: () => toast.error('Kunde inte lägga till recept'),
  })

  const removeReceptMutation = useMutation({
    mutationFn: (receptId: number) => removeReceptFromSamling(samlingId, receptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samlingar', samlingId] })
      queryClient.invalidateQueries({ queryKey: ['samlingar'] })
      setRemoveReceptId(null)
    },
    onError: () => toast.error('Kunde inte ta bort recept'),
  })

  const saveOrderMutation = useMutation({
    mutationFn: (receptIds: number[]) => updateSamlingOrder(samlingId, receptIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samlingar', samlingId] })
      setReorderMode(false)
      setLocalOrder(null)
      toast.success('Ordning sparad')
    },
    onError: () => toast.error('Kunde inte spara ordning'),
  })

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px 80px' }}>
        <Skeleton className="h-8 w-40 mb-8" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} className="rounded-[18px]" style={{ height: 280 }} />)}
        </div>
      </div>
    )
  }

  if (!samling) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 48 }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)' }}>Samlingen hittades inte.</p>
        <Button asChild variant="outline" className="rounded-full"><Link to="/samlingar">Tillbaka</Link></Button>
      </div>
    )
  }

  const displayItems = reorderMode ? (localOrder ?? samling.recept) : samling.recept
  const currentReceptIds = samling.recept.map(r => r.receptId)

  function enterReorder() {
    setLocalOrder([...samling!.recept])
    setReorderMode(true)
  }

  function saveOrder() {
    if (!localOrder) return
    saveOrderMutation.mutate(localOrder.map(r => r.receptId))
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px 80px' }}>
      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <Button
          variant="ghost"
          className="gap-2 -ml-2"
          style={{ color: 'var(--ink-60)', fontFamily: 'var(--font-sans)', fontSize: 13 }}
          onClick={() => navigate('/samlingar')}
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Alla samlingar
        </Button>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            aria-label="Döp om samling"
            title="Döp om"
            onClick={() => { setRenameName(samling.name); setRenameOpen(true) }}
          >
            <Pencil size={15} strokeWidth={1.5} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            aria-label="Ta bort samling"
            title="Ta bort samling"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={15} strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* ── Header ── */}
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-0.03em', color: 'var(--ink)', margin: '0 0 24px', fontWeight: 400 }}>
        {samling.name}
      </h1>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        {!reorderMode ? (
          <>
            <Button
              className="rounded-full gap-2"
              style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none', fontFamily: 'var(--font-sans)', fontSize: 13 }}
              onClick={() => setPickerOpen(true)}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--2eat-accent-deep)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--2eat-accent)')}
            >
              <Plus size={15} /> Lägg till recept
            </Button>
            {samling.recept.length > 1 && (
              <Button variant="outline" className="rounded-full" style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }} onClick={enterReorder}>
                Ändra ordning
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              className="rounded-full"
              style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
              disabled={saveOrderMutation.isPending}
              onClick={saveOrder}
            >
              Spara ordning
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => { setReorderMode(false); setLocalOrder(null) }}>
              Avbryt
            </Button>
          </>
        )}
      </div>

      {/* ── Content ── */}
      {reorderMode ? (
        <ReorderList
          items={displayItems}
          onReorder={setLocalOrder}
        />
      ) : samling.recept.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 0', color: 'var(--ink-50)' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--ink)', margin: 0 }}>Inga recept i den här samlingen</p>
          <Button className="rounded-full gap-2 mt-2" onClick={() => setPickerOpen(true)}>
            <Plus size={15} /> Lägg till recept
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {displayItems.map(item => (
            <article
              key={item.receptId}
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 18,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Link to={`/recipes/${item.receptId}`} style={{ textDecoration: 'none', flex: 1 }}>
                <div style={{ aspectRatio: '5/4', overflow: 'hidden' }}>
                  <PhotoSlot imageUrl={item.imageUrl ?? undefined} swatch={recipeSwatch(item.receptId)} aspect="5/4" />
                </div>
                <div style={{ padding: '14px 16px 8px' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 6px', fontWeight: 400, lineHeight: 1.2 }}>
                    {item.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-50)' }}>
                      {item.totalTime} MIN · {item.servings} PERS
                    </span>
                    <StarRating value={item.rating} size={10} />
                  </div>
                </div>
              </Link>
              <div style={{ padding: '0 16px 14px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Ta bort ur samling"
                  className="h-7 w-7"
                  style={{ color: 'var(--ink-40)' }}
                  onClick={() => setRemoveReceptId(item.receptId)}
                >
                  <Trash2 size={13} strokeWidth={1.5} />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── Dialogs ── */}
      <RecipePickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        currentReceptIds={currentReceptIds}
        onAdd={r => addReceptMutation.mutate(r.id)}
      />

      <Dialog open={renameOpen} onOpenChange={o => { setRenameOpen(o) }}>
        <DialogContent style={{ background: 'var(--paper)', borderRadius: 18, maxWidth: 420 }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em' }}>
              Döp om samling
            </DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={renameName}
            onChange={e => setRenameName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && renameName.trim()) renameMutation.mutate() }}
            style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}
          />
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setRenameOpen(false)}>Avbryt</Button>
            <Button
              className="rounded-full"
              style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
              disabled={!renameName.trim() || renameMutation.isPending}
              onClick={() => renameMutation.mutate()}
            >
              Spara
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Ta bort samling"
        description={<>Är du säker på att du vill ta bort <strong style={{ color: 'var(--ink)' }}>{samling.name}</strong>? Recepten i samlingen tas inte bort.</>}
        onConfirm={() => deleteSamlingMutation.mutate()}
        isPending={deleteSamlingMutation.isPending}
      />

      <DeleteConfirmDialog
        open={removeReceptId !== null}
        onOpenChange={open => { if (!open) setRemoveReceptId(null) }}
        title="Ta bort ur samling"
        description="Vill du ta bort det här receptet ur samlingen? Receptet i sig tas inte bort."
        onConfirm={() => removeReceptId !== null && removeReceptMutation.mutate(removeReceptId)}
        isPending={removeReceptMutation.isPending}
      />
    </div>
  )
}
