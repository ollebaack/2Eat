import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Pencil, Trash2, Bookmark, Check, Sparkles, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { getRecipeById, deleteRecipe, getRecipes } from '@/lib/api'
import { recipeSwatch } from '@/lib/recipeUtils'
import type { Recipe } from '@/types'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useIsMobile } from '@/hooks/useIsMobile'
import { MobileDetailScreen } from '@/components/mobile/MobileDetailScreen'
import { PhotoSlot } from '@/components/PhotoSlot'
import { StarRating } from '@/components/StarRating'
import { Pill } from '@/components/Pill'

// ── Servings scaler ───────────────────────────────────────────────────────
function ScalerControl({
  servings,
  setServings,
  base,
}: {
  servings: number
  setServings: (n: number) => void
  base: number
}) {
  const factor = servings / base
  return (
    <div className="inline-flex items-center border border-line rounded-full overflow-hidden bg-paper">
      <Button
        variant="ghost"
        size="icon"
        className="h-[34px] w-[34px] rounded-none text-lg text-ink-60"
        onClick={() => setServings(Math.max(1, servings - 1))}
      >
        −
      </Button>
      <div className="px-[10px] flex flex-col items-center min-w-[72px] leading-none">
        <span className="text-ink" style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>
          {servings}
        </span>
        <span
          className="text-ink-50 uppercase mt-[2px]"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em' }}
        >
          ×{factor.toFixed(1)}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-[34px] w-[34px] rounded-none text-lg text-ink-60"
        onClick={() => setServings(servings + 1)}
      >
        +
      </Button>
    </div>
  )
}

// ── Format quantity (fractions) ───────────────────────────────────────────
function fmtQty(q: number): string {
  if (Math.abs(q - 0.25) < 0.01) return '¼'
  if (Math.abs(q - 0.5) < 0.01) return '½'
  if (Math.abs(q - 0.75) < 0.01) return '¾'
  if (Math.abs(q - 1.5) < 0.01) return '1½'
  if (Math.abs(q - 2.5) < 0.01) return '2½'
  if (Math.abs(q - Math.round(q)) < 0.001) return String(Math.round(q))
  return (Math.round(q * 10) / 10).toString().replace('.', ',')
}

