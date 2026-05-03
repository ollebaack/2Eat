import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Shuffle, Bookmark, X } from 'lucide-react'
import { toast } from 'sonner'
import { getRecipes, getRandomRecipes, deleteRecipe } from '@/lib/api'
import { recipeSwatch } from '@/lib/recipeUtils'
import type { Recipe } from '@/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/useIsMobile'
import { MobileListScreen } from '@/components/mobile/MobileListScreen'
import { PhotoSlot } from '@/components/PhotoSlot'
import { Pill } from '@/components/Pill'
import { SearchBar } from '@/components/SearchBar'
import { CategoryFilter } from '@/components/CategoryFilter'
import { EmptyState } from '@/components/EmptyState'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { RecipeCard } from '@/components/RecipeCard'
import { RecipeRow } from '@/components/RecipeRow'
import { LayoutGrid, List, Search } from 'lucide-react'

// ── Hero feature ──────────────────────────────────────────────────────────
function HeroFeature({ recipe }: { recipe: Recipe }) {
  const week = Math.ceil((Date.now() - +new Date(new Date().getFullYear(), 0, 1)) / (7 * 86400000))
  return (
    <div
      className="grid bg-paper border border-line rounded-[24px] overflow-hidden"
      style={{ gridTemplateColumns: '1.1fr 1fr', minHeight: 300 }}
    >
      <div className="p-[36px_40px] flex flex-col justify-between gap-6">
        <div className="flex flex-col gap-[18px]">
          <div className="flex items-center gap-[10px]">
            <Pill tone="accent" size="sm">★ Veckans recept</Pill>
            <span
              className="text-ink-50 uppercase"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.12em' }}
            >
              v.{week} · {recipe.category?.name}
            </span>
          </div>
          <h2
            className="text-ink m-0 font-normal"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(32px, 4vw, 52px)',
              lineHeight: 1.04,
              letterSpacing: '-0.035em',
            }}
          >
            {recipe.name}
          </h2>
          <p
            className="text-ink-70 m-0 max-w-[440px]"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.55 }}
          >
            {recipe.description}
          </p>
        </div>

        <div className="flex flex-col gap-[18px]">
          <div className="grid grid-cols-4 border-t border-line pt-[18px]">
            {[
              { k: 'Tid',       v: recipe.totalTime, u: 'min' },
              { k: 'Portioner', v: recipe.servings,  u: 'st'  },
              { k: 'Betyg',     v: recipe.rating,    u: '/ 5' },
              { k: 'Förbered.', v: recipe.prepTime,  u: 'min' },
            ].map(s => (
              <div key={s.k} className="flex flex-col gap-1">
                <span
                  className="text-ink-50 uppercase"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.12em' }}
                >
                  {s.k}
                </span>
                <span
                  className="text-ink leading-none"
                  style={{ fontFamily: 'var(--font-serif)', fontSize: 26, letterSpacing: '-0.02em' }}
                >
                  {s.v}
                  <span
                    className="text-ink-50 ml-1"
                    style={{ fontFamily: 'var(--font-sans)', fontSize: 12 }}
                  >
                    {s.u}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-[10px]">
            <Button
              asChild
              className="rounded-full"
              style={{ background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'var(--font-sans)', fontSize: 13, border: 'none' }}
            >
              <Link to={`/recipes/${recipe.id}`}>Öppna receptet →</Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-full gap-2"
              style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}
            >
              <Bookmark size={14} /> Spara
            </Button>
          </div>
        </div>
      </div>

      <div className="relative min-h-[280px]">
        <PhotoSlot
          imageUrl={recipe.imageUrl}
          swatch={recipeSwatch(recipe.id)}
          label={recipe.name}
          height="100%"
        />
      </div>
    </div>
  )
}

// ── Card skeleton ──────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-paper border border-line rounded-[18px] overflow-hidden">
      <Skeleton className="h-[200px] rounded-none w-full" />
      <div className="p-[18px] flex flex-col gap-[10px]">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

