import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Shuffle, Clock, Users, Trash2, Bookmark, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { getRecipesPage, getRandomRecipes, deleteRecipe, getCategories, getIngredients, ALLERGEN_OPTIONS } from '@/lib/api'
import type { Recipe, AllergenId } from '@/types'
import { AddToSamlingModal } from '@/components/AddToSamlingModal'
import { IngredientCombobox } from '@/components/IngredientCombobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import * as RadixDialog from '@radix-ui/react-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog'
import { PhotoSlot } from '@/components/PhotoSlot'
import { StarRating } from '@/components/StarRating'
import { Pill } from '@/components/Pill'
import { recipeSwatch } from '@/lib/recipeUtils'

const PAGE_SIZE = 8

// ── Feed card (Instagram-style) ───────────────────────────────────────────
function FeedCard({ recipe, onDelete, onSave }: { recipe: Recipe; onDelete: (r: Recipe) => void; onSave: (r: Recipe) => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.article
      variants={{ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--paper)',
        border: `1px solid ${hovered ? 'var(--ink-30)' : 'var(--line)'}`,
        borderRadius: 20,
        overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.2s',
        boxShadow: hovered ? '0 8px 28px -12px rgba(0,0,0,0.16)' : 'none',
      }}
    >
      <Link to={`/recipes/${recipe.id}`} style={{ display: 'block', position: 'relative', textDecoration: 'none' }}>
        <PhotoSlot imageUrl={recipe.imageUrl} swatch={recipeSwatch(recipe.id)} label={recipe.category?.name} aspect="3/2" />
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <Pill tone="ink" size="sm">{recipe.totalTime} MIN</Pill>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Spara recept"
          className="absolute top-3 right-3 h-8 w-8 rounded-full"
          style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)', color: 'var(--ink)' }}
          onClick={e => { e.preventDefault(); e.stopPropagation(); onSave(recipe) }}
        ><Bookmark size={14} strokeWidth={1.5} /></Button>
      </Link>
      <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Link to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.1, letterSpacing: '-0.025em', color: 'var(--ink)', margin: 0, fontWeight: 400 }}>
            {recipe.name}
          </h3>
        </Link>
        {recipe.description && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-60)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {recipe.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px dashed var(--line)', marginTop: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-50)', letterSpacing: '0.04em' }}>
            {recipe.category && <span>{recipe.category.name}</span>}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Users size={12} strokeWidth={1.5} style={{ color: 'var(--ink-40)' }} />{recipe.servings}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={12} strokeWidth={1.5} style={{ color: 'var(--ink-40)' }} />{recipe.totalTime}m</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StarRating value={recipe.rating} size={11} />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Ta bort recept"
              className="h-6 w-6"
              onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(recipe) }}
            ><Trash2 size={12} strokeWidth={1.5} style={{ color: 'var(--destructive)' }} /></Button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────
function FeedCardSkeleton() {
  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden' }}>
      <Skeleton style={{ aspectRatio: '3/2', width: '100%' }} className="rounded-none" />
      <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

// ── Shuffle modal ─────────────────────────────────────────────────────────
function ShuffleModal({ open, recipes, onClose, onPick }: {
  open: boolean; recipes: Recipe[]; onClose: () => void; onPick: (id: number) => void
}) {
  const [phase, setPhase] = useState<'rolling' | 'done'>('rolling')
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (!open || recipes.length === 0) return
    let n = 0
    const iv = setInterval(() => {
      setIdx(Math.floor(Math.random() * recipes.length))
      n++
      if (n > 14) { clearInterval(iv); setPhase('done') }
    }, 80)
    return () => { clearInterval(iv); setPhase('rolling') }
  }, [open, recipes.length])

  const reroll = () => {
    setPhase('rolling')
    let n = 0
    const iv = setInterval(() => {
      setIdx(Math.floor(Math.random() * recipes.length))
      n++
      if (n > 10) { clearInterval(iv); setPhase('done') }
    }, 80)
  }

  const r = recipes[idx]

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogPortal>
        <DialogOverlay />
        <RadixDialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-48px)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[24px] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          style={{ background: 'var(--paper)', border: '1px solid var(--line)', boxShadow: '0 30px 60px -20px rgba(0,0,0,0.3)' }}
        >
          {r && (
            <>
              <RadixDialog.Title className="sr-only">{r.name}</RadixDialog.Title>
              <div style={{ position: 'relative', height: 220 }}>
                <PhotoSlot imageUrl={r.imageUrl} swatch={recipeSwatch(r.id)} label={r.name} height="220px" />
                <RadixDialog.Close asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Stäng"
                    className="absolute top-3.5 right-3.5 h-8 w-8 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.92)' }}
                  >
                    <X size={14} />
                  </Button>
                </RadixDialog.Close>
                <div style={{ position: 'absolute', top: 14, left: 14 }}>
                  <Pill tone="ink" size="sm">
                    <Shuffle size={11} strokeWidth={1.5} style={{ color: 'var(--paper)', marginRight: 4 }} />
                    {phase === 'rolling' ? 'Slumpar…' : 'Ikvällens middag'}
                  </Pill>
                </div>
              </div>
              <div style={{ padding: 28 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {r.category?.name} · {r.totalTime} min · {r.servings} pers
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 38, letterSpacing: '-0.03em', lineHeight: 1, margin: 0, fontWeight: 400 }}>{r.name}</h2>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, lineHeight: 1.5, color: 'var(--ink-70)', margin: '12px 0 22px' }}>
                  "{r.description}"
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="outline" className="rounded-full gap-2" style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }} onClick={reroll}>
                    <Shuffle size={14} /> Slumpa igen
                  </Button>
                  <Button
                    className="flex-1 rounded-full"
                    style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', fontFamily: 'var(--font-sans)', fontSize: 13, border: 'none' }}
                    onClick={() => onPick(r.id)}
                  >
                    Öppna receptet →
                  </Button>
                </div>
              </div>
            </>
          )}
        </RadixDialog.Content>
      </DialogPortal>
    </Dialog>
  )
}

