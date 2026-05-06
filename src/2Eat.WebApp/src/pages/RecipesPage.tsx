import { useState, useMemo, useEffect, useCallback, useId } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Shuffle, Clock, Users, Trash2, Bookmark, Search, X, LayoutGrid, List, Star } from 'lucide-react'
import { toast } from 'sonner'
import { getRecipes, getRandomRecipes, deleteRecipe, getFileUrl, ALLERGEN_OPTIONS } from '@/lib/api'
import type { Recipe, AllergenId } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useIsMobile } from '@/hooks/useIsMobile'
import { MobileListScreen } from '@/components/mobile/MobileListScreen'

// ── Photo placeholder (striped swatch, falls back to real image) ──────────
const SWATCHES = [
  'oklch(0.65 0.12 50)', 'oklch(0.6 0.1 145)',  'oklch(0.62 0.12 30)',
  'oklch(0.6 0.08 210)', 'oklch(0.58 0.1 330)',  'oklch(0.65 0.1 90)',
]
function recipeSwatch(id: number) { return SWATCHES[id % SWATCHES.length] }

function PhotoSlot({ imageUrl, swatch, label = '', aspect = '5/4', height }: {
  imageUrl?: string; swatch?: string; label?: string; aspect?: string; height?: string
}) {
  const uid = useId()
  const containerStyle: React.CSSProperties = {
    position: 'relative', width: '100%',
    height: height ?? 'auto',
    aspectRatio: height ? undefined : aspect,
    overflow: 'hidden', borderRadius: 'inherit',
  }
  if (imageUrl) {
    return (
      <div style={containerStyle}>
        <img src={getFileUrl(imageUrl)} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }
  const fill = swatch ?? 'oklch(0.65 0.08 60)'
  return (
    <div style={{ ...containerStyle, background: fill }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <pattern id={uid} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          </pattern>
          <radialGradient id={uid + 'r'} cx="30%" cy="25%" r="80%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${uid})`} />
        <rect width="100%" height="100%" fill={`url(#${uid}r)`} />
      </svg>
    </div>
  )
}

// ── Stars ─────────────────────────────────────────────────────────────────
function Stars({ value = 0, size = 11 }: { value: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} strokeWidth={1.5}
          fill={i <= value ? 'var(--2eat-accent)' : 'none'}
          stroke={i <= value ? 'var(--2eat-accent)' : 'var(--ink-30)'} />
      ))}
    </span>
  )
}

// ── Pill (Badge wrapper) ──────────────────────────────────────────────────
function Pill({ children, tone = 'default', size = 'md' }: {
  children: React.ReactNode; tone?: 'default' | 'accent' | 'ink' | 'ghost'; size?: 'sm' | 'md'
}) {
  const toneStyle = {
    default: { background: 'var(--surface-2)',  color: 'var(--ink-70)',  borderColor: 'var(--line)' },
    accent:  { background: 'color-mix(in oklch, var(--2eat-accent) 12%, transparent)', color: 'var(--2eat-accent-deep)', borderColor: 'color-mix(in oklch, var(--2eat-accent) 35%, transparent)' },
    ink:     { background: 'var(--ink)',  color: 'var(--paper)',  borderColor: 'var(--ink)' },
    ghost:   { background: 'rgba(255,255,255,0.82)', color: 'var(--ink)', borderColor: 'transparent' },
  }[tone]
  return (
    <Badge
      variant="outline"
      style={{ ...toneStyle, fontFamily: 'var(--font-mono)', fontSize: size === 'sm' ? 10.5 : 11.5, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1, padding: size === 'sm' ? '2px 8px' : '4px 10px', gap: 4, whiteSpace: 'nowrap' }}
    >
      {children}
    </Badge>
  )
}

