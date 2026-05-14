import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Pencil, Trash2, Bookmark, Check, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { getRecipeById, deleteRecipe, getRecipes, addRecipeToShoppingList } from '@/lib/api'
import { AddToSamlingModal } from '@/components/AddToSamlingModal'
import type { Recipe } from '@/types'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { useIsMobile } from '@/hooks/useIsMobile'
import { MobileDetailScreen } from '@/components/mobile/MobileDetailScreen'
import { PhotoSlot } from '@/components/PhotoSlot'
import { StarRating } from '@/components/StarRating'
import { Pill } from '@/components/Pill'
import { recipeSwatch } from '@/lib/recipeUtils'

// ── Servings scaler ───────────────────────────────────────────────────────
function ScalerControl({ servings, setServings }: { servings: number; setServings: (n: number) => void }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 999, overflow: 'hidden', background: 'var(--paper)' }}>
      <Button variant="ghost" size="icon" className="h-[34px] w-[34px] rounded-none text-lg" style={{ color: 'var(--ink-60)' }} onClick={() => setServings(Math.max(1, servings - 1))}>−</Button>
      <div style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72, lineHeight: 1 }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--ink)' }}>{servings}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-50)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>portioner</span>
      </div>
      <Button variant="ghost" size="icon" className="h-[34px] w-[34px] rounded-none text-lg" style={{ color: 'var(--ink-60)' }} onClick={() => setServings(servings + 1)}>+</Button>
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