// ── Main export ───────────────────────────────────────────────────────────
export function RecipesPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [shuffleOpen, setShuffleOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Recipe | null>(null)
  const [toSave, setToSave] = useState<Recipe | null>(null)
  const [searchText, setSearchText] = useState('')
  const [activeAllergens, setActiveAllergens] = useState<AllergenId[]>([])
  const toggleAllergen = useCallback((a: AllergenId) => setActiveAllergens(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]), [])
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<number[]>([])
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(undefined)

  const urlFilter = searchParams.get('filter') ?? ''

  // Stable seed for this browsing session — regenerates on page mount (navigation away + back)
  const [seed] = useState(() => Math.floor(Math.random() * 900000) + 100000)

  const sentinelRef = useRef<HTMLDivElement>(null)

  const queryKey = ['recipes', 'feed', seed, searchText, activeCategoryId, activeAllergens, selectedIngredientIds]

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => getRecipesPage({
      seed,
      page: pageParam as number,
      pageSize: PAGE_SIZE,
      search: searchText || undefined,
      categoryId: activeCategoryId,
      allergens: activeAllergens.length > 0 ? activeAllergens : undefined,
      ingredientIds: selectedIngredientIds.length > 0 ? selectedIngredientIds : undefined,
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 30_000,
  })

  const allRecipes = useMemo(() => data?.pages.flatMap(p => p.items) ?? [], [data])

  // IntersectionObserver sentinel to auto-fetch next page
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const { data: randomRecipesForShuffle } = useQuery({
    queryKey: ['recipes', 'random', 6],
    queryFn: () => getRandomRecipes(6),
    enabled: shuffleOpen,
  })

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const { data: allIngredients } = useQuery({ queryKey: ['ingredients'], queryFn: getIngredients })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Recept borttaget')
      setToDelete(null)
    },
    onError: () => toast.error('Kunde inte ta bort receptet'),
  })

  const now = new Date()
  const monthName = now.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })

  const hasActiveFilters = !!searchText || activeCategoryId !== undefined || activeAllergens.length > 0 || selectedIngredientIds.length > 0 || urlFilter === 'favorites'

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 80px', width: '100%' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, flex: '1 1 300px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', color: 'var(--2eat-accent-deep)', textTransform: 'uppercase' }}>
            Hemkokboken · {monthName}
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-0.035em', lineHeight: 0.98, color: 'var(--ink)', margin: 0, fontWeight: 400 }}>
            Vad ska vi <em style={{ fontStyle: 'italic', color: 'var(--2eat-accent-deep)' }}>äta</em> ikväll?
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <Button
            variant="outline"
            className="rounded-full gap-2"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 13, background: 'var(--paper)' }}
            onClick={() => setShuffleOpen(true)}
          >
            <Shuffle size={14} /> Slumpa middag
          </Button>
          <Button
            className="rounded-full gap-2"
            style={{ background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'var(--font-sans)', fontSize: 13, border: 'none' }}
            onClick={() => navigate('/recipes/new')}
          >
            <Plus size={14} /> Nytt recept
          </Button>
        </div>
      </header>

      {/* ── Filter bar ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', background: 'var(--surface-1)', border: '1px solid var(--line)', borderRadius: 999, maxWidth: 500 }}>
          <Search size={15} strokeWidth={1.5} style={{ color: 'var(--ink-50)', flexShrink: 0 }} />
          <Input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Sök bland recept…"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--ink)' }}
          />
          {searchText && (
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" style={{ color: 'var(--ink-50)' }} onClick={() => setSearchText('')}>
              <X size={14} />
            </Button>
          )}
        </div>

        {/* Category chips */}
        {categories && categories.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <motion.div whileTap={{ scale: 0.93 }}>
              <Button
                variant={activeCategoryId === undefined ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
                onClick={() => setActiveCategoryId(undefined)}
                style={{
                  background: activeCategoryId === undefined ? 'var(--ink)' : 'transparent',
                  color: activeCategoryId === undefined ? 'var(--paper)' : 'var(--ink-70)',
                  borderColor: activeCategoryId === undefined ? 'var(--ink)' : 'var(--line)',
                  fontFamily: 'var(--font-sans)', fontSize: 12.5,
                }}
              >Alla</Button>
            </motion.div>
            {categories.map(c => {
              const active = activeCategoryId === c.id
              return (
                <motion.div key={c.id} whileTap={{ scale: 0.93 }}>
                  <Button
                    variant={active ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setActiveCategoryId(active ? undefined : c.id)}
                    style={{
                      background: active ? 'var(--ink)' : 'transparent',
                      color: active ? 'var(--paper)' : 'var(--ink-70)',
                      borderColor: active ? 'var(--ink)' : 'var(--line)',
                      fontFamily: 'var(--font-sans)', fontSize: 12.5,
                    }}
                  >{c.name}</Button>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Allergen chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {ALLERGEN_OPTIONS.map(a => {
            const active = activeAllergens.includes(a)
            return (
              <motion.div key={a} whileTap={{ scale: 0.93 }}>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => toggleAllergen(a)}
                  style={{
                    border: '1px dashed ' + (active ? 'var(--2eat-accent)' : 'var(--ink-30)'),
                    background: active ? 'color-mix(in oklch, var(--2eat-accent) 12%, transparent)' : 'transparent',
                    color: active ? 'var(--2eat-accent-deep)' : 'var(--ink-50)',
                    fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase',
                    transition: 'all 0.15s',
                  }}
                >{a}</Button>
              </motion.div>
            )
          })}
        </div>

        {/* Ingrediensfilter */}
        <IngredientCombobox
          ingredients={allIngredients ?? []}
          selectedIds={selectedIngredientIds}
          onChange={setSelectedIngredientIds}
        />
      </div>

      {/* ── Feed ───────────────────────────────────────────────── */}
      <AnimatePresence mode="wait" initial={false}>
        {isLoading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <FeedCardSkeleton key={i} />)}
          </motion.div>
        ) : allRecipes.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 0', background: 'var(--surface-1)', borderRadius: 18, border: '1px dashed var(--line)', color: 'var(--ink-50)' }}>
            <Search size={28} strokeWidth={1.5} style={{ color: 'var(--ink-40)' }} />
            {hasActiveFilters ? (
              <>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)', margin: 0 }}>Inga recept matchar.</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, margin: 0 }}>Prova ett annat sökord eller rensa filtren.</p>
              </>
            ) : (
              <>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)', margin: 0 }}>Inga recept ännu.</p>
                <Button className="rounded-full mt-2" onClick={() => navigate('/recipes/new')}>Lägg till recept</Button>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div key="feed" initial="initial" animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {allRecipes.map(r => (
              <FeedCard key={r.id} recipe={r} onDelete={setToDelete} onSave={setToSave} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Infinite scroll sentinel ────────────────────────────── */}
      <div ref={sentinelRef} style={{ height: 1, marginTop: 32 }} />

      {isFetchingNextPage && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginTop: 0 }}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <FeedCardSkeleton key={i} />)}
        </div>
      )}

      {!hasNextPage && allRecipes.length > 0 && (
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-40)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 40 }}>
          — {allRecipes.length} recept —
        </p>
      )}

      {/* ── Shuffle modal ───────────────────────────────────────── */}
      <ShuffleModal
        open={shuffleOpen}
        recipes={randomRecipesForShuffle ?? allRecipes.slice(0, 6)}
        onClose={() => setShuffleOpen(false)}
        onPick={id => { setShuffleOpen(false); navigate(`/recipes/${id}`) }}
      />

      {/* ── Save to samling modal ──────────────────────────────── */}
      {toSave && (
        <AddToSamlingModal
          recipeId={toSave.id}
          open={!!toSave}
          onOpenChange={o => { if (!o) setToSave(null) }}
        />
      )}

      {/* ── Delete dialog ───────────────────────────────────────── */}
      <Dialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}>
        <DialogContent style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 20 }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-serif)', fontSize: 26, letterSpacing: '-0.02em', fontWeight: 400 }}>Ta bort recept?</DialogTitle>
            <DialogDescription style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-60)' }}>
              Det här raderar <strong style={{ color: 'var(--ink)' }}>{toDelete?.name}</strong> permanent. Åtgärden kan inte ångras.
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
