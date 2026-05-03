import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, Upload, Check } from 'lucide-react'
import { toast } from 'sonner'
import { getRecipeById, createRecipe, updateRecipe, uploadFile, ALLERGEN_OPTIONS } from '@/lib/api'
import type { RecipeIngredient, UnitOfMeasurement } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const UNITS: UnitOfMeasurement[] = ['g', 'ml', 'kg', 'krm', 'tsk', 'msk', 'dl', 'l', 'kaffemått', 'st']

type IngredientRow = { key: string; name: string; quantity: number; unit: UnitOfMeasurement; order: number }
function newRow(order: number): IngredientRow { return { key: crypto.randomUUID(), name: '', quantity: 0, unit: 'g', order } }

// ── Field wrapper ─────────────────────────────────────────────────────────
function Field({ label, hint, children, span = 1 }: { label: string; hint?: string; children: React.ReactNode; span?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: `span ${span}` }}>
      <Label style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-50)' }}>
        {label}
      </Label>
      {children}
      {hint && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: 'var(--ink-50)' }}>{hint}</span>}
    </div>
  )
}

export function RecipeFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: existing } = useQuery({ queryKey: ['recipes', Number(id)], queryFn: () => getRecipeById(Number(id)), enabled: isEdit })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [instructions, setInstructions] = useState('')
  const [servings, setServings] = useState(4)
  const [rating, setRating] = useState(3)
  const [prepTime, setPrepTime] = useState(15)
  const [cookTime, setCookTime] = useState(30)
  const [imageUrl, setImageUrl] = useState<string | undefined>()
  const [rows, setRows] = useState<IngredientRow[]>([newRow(1)])
  const [steps, setSteps] = useState<string[]>([''])
  const [allergens, setAllergens] = useState<string[]>([])
  const [initialized, setInitialized] = useState(false)
  const [uploading, setUploading] = useState(false)

  if (isEdit && existing && !initialized) {
    setName(existing.name)
    setDescription(existing.description)
    setInstructions(existing.instructions)
    setServings(existing.servings)
    setRating(existing.rating)
    setPrepTime(existing.prepTime)
    setCookTime(existing.cookTime)
    setImageUrl(existing.imageUrl)
    const sorted = [...(existing.ingredients ?? [])].sort((a, b) => a.order - b.order)
    setRows(sorted.length > 0
      ? sorted.map((ri: RecipeIngredient) => ({ key: String(ri.id), name: ri.ingredient?.name ?? '', quantity: ri.ingredientMeasurement?.quantity ?? 0, unit: ri.ingredientMeasurement?.unit ?? 'g', order: ri.order }))
      : [newRow(1)])
    // parse steps from instructions
    const parsedSteps = existing.instructions.split(/\n+/).map(s => s.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean)
    if (parsedSteps.length > 0) setSteps(parsedSteps)
    setInitialized(true)
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name, description,
        instructions: steps.filter(s => s.trim()).map((s, i) => `${i + 1}. ${s}`).join('\n'),
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
    setUploading(true)
    try {
      const upload = await uploadFile(file)
      if (upload.isSuccess) setImageUrl(upload.storedFileName)
      else toast.error('Uppladdning misslyckades')
    } catch { toast.error('Uppladdning misslyckades') }
    finally { setUploading(false) }
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '36px 40px 80px', width: '100%' }}>

      {/* ── Back ───────────────────────────────────────────────── */}
      <Button
        variant="ghost"
        className="gap-2 -ml-2 mb-4"
        style={{ color: 'var(--ink-60)', fontFamily: 'var(--font-sans)', fontSize: 13 }}
        onClick={() => navigate(isEdit ? `/recipes/${id}` : '/')}
      >
        <ArrowLeft size={14} strokeWidth={1.5} /> Avbryt
      </Button>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header style={{ marginBottom: 36 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', color: 'var(--2eat-accent-deep)', textTransform: 'uppercase' }}>
          {isEdit ? 'Redigera recept' : 'Skapa nytt · Steg 1 av 3'}
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(38px, 5vw, 56px)', letterSpacing: '-0.035em', lineHeight: 0.95, margin: '8px 0 0', fontWeight: 400 }}>
          {isEdit ? existing?.name ?? 'Redigera recept' : 'Lägg till recept'}
        </h1>
      </header>

      {/* ── Basic info ─────────────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 36 }}>
        <Field label="Receptnamn" span={4}>
          <Input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="t.ex. Mormors köttbullar"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 26, padding: '14px 18px', letterSpacing: '-0.02em', height: 'auto' }}
          />
        </Field>
        <Field label="Kort beskrivning" hint="Visas på receptkortet — håll det kort och aptitligt." span={4}>
          <Textarea
            value={description} onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="En liten mening om rätten…"
          />
        </Field>
        <Field label="Portioner">
          <Input type="number" value={servings} onChange={e => setServings(+e.target.value)} />
        </Field>
        <Field label="Betyg (1–5)">
          <Input type="number" min={1} max={5} value={rating} onChange={e => setRating(+e.target.value)} />
        </Field>
        <Field label="Förb. (min)">
          <Input type="number" value={prepTime} onChange={e => setPrepTime(+e.target.value)} />
        </Field>
        <Field label="Tillagn. (min)">
          <Input type="number" value={cookTime} onChange={e => setCookTime(+e.target.value)} />
        </Field>
        <Field label="Bild" span={4}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="button"
              variant="outline"
              className="rounded-full gap-2"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}
            >
              <Upload size={14} /> {uploading ? 'Laddar upp…' : 'Ladda upp bild'}
            </Button>
            {imageUrl && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', letterSpacing: '0.06em' }}>{imageUrl}</span>}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>
        </Field>
      </section>

      <Separator style={{ background: 'var(--line)', marginBottom: 36 }} />

      {/* ── Ingredients ────────────────────────────────────────── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.025em', margin: 0, fontWeight: 400 }}>Ingredienser</h2>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full gap-1.5 text-xs"
            style={{ fontFamily: 'var(--font-sans)' }}
            onClick={() => setRows(arr => [...arr, newRow(arr.length + 1)])}
          >
            <Plus size={12} /> Lägg till rad
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map((row, i) => (
            <div key={row.key} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 100px 120px 36px', gap: 10, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', textAlign: 'center' }}>{String(i + 1).padStart(2, '0')}</span>
              <Input
                placeholder="Ingrediens (t.ex. Vetemjöl)"
                value={row.name}
                onChange={e => setRows(arr => arr.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
              />
              <Input
                type="number" placeholder="Mängd" value={row.quantity || ''}
                onChange={e => setRows(arr => arr.map((x, j) => j === i ? { ...x, quantity: +e.target.value } : x))}
                style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}
              />
              <Select value={row.unit} onValueChange={v => setRows(arr => arr.map((x, j) => j === i ? { ...x, unit: v as UnitOfMeasurement } : x))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg shrink-0"
                style={{ color: 'var(--ink-50)' }}
                onClick={() => setRows(arr => arr.filter((_, j) => j !== i))}
              ><Trash2 size={14} strokeWidth={1.5} /></Button>
            </div>
          ))}
        </div>
      </section>

      <Separator style={{ background: 'var(--line)', marginBottom: 36 }} />

      {/* ── Steps ──────────────────────────────────────────────── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.025em', margin: 0, fontWeight: 400 }}>Tillagning</h2>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full gap-1.5 text-xs"
            style={{ fontFamily: 'var(--font-sans)' }}
            onClick={() => setSteps(arr => [...arr, ''])}
          >
            <Plus size={12} /> Nytt steg
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 32, lineHeight: 1, fontStyle: 'italic', color: 'var(--2eat-accent-deep)', textAlign: 'right', paddingTop: 8, letterSpacing: '-0.03em' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <Textarea
                rows={2}
                placeholder="Beskriv steget…"
                value={step}
                onChange={e => setSteps(arr => arr.map((s, j) => j === i ? e.target.value : s))}
                style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.5, resize: 'vertical' }}
              />
            </div>
          ))}
        </div>
        {/* Also allow free-text fallback if no steps */}
        {steps.length === 0 && (
          <Textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="Instruktioner steg för steg…"
            rows={6}
            style={{ resize: 'vertical', marginTop: 8 }}
          />
        )}
      </section>

      <Separator style={{ background: 'var(--line)', marginBottom: 36 }} />

      {/* ── Allergens ──────────────────────────────────────────── */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.025em', margin: '0 0 14px', fontWeight: 400 }}>Märkningar</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ALLERGEN_OPTIONS.map(a => {
            const active = allergens.includes(a)
            return (
              <Button
                key={a}
                variant="outline"
                className="rounded-full gap-1.5"
                onClick={() => setAllergens(arr => active ? arr.filter(x => x !== a) : [...arr, a])}
                style={{
                  borderColor: active ? 'var(--2eat-accent)' : 'var(--ink-30)',
                  background: active ? 'color-mix(in oklch, var(--2eat-accent) 15%, transparent)' : 'transparent',
                  color: active ? 'var(--2eat-accent-deep)' : 'var(--ink-60)',
                  fontFamily: 'var(--font-sans)', fontSize: 13,
                }}
              >
                {active && <Check size={12} strokeWidth={2} />}
                {a}
              </Button>
            )
          })}
        </div>
      </section>

      {/* ── Footer actions ─────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, padding: '20px 0', borderTop: '1px solid var(--line)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Sparas automatiskt
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="outline"
            className="rounded-full"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}
            onClick={() => navigate(isEdit ? `/recipes/${id}` : '/')}
          >
            Avbryt
          </Button>
          <Button
            className="rounded-full gap-2"
            style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', fontFamily: 'var(--font-sans)', fontSize: 13, border: 'none' }}
            disabled={saveMutation.isPending || !name.trim()}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? 'Sparar…' : <><Check size={14} /> Spara recept</>}
          </Button>
        </div>
      </div>
    </div>
  )
}