// ── Hero feature ──────────────────────────────────────────────────────────
const currentWeek = Math.ceil((Date.now() - +new Date(new Date().getFullYear(), 0, 1)) / (7 * 86400000))
function HeroFeature({ recipe }: { recipe: Recipe; onOpen?: (id: number) => void }) {
  const week = currentWeek
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.1fr 1fr',
      background: 'var(--paper)', border: '1px solid var(--line)',
      borderRadius: 24, overflow: 'hidden', minHeight: 300,
    }}>
      <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Pill tone="accent" size="sm">★ Veckans recept</Pill>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.12em', color: 'var(--ink-50)', textTransform: 'uppercase' }}>
              v.{week} · {recipe.category?.name}
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.04, letterSpacing: '-0.035em', color: 'var(--ink)', margin: 0, fontWeight: 400 }}>
            {recipe.name}
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.55, color: 'var(--ink-70)', maxWidth: 440, margin: 0 }}>
            {recipe.description}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--line)', paddingTop: 18 }}>
            {[
              { k: 'Tid',       v: recipe.totalTime, u: 'min' },
              { k: 'Portioner', v: recipe.servings,  u: 'st'  },
              { k: 'Betyg',     v: recipe.rating,    u: '/ 5' },
              { k: 'Förbered.', v: recipe.prepTime,  u: 'min' },
            ].map(s => (
              <div key={s.k} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-50)' }}>{s.k}</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                  {s.v}<span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-50)', marginLeft: 4 }}>{s.u}</span>
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button asChild className="rounded-full" style={{ background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'var(--font-sans)', fontSize: 13, border: 'none' }}>
              <Link to={`/recipes/${recipe.id}`}>Öppna receptet →</Link>
            </Button>
            <Button variant="outline" className="rounded-full gap-2" style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>
              <Bookmark size={14} /> Spara
            </Button>
          </div>
        </div>
      </div>
      <div style={{ position: 'relative', minHeight: 280 }}>
        <PhotoSlot imageUrl={recipe.imageUrl} swatch={recipeSwatch(recipe.id)} label={recipe.name} height="100%" />
      </div>
    </div>
  )
}

// ── Recipe card (grid view) ───────────────────────────────────────────────
function RecipeCard({ recipe, onDelete }: { recipe: Recipe; onDelete: (r: Recipe) => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--paper)',
        border: `1px solid ${hovered ? 'var(--ink-30)' : 'var(--line)'}`,
        borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 24px -16px rgba(0,0,0,0.18)' : 'none',
        transition: 'transform 0.2s, border-color 0.15s, box-shadow 0.2s',
      }}
    >
      <Link to={`/recipes/${recipe.id}`} style={{ display: 'block', position: 'relative', textDecoration: 'none' }}>
        <PhotoSlot imageUrl={recipe.imageUrl} swatch={recipeSwatch(recipe.id)} label={recipe.category?.name} aspect="5/4" />
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <Pill tone="ink" size="sm">{recipe.totalTime} MIN</Pill>
        </div>
        <button
          style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}
          onClick={e => { e.preventDefault(); e.stopPropagation() }}
        ><Bookmark size={14} strokeWidth={1.5} /></button>
      </Link>
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <Link to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, lineHeight: 1.15, letterSpacing: '-0.025em', color: 'var(--ink)', margin: 0, fontWeight: 400 }}>
              {recipe.name}
            </h3>
          </Link>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-50)', whiteSpace: 'nowrap', paddingTop: 6 }}>
            №{String(recipe.id).padStart(3, '0')}
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.45, color: 'var(--ink-60)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {recipe.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: '1px dashed var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-50)', letterSpacing: '0.04em' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Users size={12} strokeWidth={1.5} style={{ color: 'var(--ink-40)' }} />{recipe.servings}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={12} strokeWidth={1.5} style={{ color: 'var(--ink-40)' }} />{recipe.totalTime}m</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Stars value={recipe.rating} size={11} />
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(recipe) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
            ><Trash2 size={12} strokeWidth={1.5} style={{ color: 'var(--destructive)' }} /></button>
          </div>
        </div>
      </div>
    </article>
  )
}

