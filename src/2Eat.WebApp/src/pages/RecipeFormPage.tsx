import { useState, useRef, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getRecipeById, createRecipe, updateRecipe, uploadFile, getRecipes, ALLERGEN_OPTIONS } from '@/lib/api'
import type { RecipeIngredient, ScannedRecipe, UnitOfMeasurement } from '@/types'
import { ScanRecipeDialog } from '@/components/ScanRecipeDialog'
import { PhotoSlot } from '@/components/PhotoSlot'

const UNITS: UnitOfMeasurement[] = [
  'g', 'ml', 'kg', 'krm', 'tsk', 'msk', 'dl', 'l', 'kaffemått', 'st',
  'cup', 'fl oz', 'oz', 'lbs', 'cl', 'pinch', 'tsp', 'tbsp',
]

type IngredientRow = { key: string; name: string; quantity: number; unit: UnitOfMeasurement; order: number }
function newRow(order: number): IngredientRow { return { key: crypto.randomUUID(), name: '', quantity: 0, unit: 'g', order } }

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10,
  fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink)',
  outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: 'var(--ink-50)',
}

export function RecipeFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: existing } = useQuery({ queryKey: ['recipes', Number(id)], queryFn: () => getRecipeById(Number(id)), enabled: isEdit })
  const { data: allRecipes } = useQuery({ queryKey: ['recipes'], queryFn: getRecipes })

  const categories = useMemo(() =>
    [...new Map(
      (allRecipes ?? []).filter(r => r.category).map(r => [r.category.id, r.category])
    ).values()],
  [allRecipes])

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [instructions, setInstructions] = useState('')
  const [servings, setServings] = useState(4)
  const [rating, setRating] = useState(3)
  const [prepTime, setPrepTime] = useState(15)
  const [cookTime, setCookTime] = useState(30)
  const [difficulty, setDifficulty] = useState('Medel')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [imageUrl, setImageUrl] = useState<string | undefined>()
  const [rows, setRows] = useState<IngredientRow[]>([newRow(1)])
  const [steps, setSteps] = useState<string[]>([''])
  const [allergens, setAllergens] = useState<string[]>([])
  const [initialized, setInitialized] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | undefined>()
  const [scanOpen, setScanOpen] = useState(false)

  if (isEdit && existing && !initialized) {
    setName(existing.name)
    setDescription(existing.description)
    setInstructions(existing.instructions)
    setServings(existing.servings)
    setRating(existing.rating)
    setPrepTime(existing.prepTime)
    setCookTime(existing.cookTime)
    setDifficulty(existing.difficulty ?? 'Medel')
    setCategoryId(existing.categoryId)
    setImageUrl(existing.imageUrl)
    const sorted = [...(existing.ingredients ?? [])].sort((a, b) => a.order - b.order)
    setRows(sorted.length > 0
      ? sorted.map((ri: RecipeIngredient) => ({ key: String(ri.ingredientMeasurementId), name: ri.ingredient?.name ?? '', quantity: ri.ingredientMeasurement?.quantity ?? 0, unit: ri.ingredientMeasurement?.unit ?? 'g', order: ri.order }))
      : [newRow(1)])
    const parsedSteps = existing.instructions.split(/\n+/).map(s => s.replace(/^\d+[.)]\s*/, '').trim()).filter(Boolean)
    if (parsedSteps.length > 0) setSteps(parsedSteps)
    setInitialized(true)
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name, description, difficulty,
        ...(categoryId !== undefined ? { categoryId } : {}),
        instructions: steps.filter(s => s.trim()).map((s, i) => `${i + 1}. ${s}`).join('\n') || instructions,
        servings, rating, prepTime, cookTime, imageUrl,
        ingredients: rows.filter(r => r.name.trim()).map((r, i) => ({
          order: i + 1,
          ingredient: { name: r.name },
          ingredientMeasurement: { quantity: r.quantity, unit: r.unit },
        })),
      }
      return isEdit ? updateRecipe(Number(id), payload) : createRecipe(payload)
    },
    onSuccess: saved => { queryClient.invalidateQueries({ queryKey: ['recipes'] }); toast.success(isEdit ? 'Recept uppdaterat' : 'Recept skapat'); navigate(`/recipes/${saved.id}`) },
    onError: () => toast.error('Kunde inte spara receptet'),
  })

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setLocalPreview(preview)
    setUploading(true)
    try {
      const upload = await uploadFile(file)
      if (upload.isSuccess) { setImageUrl(upload.storedFileName); setLocalPreview(undefined); URL.revokeObjectURL(preview) }
      else { toast.error('Uppladdning misslyckades'); setLocalPreview(undefined); URL.revokeObjectURL(preview) }
    } catch { toast.error('Uppladdning misslyckades'); setLocalPreview(undefined); URL.revokeObjectURL(preview) }
    finally { setUploading(false) }
  }

  function applyScannedRecipe(data: ScannedRecipe) {
    const UNIT_MAP: Record<string, UnitOfMeasurement> = {
      // existing
      g: 'g', ml: 'ml', kg: 'kg', krm: 'krm', tsk: 'tsk',
      msk: 'msk', dl: 'dl', l: 'l', kaffemått: 'kaffemått', st: 'st',
      // new direct mappings
      cup: 'cup', floz: 'fl oz', 'fl oz': 'fl oz',
      oz: 'oz', lbs: 'lbs', lb: 'lbs', cl: 'cl',
      pinch: 'pinch', tsp: 'tsp', tbsp: 'tbsp',
      // legacy aliases (still map old AI output)
      piece: 'st', pcs: 'st', teaspoon: 'tsp', tablespoon: 'tbsp',
    }
    if (data.name)        setName(data.name)
    if (data.description) setDescription(data.description)
    if (data.servings)    setServings(data.servings)
    if (data.prepTime)    setPrepTime(data.prepTime)
    if (data.cookTime)    setCookTime(data.cookTime)
    if (data.difficulty && ['Lätt', 'Medel', 'Svår'].includes(data.difficulty))
      setDifficulty(data.difficulty)
    if (data.imageUrl)    setImageUrl(data.imageUrl)
    if (data.steps?.length) setSteps(data.steps)
    if (data.ingredients?.length) {
      setRows(data.ingredients.map((ing, i) => ({
        key: crypto.randomUUID(),
        name: ing.name,
        quantity: ing.quantity ?? 0,
        unit: (UNIT_MAP[ing.unit?.toLowerCase() ?? ''] ?? ((ing.quantity ?? 0) > 0 ? 'st' : 'g')) as UnitOfMeasurement,
        order: i + 1,
      })))
    }
    toast.success('Recept skannat — granska och spara')
  }

  const saveDisabled = saveMutation.isPending || !name.trim()

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '36px 40px 80px', width: '100%' }}>

      {/* Back button */}
      <button
        onClick={() => navigate(isEdit ? `/recipes/${id}` : '/')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--ink-60)', fontFamily: 'var(--font-sans)', fontSize: 13, marginBottom: 18 }}
      >
        ← Avbryt
      </button>

      {/* Page header */}
      <header style={{ marginBottom: 36, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', color: 'var(--2eat-accent-deep)', textTransform: 'uppercase' }}>
            {isEdit ? 'Redigera recept' : 'Skapa nytt · Steg 1 av 3'}
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(38px, 5vw, 56px)', letterSpacing: '-0.035em', lineHeight: 0.95, margin: '8px 0 0', fontWeight: 400, color: 'var(--ink)' }}>
            {isEdit ? existing?.name ?? 'Redigera recept' : 'Lägg till recept'}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setScanOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', borderRadius: 999,
            border: '1px solid var(--line)', background: 'transparent',
            cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13,
            color: 'var(--ink)', marginTop: 8, flexShrink: 0,
          }}
        >
          ⌁ Skanna recept
        </button>
      </header>

      <ScanRecipeDialog open={scanOpen} onOpenChange={setScanOpen} onApply={applyScannedRecipe} />

      {/* Metadata grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 36 }}>

        {/* Recipe name — spans all 4 columns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 4' }}>
          <label style={labelStyle}>Receptnamn</label>
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="t.ex. Mormors köttbullar"
            style={{ ...inputStyle, fontFamily: 'var(--font-serif)', fontSize: 26, padding: '14px 18px', letterSpacing: '-0.02em' }}
          />
        </div>

        {/* Description — spans 4 cols */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 4' }}>
          <label style={labelStyle}>Kort beskrivning</label>
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            rows={2} placeholder="En liten mening om rätten…"
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>Kategori</label>
          <select
            value={categoryId ?? ''}
            onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
            style={inputStyle}
          >
            <option value="">Välj kategori…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Portioner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>Portioner</label>
          <input type="number" value={servings} onChange={e => setServings(Number(e.target.value))} style={inputStyle} />
        </div>

        {/* Förberedelsetid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>Förb. (min)</label>
          <input type="number" value={prepTime} onChange={e => setPrepTime(Number(e.target.value))} style={inputStyle} />
        </div>

        {/* Tillagningstid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>Tillagn. (min)</label>
          <input type="number" value={cookTime} onChange={e => setCookTime(Number(e.target.value))} style={inputStyle} />
        </div>

        {/* Difficulty */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>Svårighet</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={inputStyle}>
            <option>Lätt</option>
            <option>Medel</option>
            <option>Svår</option>
          </select>
        </div>

        {/* Rating */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>Betyg (1–5)</label>
          <input type="number" min={1} max={5} value={rating} onChange={e => setRating(Number(e.target.value))} style={inputStyle} />
        </div>

        {/* Image upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 4' }}>
          <label style={labelStyle}>Bild</label>
          {(localPreview || imageUrl) ? (
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', maxWidth: 360, aspectRatio: '4/3' }}>
              {localPreview
                ? <img src={localPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <PhotoSlot imageUrl={imageUrl} aspect="4/3" />
              }
              {uploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'white', letterSpacing: '0.08em' }}>Laddar upp…</span>
                </div>
              )}
              {!uploading && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 10, gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', border: 'none', color: 'white', fontFamily: 'var(--font-sans)', fontSize: 12, cursor: 'pointer' }}
                  >
                    Byt bild
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl(undefined)}
                    style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', border: 'none', color: 'white', fontFamily: 'var(--font-sans)', fontSize: 12, cursor: 'pointer' }}
                  >
                    Ta bort
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '9px 16px', borderRadius: 999,
                  border: '1px solid var(--line)', background: 'transparent',
                  cursor: uploading ? 'wait' : 'pointer',
                  fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink)',
                }}
              >
                ↑ Ladda upp bild
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
      </section>

      {/* Ingredients editor */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.025em', margin: 0, fontWeight: 400, color: 'var(--ink)' }}>Ingredienser</h2>
          <button
            onClick={() => setRows(arr => [...arr, newRow(arr.length + 1)])}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-60)', padding: '4px 8px', borderRadius: 8 }}
          >
            + Lägg till rad
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map((row, i) => (
            <div key={row.key} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 100px 100px 36px', gap: 10, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', textAlign: 'center' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <input
                placeholder="Ingrediens (t.ex. Vetemjöl)"
                value={row.name}
                onChange={e => setRows(arr => arr.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                style={inputStyle}
              />
              <input
                type="number" placeholder="Mängd"
                value={row.quantity || ''}
                onChange={e => setRows(arr => arr.map((x, j) => j === i ? { ...x, quantity: +e.target.value } : x))}
                style={{ ...inputStyle, fontFamily: 'var(--font-mono)', textAlign: 'right' }}
              />
              <select
                value={row.unit}
                onChange={e => setRows(arr => arr.map((x, j) => j === i ? { ...x, unit: e.target.value as UnitOfMeasurement } : x))}
                style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: 12 }}
              >
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
              <button
                onClick={() => setRows(arr => arr.filter((_, j) => j !== i))}
                style={{ width: 32, height: 32, border: '1px solid var(--line)', background: 'transparent', borderRadius: 8, cursor: 'pointer', color: 'var(--ink-50)', display: 'grid', placeItems: 'center' }}
              >✕</button>
            </div>
          ))}
        </div>
      </section>

      {/* Steps editor */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.025em', margin: 0, fontWeight: 400, color: 'var(--ink)' }}>Tillagning</h2>
          <button
            onClick={() => setSteps(arr => [...arr, ''])}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-60)', padding: '4px 8px', borderRadius: 8 }}
          >
            + Nytt steg
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 32, lineHeight: 1, fontStyle: 'italic', color: 'var(--2eat-accent-deep)', textAlign: 'right', paddingTop: 8, letterSpacing: '-0.03em' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <textarea
                rows={2} placeholder="Beskriv steget…"
                value={step}
                onChange={e => setSteps(arr => arr.map((s, j) => j === i ? e.target.value : s))}
                style={{ ...inputStyle, fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.5, resize: 'vertical' }}
              />
            </div>
          ))}
        </div>
        {steps.length === 0 && (
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="Instruktioner steg för steg…"
            rows={6}
            style={{ ...inputStyle, resize: 'vertical', marginTop: 8 }}
          />
        )}
      </section>

      {/* Allergen section */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.025em', margin: '0 0 14px', fontWeight: 400, color: 'var(--ink)' }}>Märkningar</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ALLERGEN_OPTIONS.map(a => {
            const active = allergens.includes(a)
            return (
              <button
                key={a}
                onClick={() => setAllergens(arr => active ? arr.filter(x => x !== a) : [...arr, a])}
                style={{
                  padding: '8px 16px', borderRadius: 999,
                  border: '1px solid ' + (active ? 'var(--2eat-accent)' : 'var(--line)'),
                  background: active ? 'color-mix(in oklch, var(--2eat-accent) 15%, transparent)' : 'transparent',
                  color: active ? 'var(--2eat-accent-deep)' : 'var(--ink-60)',
                  fontFamily: 'var(--font-sans)', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {a}
              </button>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, padding: '20px 0', borderTop: '1px solid var(--line)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Sparas automatiskt
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate(isEdit ? `/recipes/${id}` : '/')}
            style={{ padding: '10px 18px', borderRadius: 999, border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink)' }}
          >
            Avbryt
          </button>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveDisabled}
            style={{
              padding: '10px 18px', borderRadius: 999, border: 'none',
              background: saveDisabled ? 'var(--ink-50)' : 'var(--2eat-accent)',
              color: 'var(--paper)', cursor: saveDisabled ? 'default' : 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
            }}
          >
            {saveMutation.isPending ? 'Sparar…' : (isEdit ? 'Spara ändringar' : 'Spara recept') + ' ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