// ── Shuffle modal ─────────────────────────────────────────────────────────
function ShuffleModal({ open, recipes, onClose, onPick }: {
  open: boolean; recipes: Recipe[]; onClose: () => void; onPick: (id: number) => void
}) {
  const [phase, setPhase] = useState<'idle' | 'rolling' | 'done'>('idle')
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (!open || recipes.length === 0) { setPhase('idle'); return }
    setPhase('rolling')
    let n = 0
    const iv = setInterval(() => {
      setIdx(Math.floor(Math.random() * recipes.length))
      n++
      if (n > 14) { clearInterval(iv); setPhase('done') }
    }, 80)
    return () => clearInterval(iv)
  }, [open])

  if (!open || recipes.length === 0) return null
  const r = recipes[idx]

  const reroll = () => {
    setPhase('rolling')
    let n = 0
    const iv = setInterval(() => {
      setIdx(Math.floor(Math.random() * recipes.length))
      n++
      if (n > 10) { clearInterval(iv); setPhase('done') }
    }, 80)
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 grid place-items-center z-[100] p-6"
      style={{ background: 'rgba(20,18,14,0.55)', backdropFilter: 'blur(6px)', animation: 'fadeIn 0.2s ease' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[520px] bg-paper border border-line rounded-[24px] overflow-hidden"
        style={{ boxShadow: '0 30px 60px -20px rgba(0,0,0,0.3)' }}
      >
        <div className="relative h-[220px]">
          <PhotoSlot
            imageUrl={r.imageUrl}
            swatch={recipeSwatch(r.id)}
            label={r.name}
            height="220px"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-[14px] right-[14px] h-8 w-8 rounded-full bg-white/92"
            style={{ border: 'none' }}
            onClick={onClose}
          >
            <X size={14} />
          </Button>
          <div className="absolute top-[14px] left-[14px]">
            <Pill tone="ink" size="sm">
              <Shuffle size={11} strokeWidth={1.5} className="text-paper mr-1" />
              {phase === 'rolling' ? 'Slumpar…' : 'Ikvällens middag'}
            </Pill>
          </div>
        </div>

        <div className="p-7">
          <div
            className="text-ink-50 uppercase mb-2"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em' }}
          >
            {r.category?.name} · {r.totalTime} min · {r.servings} pers
          </div>
          <h2
            className="text-ink m-0 font-normal leading-none"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 38, letterSpacing: '-0.03em' }}
          >
            {r.name}
          </h2>
          <p
            className="text-ink-70 italic"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.5, margin: '12px 0 22px' }}
          >
            "{r.description}"
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-full gap-2"
              style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}
              onClick={reroll}
            >
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
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────
export function RecipesPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [showRandom, setShowRandom] = useState(false)
  const [shuffleOpen, setShuffleOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Recipe | null>(null)
  const [query, setQuery] = useState('')
  const [filterCat, setFilterCat] = useState('Alla')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const { data: allRecipes, isLoading } = useQuery({ queryKey: ['recipes'], queryFn: getRecipes, enabled: !showRandom })
  const { data: randomRecipes, isLoading: randomLoading, refetch: refetchRandom } = useQuery({ queryKey: ['recipes', 'random', 6], queryFn: () => getRandomRecipes(6), enabled: showRandom })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Recept borttaget')
      setToDelete(null)
    },
    onError: () => toast.error('Kunde inte ta bort receptet'),
  })

  const recipes = showRandom ? randomRecipes : allRecipes
  const loading = showRandom ? randomLoading : isLoading

  const categories = useMemo(() => {
    const cats = [...new Set((allRecipes ?? []).map(r => r.category?.name).filter(Boolean) as string[])]
    return ['Alla', ...cats]
  }, [allRecipes])

  const filtered = useMemo(() => {
    if (!recipes) return []
    return recipes.filter(r => {
      if (filterCat !== 'Alla' && r.category?.name !== filterCat) return false
      if (query) {
        const q = query.toLowerCase()
        return r.name.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q)
      }
      return true
    })
  }, [recipes, filterCat, query])

  const featured = filtered[0]
  const now = new Date()
  const monthName = now.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })

  if (isMobile) {
    return <MobileListScreen recipes={allRecipes ?? []} />
  }

  return (
    <div className="max-w-[1320px] mx-auto px-10 pt-9 pb-[60px] w-full">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex items-end justify-between gap-6 flex-wrap mb-8">
        <div className="flex flex-col gap-2 min-w-0 flex-1" style={{ flexBasis: 420 }}>
          <span
            className="text-brand-deep uppercase"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em' }}
          >
            Hemkokboken · {monthName}
          </span>
          <h1
            className="text-ink m-0 font-normal"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(40px, 5.4vw, 60px)',
              letterSpacing: '-0.035em',
              lineHeight: 0.98,
            }}
          >
            Vad ska vi <em className="italic text-brand-deep">äta</em> ikväll?
          </h1>
        </div>
        <div className="flex gap-2 items-center shrink-0">
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

      {/* ── Hero ───────────────────────────────────────────────── */}
      {!loading && featured && (
        <div className="mb-8">
          <HeroFeature recipe={featured} />
        </div>
      )}

      {/* ── Filter bar ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-3">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Sök bland recept…"
            className="flex-1 max-w-[460px]"
          />
          <div className="flex gap-1.5 ml-auto items-center">
            <span
              className="text-ink-50 uppercase mr-1"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em' }}
            >
              {String(filtered.length).padStart(2, '0')} recept
            </span>
            {/* View toggle */}
            <div
              className="inline-flex p-[3px] bg-surface-1 border border-line rounded-full"
            >
              {([['grid', LayoutGrid], ['list', List]] as const).map(([k, Ic]) => (
                <Button
                  key={k}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-8 rounded-full"
                  onClick={() => setView(k)}
                  style={{
                    background: view === k ? 'var(--paper)' : 'transparent',
                    color: view === k ? 'var(--ink)' : 'var(--ink-50)',
                    boxShadow: view === k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <Ic size={14} strokeWidth={1.5} />
                </Button>
              ))}
            </div>
            <Button
              variant={showRandom ? 'default' : 'outline'}
              size="sm"
              className="rounded-full gap-1.5 text-xs"
              style={{ fontFamily: 'var(--font-sans)' }}
              onClick={() => { setShowRandom(v => !v); if (showRandom) void refetchRandom() }}
            >
              <Shuffle size={12} /> {showRandom ? 'Alla' : 'Slumpa'}
            </Button>
          </div>
        </div>

        <CategoryFilter
          categories={categories}
          active={filterCat}
          onChange={setFilterCat}
        />
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid gap-[18px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={28} strokeWidth={1.5} />}
          title="Inga recept matchar."
          description="Prova att rensa filtren."
          action={
            <Button className="rounded-full" onClick={() => navigate('/recipes/new')}>
              Lägg till recept
            </Button>
          }
        />
      ) : view === 'grid' ? (
        <div className="grid gap-[18px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {filtered.map(r => <RecipeCard key={r.id} recipe={r} onDelete={setToDelete} />)}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(r => <RecipeRow key={r.id} recipe={r} onDelete={setToDelete} />)}
        </div>
      )}

      {/* ── Shuffle modal ───────────────────────────────────────── */}
      <ShuffleModal
        open={shuffleOpen}
        recipes={allRecipes ?? []}
        onClose={() => setShuffleOpen(false)}
        onPick={id => { setShuffleOpen(false); navigate(`/recipes/${id}`) }}
      />

      {/* ── Delete dialog ───────────────────────────────────────── */}
      <DeleteConfirmDialog
        open={!!toDelete}
        onOpenChange={o => !o && setToDelete(null)}
        title="Ta bort recept?"
        description={
          <>Det här raderar <strong style={{ color: 'var(--ink)' }}>{toDelete?.name}</strong> permanent. Åtgärden kan inte ångras.</>
        }
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