// ── Recipe row (list view) ────────────────────────────────────────────────
function RecipeRow({ recipe, onDelete }: { recipe: Recipe; onDelete: (r: Recipe) => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid', gridTemplateColumns: '120px 1fr auto auto auto auto',
        gap: 20, alignItems: 'center', padding: '14px 18px',
        background: 'var(--paper)',
        border: `1px solid ${hovered ? 'var(--ink-30)' : 'var(--line)'}`,
        borderRadius: 14, transition: 'border-color 0.15s',
      }}
    >
      <div style={{ borderRadius: 10, overflow: 'hidden', height: 70 }}>
        <PhotoSlot imageUrl={recipe.imageUrl} swatch={recipeSwatch(recipe.id)} height="70px" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <Link to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: '-0.02em', color: 'var(--ink)', margin: 0, fontWeight: 400, lineHeight: 1.1 }}>{recipe.name}</h3>
        </Link>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--ink-60)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{recipe.description}</p>
      </div>
      {recipe.category && <Pill tone="default" size="sm">{recipe.category.name}</Pill>}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', letterSpacing: '0.06em', textAlign: 'right' }}>
        <div>{recipe.totalTime} MIN</div>
        <div>{recipe.servings} PERS</div>
      </div>
      <Stars value={recipe.rating} size={12} />
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(recipe)}>
        <Trash2 size={14} className="text-destructive" />
      </Button>
    </article>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden' }}>
      <Skeleton style={{ height: 200 }} className="rounded-none w-full" />
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
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
      style={{ position: 'fixed', inset: 0, background: 'rgba(20,18,14,0.55)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 24, animation: 'fadeIn 0.2s ease' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 520, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 60px -20px rgba(0,0,0,0.3)' }}
      >
        <div style={{ position: 'relative', height: 220 }}>
          <PhotoSlot imageUrl={r.imageUrl} swatch={recipeSwatch(r.id)} label={r.name} height="220px" />
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={14} />
          </button>
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
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────
export function RecipesPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isMobile = useIsMobile()
  const [showRandom, setShowRandom] = useState(false)
  const [shuffleOpen, setShuffleOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Recipe | null>(null)
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [activeAllergens, setActiveAllergens] = useState<AllergenId[]>([])
  const toggleAllergen = useCallback((a: AllergenId) => setActiveAllergens(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]), [])

  const urlCategory = searchParams.get('category') ?? ''
  const urlFilter = searchParams.get('filter') ?? ''
  const [localCat, setLocalCat] = useState(() => urlCategory || 'Alla')
  // URL param takes priority; local chip selection applies when no URL param is present
  const filterCat = urlCategory || localCat

  // Reset local category chip when navigating back to unfiltered URL
  useEffect(() => {
    if (!urlCategory && !urlFilter) setLocalCat('Alla')
  }, [urlCategory, urlFilter])

  const { data: allRecipes, isLoading } = useQuery({ queryKey: ['recipes'], queryFn: getRecipes, enabled: !showRandom })
  const { data: randomRecipes, isLoading: randomLoading, refetch: refetchRandom } = useQuery({ queryKey: ['recipes', 'random', 6], queryFn: () => getRandomRecipes(6), enabled: showRandom })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRecipe(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['recipes'] }); toast.success('Recept borttaget'); setToDelete(null) },
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
      if (urlFilter === 'favorites' && !r.isFavorite) return false
      if (filterCat !== 'Alla' && r.category?.name !== filterCat) return false
      if (query) {
        const q = query.toLowerCase()
        if (!r.name.toLowerCase().includes(q) && !(r.description ?? '').toLowerCase().includes(q)) return false
      }
      if (activeAllergens.length > 0) {
        const recipeAllergens = new Set(
          r.ingredients.flatMap(ri => ri.ingredient?.allergens?.map(a => a.id) ?? [])
        )
        if (!activeAllergens.every(a => recipeAllergens.has(a))) return false
      }
      return true
    })
  }, [recipes, filterCat, urlFilter, query, activeAllergens])

  const featured = filtered[0]
  const now = new Date()
  const monthName = now.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })

  if (isMobile) {
    return <MobileListScreen recipes={allRecipes ?? []} />
  }

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: '36px 40px 60px', width: '100%' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, flex: '1 1 420px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', color: 'var(--2eat-accent-deep)', textTransform: 'uppercase' }}>
            Hemkokboken · {monthName}
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 5.4vw, 60px)', letterSpacing: '-0.035em', lineHeight: 0.98, color: 'var(--ink)', margin: 0, fontWeight: 400 }}>
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

      {/* ── Hero ───────────────────────────────────────────────── */}
      {!loading && featured && <div style={{ marginBottom: 32 }}><HeroFeature recipe={featured} onOpen={id => navigate(`/recipes/${id}`)} /></div>}

      {/* ── Filter bar ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Search */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', background: 'var(--surface-1)', border: '1px solid var(--line)', borderRadius: 999, maxWidth: 460 }}>
            <Search size={15} strokeWidth={1.5} style={{ color: 'var(--ink-50)', flexShrink: 0 }} />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Sök bland recept…"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
              style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--ink)' }}
            />
            {query && (
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" style={{ color: 'var(--ink-50)' }} onClick={() => setQuery('')}>
                <X size={14} />
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 4 }}>
              {String(filtered.length).padStart(2, '0')} recept
            </span>
            {/* View toggle */}
            <div style={{ display: 'inline-flex', padding: 3, background: 'var(--surface-1)', border: '1px solid var(--line)', borderRadius: 999 }}>
              {([['grid', LayoutGrid], ['list', List]] as const).map(([k, Ic]) => (
                <Button
                  key={k}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-8 rounded-full"
                  onClick={() => setView(k)}
                  style={{ background: view === k ? 'var(--paper)' : 'transparent', color: view === k ? 'var(--ink)' : 'var(--ink-50)', boxShadow: view === k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}
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
        {/* Category chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(c => {
            const active = filterCat === c
            return (
              <Button
                key={c}
                variant={active ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
                onClick={() => setLocalCat(c)}
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
        {/* Allergen chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {ALLERGEN_OPTIONS.map(a => {
            const active = activeAllergens.includes(a)
            return (
              <button
                key={a}
                onClick={() => toggleAllergen(a)}
                style={{
                  padding: '6px 12px', borderRadius: 999,
                  border: '1px dashed ' + (active ? 'var(--2eat-accent)' : 'var(--ink-30)'),
                  background: active ? 'color-mix(in oklch, var(--2eat-accent) 12%, transparent)' : 'transparent',
                  color: active ? 'var(--2eat-accent-deep)' : 'var(--ink-50)',
                  fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >{a}</button>
            )
          })}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 0', background: 'var(--surface-1)', borderRadius: 18, border: '1px dashed var(--line)', color: 'var(--ink-50)' }}>
          <Search size={28} strokeWidth={1.5} style={{ color: 'var(--ink-40)' }} />
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)', margin: 0 }}>Inga recept matchar.</p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, margin: 0 }}>Prova att rensa filtren.</p>
          <Button className="rounded-full mt-2" onClick={() => navigate('/recipes/new')}>Lägg till recept</Button>
        </div>
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
          {filtered.map(r => <RecipeCard key={r.id} recipe={r} onDelete={setToDelete} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(r => <RecipeRow key={r.id} recipe={r} onDelete={setToDelete} />)}
        </div>
      )}

      {/* ── Shuffle modal ───────────────────────────────────────── */}
      <ShuffleModal open={shuffleOpen} recipes={allRecipes ?? []} onClose={() => setShuffleOpen(false)} onPick={id => { setShuffleOpen(false); navigate(`/recipes/${id}`) }} />

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