// ── Mini recipe card for related section ────────────────────��────────────
function RelatedCard({ recipe }: { recipe: Recipe }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={`/recipes/${recipe.id}`}
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--paper)',
        border: `1px solid ${hovered ? 'var(--ink-30)' : 'var(--line)'}`,
        borderRadius: 18, overflow: 'hidden',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'transform 0.2s, border-color 0.15s',
      }}>
        <PhotoSlot imageUrl={recipe.imageUrl} swatch={recipeSwatch(recipe.id)} aspect="5/4" />
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, letterSpacing: '-0.02em', color: 'var(--ink)', margin: 0, fontWeight: 400, lineHeight: 1.15 }}>{recipe.name}</h4>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-50)', letterSpacing: '0.06em' }}>{recipe.totalTime} MIN · {recipe.servings} PERS</span>
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
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 40px 80px' }}>
      <Skeleton className="h-8 w-48 mb-8" />
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, marginBottom: 36 }}>
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
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [samlingOpen, setSamlingOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => deleteRecipe(Number(id)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['recipes'] }); toast.success('Recept borttaget'); navigate('/') },
    onError: () => toast.error('Kunde inte ta bort receptet'),
  })

  const addToShoppingListMutation = useMutation({
    mutationFn: () => addRecipeToShoppingList(Number(id)),
    onSuccess: () => toast.success('Ingredienser tillagda i handlistan'),
    onError: () => toast.error('Kunde inte lägga till i handlistan'),
  })

  if (isLoading) return <DetailSkeleton />
  if (!recipe) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 48, color: 'var(--ink-50)' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)' }}>Receptet hittades inte.</p>
        <Button asChild variant="outline" className="rounded-full"><Link to="/">Tillbaka</Link></Button>
      </div>
    )
  }

  if (isMobile) return <MobileDetailScreen recipe={recipe} />

  const sortedIngredients = [...(recipe.ingredients ?? [])].sort((a, b) => a.order - b.order)
  const currentServings = servings ?? recipe.servings
  const factor = currentServings / (recipe.servings || 1)

  const pricedIngredients = sortedIngredients.filter(ri => ri.ingredient?.pricePerUnit != null)
  const totalCost = pricedIngredients.reduce((sum, ri) => {
    const qty = (ri.ingredientMeasurement?.quantity ?? 0) * factor
    return sum + qty * (ri.ingredient.pricePerUnit ?? 0)
  }, 0)
  const hasCost = pricedIngredients.length > 0

  // Parse instructions into steps array (split on numbered lines or newlines)
  const steps = (recipe.instructions ?? '')
    .split(/\n+/)
    .map(s => s.replace(/^\d+[.)]\s*/, '').trim())
    .filter(Boolean)

  const related = (allRecipes ?? []).filter(r => r.id !== recipe.id && r.category?.name === recipe.category?.name).slice(0, 3)

  const lastModified = new Date(recipe.lastModified ?? recipe.createdAt).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' })

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 40px 80px', width: '100%' }}>

      {/* ── Top bar ───────────────────���─────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 24 }}>
        <Button
          variant="ghost"
          className="gap-2 -ml-2"
          style={{ color: 'var(--ink-60)', fontFamily: 'var(--font-sans)', fontSize: 13 }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Tillbaka till alla recept
        </Button>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" title="Lägg till i samling" onClick={() => setSamlingOpen(true)}><Bookmark size={15} strokeWidth={1.5} /></Button>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" title="Redigera" asChild>
            <Link to={`/recipes/${recipe.id}/edit`}><Pencil size={15} strokeWidth={1.5} /></Link>
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" title="Ta bort recept" onClick={() => setDeleteOpen(true)}><Trash2 size={15} strokeWidth={1.5} /></Button>
          <DeleteConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Ta bort recept"
            description={<>Är du säker på att du vill ta bort <strong style={{ color: 'var(--ink)' }}>{recipe.name}</strong>? Åtgärden kan inte ångras.</>}
            onConfirm={() => deleteMutation.mutate()}
            isPending={deleteMutation.isPending}
          />
        </div>
      </div>

      {/* ── Editorial header ─────────────────────────────────────── */}
      <header style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, alignItems: 'stretch', marginBottom: 36 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {recipe.category && <Pill tone="accent" size="sm">{recipe.category.name}</Pill>}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-50)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Recept №{String(recipe.id).padStart(3, '0')} · {lastModified}
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(48px, 6vw, 72px)', lineHeight: 1.0, letterSpacing: '-0.04em', color: 'var(--ink)', margin: 0, fontWeight: 400 }}>
            {recipe.name}
          </h1>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, lineHeight: 1.5, color: 'var(--ink-70)', margin: 0, maxWidth: 520 }}>
            {recipe.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 'auto' }}>
            <StarRating value={recipe.rating} size={14} />
            <span style={{ width: 1, height: 16, background: 'var(--line)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>Senast ändrad {lastModified}</span>
          </div>
        </div>
        <div style={{ borderRadius: 24, overflow: 'hidden' }}>
          <PhotoSlot imageUrl={recipe.imageUrl} swatch={recipeSwatch(recipe.id)} aspect="4/5" label={recipe.name} />
        </div>
      </header>

      {/* ── Stat strip ─────────────────────────────��────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: `repeat(${hasCost ? 6 : 5}, 1fr)`, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 18, padding: '24px 28px', marginBottom: 40 }}>
        {[
          { k: 'Förberedelse', v: recipe.prepTime,   u: 'min' },
          { k: 'Tillagning',   v: recipe.cookTime,   u: 'min' },
          { k: 'Total tid',    v: recipe.totalTime,  u: 'min' },
          { k: 'Portioner',    v: currentServings,         u: 'st'  },
          { k: 'Svårighet',    v: recipe.difficulty || 'Medel', u: '' },
          ...(hasCost ? [{ k: 'Kostnad', v: `~${Math.round(totalCost)}`, u: 'kr' }] : []),
        ].map((s, i) => (
          <div key={s.k} style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: i === 0 ? 0 : 28, borderLeft: i === 0 ? 'none' : '1px solid var(--line)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-50)' }}>{s.k}</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 34, lineHeight: 1, color: 'var(--ink)', letterSpacing: '-0.025em' }}>
              {s.v}{s.u && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-50)', marginLeft: 6 }}>{s.u}</span>}
            </span>
          </div>
        ))}
      </section>

      {/* ── Nutrition ───────────────────────────────────────────── */}
      {(recipe.calories || recipe.protein || recipe.fat || recipe.carbs) && (
        <section style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 28, flexWrap: 'wrap', padding: '20px 24px', background: 'var(--surface-1)', border: '1px solid var(--line)', borderRadius: 14 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-50)', letterSpacing: '0.12em', textTransform: 'uppercase', flexShrink: 0 }}>Per portion</span>
          {([
            { label: 'Kcal',         value: recipe.calories != null ? String(recipe.calories) : null },
            { label: 'Protein',      value: recipe.protein  != null ? `${recipe.protein}g`    : null },
            { label: 'Fett',         value: recipe.fat      != null ? `${recipe.fat}g`        : null },
            { label: 'Kolhydrater',  value: recipe.carbs    != null ? `${recipe.carbs}g`      : null },
          ] as { label: string; value: string | null }[]).filter(n => n.value !== null).map(n => (
            <div key={n.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-50)' }}>{n.label}</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{n.value}</span>
            </div>
          ))}
        </section>
      )}

      {/* ── Allergens ───────────────────────────────────────────── */}
      {(() => {
        const ingredientAllergenIds = [...new Set(sortedIngredients.flatMap(ri => ri.ingredient?.allergens?.map(a => a.id) ?? []))]
        const recipeAllergenIds = (recipe.allergens ?? []).map(a => a.id)
        const allAllergenIds = [...new Set([...ingredientAllergenIds, ...recipeAllergenIds])]
        return allAllergenIds.length > 0 ? (
          <section style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-50)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Innehåller / passar</span>
            {allAllergenIds.map(a => (
              <Pill key={a} tone="default" size="sm">{a}</Pill>
            ))}
          </section>
        ) : null
      })()}

      {/* ── Magazine body (ingredients + instructions) ──────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 56 }}>

        {/* Ingredients (sticky) */}
        <aside style={{ position: 'sticky', top: 24, alignSelf: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.025em', color: 'var(--ink)', margin: 0, fontWeight: 400 }}>Ingredienser</h2>
            <ScalerControl servings={currentServings} setServings={v => setServings(v)} />
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
            {sortedIngredients.map((ri, i) => {
              const qty = (ri.ingredientMeasurement?.quantity ?? 0) * factor
              const isOn = !!checked[ri.ingredientMeasurementId]
              return (
                <li
                  key={ri.ingredientMeasurementId}
                  onClick={() => setChecked(c => ({ ...c, [ri.ingredientMeasurementId]: !c[ri.ingredientMeasurementId] }))}
                  style={{
                    display: 'grid', gridTemplateColumns: '20px 1fr auto',
                    gap: 12, alignItems: 'baseline',
                    padding: '12px 0',
                    borderBottom: i === sortedIngredients.length - 1 ? 'none' : '1px dotted var(--line)',
                    cursor: 'pointer', opacity: isOn ? 0.45 : 1, transition: 'opacity 0.15s',
                  }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: `1.5px solid ${isOn ? 'var(--2eat-accent)' : 'var(--ink-30)'}`,
                    background: isOn ? 'var(--2eat-accent)' : 'transparent',
                    color: 'var(--paper)', display: 'grid', placeItems: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {isOn && <Check size={11} strokeWidth={2.5} color="var(--paper)" />}
                  </span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, color: 'var(--ink)', textDecoration: isOn ? 'line-through' : 'none' }}>
                    {ri.ingredient?.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-60)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                    {fmtQty(qty)} {ri.ingredientMeasurement?.unit}
                  </span>
                </li>
              )
            })}
          </ul>
          <div style={{ marginTop: 18, padding: 14, background: 'var(--surface-1)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-60)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {Object.values(checked).filter(Boolean).length} / {sortedIngredients.length} ikryssat
              </span>
              <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs" onClick={() => addToShoppingListMutation.mutate()} disabled={addToShoppingListMutation.isPending}>
                <Plus size={12} /> Till handlista
              </Button>
            </div>
            {hasCost && (
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderTop: '1px dotted var(--line)', paddingTop: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Beräknad kostnad
                  {pricedIngredients.length < sortedIngredients.length && (
                    <span style={{ marginLeft: 4, opacity: 0.7 }}>({pricedIngredients.length}/{sortedIngredients.length} ing.)</span>
                  )}
                </span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                  ~{Math.round(totalCost)} kr
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* Instructions */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.025em', color: 'var(--ink)', margin: '0 0 24px', fontWeight: 400 }}>Så här gör du</h2>
          {steps.length > 0 ? (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
              {steps.map((step, i) => {
                const isDone = !!stepDone[i]
                return (
                  <li
                    key={i}
                    onClick={() => setStepDone(s => ({ ...s, [i]: !s[i] }))}
                    style={{
                      display: 'grid', gridTemplateColumns: '64px 1fr', gap: 24,
                      alignItems: 'flex-start', padding: '24px 0',
                      borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-serif)', fontSize: 54, lineHeight: 0.85,
                      letterSpacing: '-0.04em',
                      color: isDone ? 'var(--ink-30)' : 'var(--2eat-accent-deep)',
                      fontWeight: 400, fontStyle: 'italic',
                      transition: 'color 0.2s',
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p style={{
                      fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.5,
                      color: isDone ? 'var(--ink-50)' : 'var(--ink)',
                      margin: 0, marginTop: 6,
                      textDecoration: isDone ? 'line-through' : 'none',
                      transition: 'color 0.2s',
                    }}>
                      {step}
                    </p>
                  </li>
                )
              })}
            </ol>
          ) : (
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.6, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{recipe.instructions}</p>
          )}

          {/* Chef tip */}
          <div style={{ marginTop: 32, padding: '24px 28px', background: 'var(--surface-1)', borderRadius: 18, border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ color: 'var(--2eat-accent-deep)' }}>✦</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--2eat-accent-deep)', textTransform: 'uppercase' }}>
                Kockens tips
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontStyle: 'italic', lineHeight: 1.5, color: 'var(--ink)', margin: 0 }}>
              Smaka av och justera kryddorna i slutet av tillagningen — det gör en stor skillnad för slutresultatet.
            </p>
          </div>
        </div>
      </section>

      {/* ── Related recipes ──────────────────────────────────────── */}
      <AddToSamlingModal recipeId={recipe.id} open={samlingOpen} onOpenChange={setSamlingOpen} />

      {related.length > 0 && (
        <section style={{ marginTop: 80 }}>
          <Separator style={{ marginBottom: 40, background: 'var(--line)' }} />
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: '-0.03em', margin: 0, fontWeight: 400 }}>
              Mer från <em style={{ fontStyle: 'italic', color: 'var(--2eat-accent-deep)' }}>{recipe.category?.name?.toLowerCase()}</em>
            </h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Liknande recept</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {related.map(r => <RelatedCard key={r.id} recipe={r} />)}
          </div>
        </section>
      )}
    </div>
  )
}