// ── Mini recipe card for related section ──────────────────────────────────
function RelatedCard({ recipe }: { recipe: Recipe }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="no-underline"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article
        className="flex flex-col bg-paper rounded-[18px] overflow-hidden transition-[transform,border-color] duration-200"
        style={{
          border: `1px solid ${hovered ? 'var(--ink-30)' : 'var(--line)'}`,
          transform: hovered ? 'translateY(-2px)' : 'none',
        }}
      >
        <PhotoSlot imageUrl={recipe.imageUrl} swatch={recipeSwatch(recipe.id)} aspect="5/4" />
        <div className="p-4 flex flex-col gap-[6px]">
          <h4
            className="text-ink m-0 font-normal leading-[1.15]"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 19, letterSpacing: '-0.02em' }}
          >
            {recipe.name}
          </h4>
          <div className="flex items-center justify-between">
            <span
              className="text-ink-50"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.06em' }}
            >
              {recipe.totalTime} MIN · {recipe.servings} PERS
            </span>
            <StarRating value={recipe.rating} size={10} />
          </div>
        </div>
      </article>
    </Link>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="max-w-[1240px] mx-auto px-10 pt-6 pb-[80px]">
      <Skeleton className="h-8 w-48 mb-8" />
      <div className="grid gap-10 mb-9" style={{ gridTemplateColumns: '1.1fr 1fr' }}>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="rounded-3xl" style={{ aspectRatio: '4/5' }} />
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipes', Number(id)],
    queryFn: () => getRecipeById(Number(id)),
    enabled: !!id,
  })

  const { data: allRecipes } = useQuery({ queryKey: ['recipes'], queryFn: getRecipes })

  const [servings, setServings] = useState<number | null>(null)
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [stepDone, setStepDone] = useState<Record<number, boolean>>({})

  const deleteMutation = useMutation({
    mutationFn: () => deleteRecipe(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Recept borttaget')
      navigate('/')
    },
    onError: () => toast.error('Kunde inte ta bort receptet'),
  })

  if (isLoading) return <DetailSkeleton />
  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-ink-50">
        <p className="text-ink m-0" style={{ fontFamily: 'var(--font-serif)', fontSize: 22 }}>
          Receptet hittades inte.
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/">Tillbaka</Link>
        </Button>
      </div>
    )
  }

  if (isMobile) return <MobileDetailScreen recipe={recipe} />

  const sortedIngredients = [...(recipe.ingredients ?? [])].sort((a, b) => a.order - b.order)
  const currentServings = servings ?? recipe.servings
  const factor = currentServings / (recipe.servings || 1)

  const steps = (recipe.instructions ?? '')
    .split(/\n+/)
    .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(Boolean)

  const related = (allRecipes ?? [])
    .filter(r => r.id !== recipe.id && r.category?.name === recipe.category?.name)
    .slice(0, 3)

  const lastModified = new Date(recipe.lastModified ?? recipe.createdAt).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="max-w-[1240px] mx-auto px-10 pt-6 pb-[80px] w-full">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-6">
        <Button
          variant="ghost"
          className="gap-2 -ml-2 text-ink-60"
          style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Tillbaka till alla recept
        </Button>
        <div className="flex gap-[6px]">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" title="Spara">
            <Bookmark size={15} strokeWidth={1.5} />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" title="Redigera" asChild>
            <Link to={`/recipes/${recipe.id}/edit`}><Pencil size={15} strokeWidth={1.5} /></Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" title="Radera">
                <Trash2 size={15} strokeWidth={1.5} />
              </Button>
            </DialogTrigger>
            <DialogContent style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 20 }}>
              <DialogHeader>
                <DialogTitle style={{ fontFamily: 'var(--font-serif)', fontSize: 26, letterSpacing: '-0.02em', fontWeight: 400 }}>
                  Ta bort recept?
                </DialogTitle>
                <DialogDescription style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-60)' }}>
                  Det här raderar <strong style={{ color: 'var(--ink)' }}>{recipe.name}</strong> permanent.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" className="rounded-full">Avbryt</Button>
                <Button
                  variant="destructive"
                  className="rounded-full"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate()}
                >
                  Ta bort
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Editorial header ─────────────────────────────────────── */}
      <header className="grid gap-10 items-stretch mb-9" style={{ gridTemplateColumns: '1.1fr 1fr' }}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-[10px] flex-wrap">
            {recipe.category && <Pill tone="accent" size="sm">{recipe.category.name}</Pill>}
            <span
              className="text-ink-50 uppercase"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.12em' }}
            >
              Recept №{String(recipe.id).padStart(3, '0')} · {lastModified}
            </span>
          </div>
          <h1
            className="text-ink m-0 font-normal leading-[1.0]"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(48px, 6vw, 72px)',
              letterSpacing: '-0.04em',
            }}
          >
            {recipe.name}
          </h1>
          <p
            className="text-ink-70 italic m-0 max-w-[520px]"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.5 }}
          >
            "{recipe.description}"
          </p>
          <div className="flex items-center gap-[14px] mt-auto">
            <StarRating value={recipe.rating} size={14} />
            <span className="w-px h-4 bg-line inline-block" />
            <span className="text-ink-60" style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>
              Sparat · {lastModified}
            </span>
          </div>
        </div>
        <div className="rounded-[24px] overflow-hidden">
          <PhotoSlot
            imageUrl={recipe.imageUrl}
            swatch={recipeSwatch(recipe.id)}
            aspect="4/5"
            label={recipe.name}
          />
        </div>
      </header>

      {/* ── Stat strip ──────────────────────────────────────────── */}
      <section
        className="grid bg-paper border border-line rounded-[18px] px-7 py-6 mb-10"
        style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
      >
        {[
          { k: 'Förberedelse', v: recipe.prepTime,        u: 'min' },
          { k: 'Tillagning',   v: recipe.cookTime,        u: 'min' },
          { k: 'Total tid',    v: recipe.totalTime,       u: 'min' },
          { k: 'Portioner',    v: currentServings,        u: 'st'  },
          { k: 'Betyg',        v: `${recipe.rating}`,    u: '/ 5' },
        ].map((s, i) => (
          <div
            key={s.k}
            className="flex flex-col gap-[6px]"
            style={{ paddingLeft: i === 0 ? 0 : 28, borderLeft: i === 0 ? 'none' : '1px solid var(--line)' }}
          >
            <span
              className="text-ink-50 uppercase"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em' }}
            >
              {s.k}
            </span>
            <span
              className="text-ink leading-none"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 34, letterSpacing: '-0.025em' }}
            >
              {s.v}
              {s.u && (
                <span
                  className="text-ink-50 ml-[6px]"
                  style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}
                >
                  {s.u}
                </span>
              )}
            </span>
          </div>
        ))}
      </section>

      {/* ── Allergens ───────────────────────────────────────────── */}
      {sortedIngredients.some(ri => ri.ingredient?.allergens?.length > 0) && (
        <section className="flex items-center gap-3 mb-9 flex-wrap">
          <span
            className="text-ink-50 uppercase"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.12em' }}
          >
            Innehåller / passar
          </span>
          {[...new Set(sortedIngredients.flatMap(ri => ri.ingredient?.allergens?.map(a => a.id) ?? []))].map(a => (
            <Pill key={a} tone="default" size="sm">{a}</Pill>
          ))}
        </section>
      )}

      {/* ── Magazine body (ingredients + instructions) ──────────── */}
      <section className="grid gap-14" style={{ gridTemplateColumns: '1fr 1.5fr' }}>

        {/* Ingredients (sticky) */}
        <aside className="sticky top-6 self-start">
          <div className="flex items-baseline justify-between mb-[18px]">
            <h2
              className="text-ink m-0 font-normal"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.025em' }}
            >
              Ingredienser
            </h2>
            <ScalerControl
              servings={currentServings}
              setServings={v => setServings(v)}
              base={recipe.servings}
            />
          </div>
          <ul className="list-none p-0 m-0 flex flex-col">
            {sortedIngredients.map((ri, i) => {
              const qty = (ri.ingredientMeasurement?.quantity ?? 0) * factor
              const isOn = !!checked[ri.id]
              return (
                <li
                  key={ri.id}
                  onClick={() => setChecked(c => ({ ...c, [ri.id]: !c[ri.id] }))}
                  className="grid gap-3 items-baseline py-3 cursor-pointer transition-opacity duration-150"
                  style={{
                    gridTemplateColumns: '20px 1fr auto',
                    borderBottom: i === sortedIngredients.length - 1 ? 'none' : '1px dotted var(--line)',
                    opacity: isOn ? 0.45 : 1,
                  }}
                >
                  <span
                    className="grid place-items-center transition-all duration-150"
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      flexShrink: 0,
                      border: `1.5px solid ${isOn ? 'var(--2eat-accent)' : 'var(--ink-30)'}`,
                      background: isOn ? 'var(--2eat-accent)' : 'transparent',
                      color: 'var(--paper)',
                    }}
                  >
                    {isOn && <Check size={11} strokeWidth={2.5} color="var(--paper)" />}
                  </span>
                  <span
                    className="text-ink"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 14.5,
                      textDecoration: isOn ? 'line-through' : 'none',
                    }}
                  >
                    {ri.ingredient?.name}
                  </span>
                  <span
                    className="text-ink-60 whitespace-nowrap"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.02em' }}
                  >
                    {fmtQty(qty)} {ri.ingredientMeasurement?.unit}
                  </span>
                </li>
              )
            })}
          </ul>
          <div className="mt-[18px] p-[14px] bg-surface-1 rounded-xl flex items-center justify-between gap-[10px]">
            <span
              className="text-ink-60 uppercase"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em' }}
            >
              {Object.values(checked).filter(Boolean).length} / {sortedIngredients.length} ikryssat
            </span>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs">
              <Plus size={12} /> Till handlista
            </Button>
          </div>
        </aside>

        {/* Instructions */}
        <div>
          <h2
            className="text-ink font-normal"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.025em', margin: '0 0 24px' }}
          >
            Så här gör du
          </h2>
          {steps.length > 0 ? (
            <ol className="list-none p-0 m-0 flex flex-col">
              {steps.map((step, i) => {
                const isDone = !!stepDone[i]
                return (
                  <li
                    key={i}
                    onClick={() => setStepDone(s => ({ ...s, [i]: !s[i] }))}
                    className="grid gap-6 items-start py-6 cursor-pointer"
                    style={{
                      gridTemplateColumns: '64px 1fr',
                      borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                    }}
                  >
                    <span
                      className="font-normal italic transition-colors duration-200"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 54,
                        lineHeight: 0.85,
                        letterSpacing: '-0.04em',
                        color: isDone ? 'var(--ink-30)' : 'var(--2eat-accent-deep)',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p
                      className="m-0 mt-[6px] transition-colors duration-200"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 19,
                        lineHeight: 1.5,
                        color: isDone ? 'var(--ink-50)' : 'var(--ink)',
                        textDecoration: isDone ? 'line-through' : 'none',
                      }}
                    >
                      {step}
                    </p>
                  </li>
                )
              })}
            </ol>
          ) : (
            <p
              className="text-ink italic"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}
            >
              {recipe.instructions}
            </p>
          )}

          {/* Chef tip */}
          <div className="mt-8 p-[24px_28px] bg-surface-1 rounded-[18px] border border-line">
            <div className="flex items-center gap-[10px] mb-2">
              <Sparkles size={14} strokeWidth={1.5} style={{ color: 'var(--2eat-accent-deep)' }} />
              <span
                className="text-brand-deep uppercase"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em' }}
              >
                Kockens tips
              </span>
            </div>
            <p
              className="text-ink italic m-0"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.5 }}
            >
              Smaka av och justera kryddorna i slutet av tillagningen — det gör en stor skillnad för slutresultatet.
            </p>
          </div>
        </div>
      </section>

      {/* ── Related recipes ──────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="mt-[80px]">
          <Separator className="mb-10 bg-line" />
          <div className="flex items-baseline justify-between mb-6">
            <h2
              className="text-ink m-0 font-normal"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: '-0.03em' }}
            >
              Mer från{' '}
              <em className="italic text-brand-deep">{recipe.category?.name?.toLowerCase()}</em>
            </h2>
            <span
              className="text-ink-50 uppercase"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em' }}
            >
              Liknande recept
            </span>
          </div>
          <div className="grid grid-cols-3 gap-[18px]">
            {related.map(r => <RelatedCard key={r.id} recipe={r} />)}
          </div>
        </section>
      )}
    </div>
  )
}
