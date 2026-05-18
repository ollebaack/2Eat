import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, useBlocker } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getRecipeById, createRecipe, updateRecipe, uploadFile, getCategories, ALLERGEN_OPTIONS } from '@/lib/api'
import type { AllergenId, RecipeIngredient, ScannedRecipe, UnitOfMeasurement } from '@/types'
import { ScanRecipeDialog } from '@/components/ScanRecipeDialog'
import { PhotoSlot } from '@/components/PhotoSlot'
import { StarPicker } from '@/components/StarPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

const UNITS: UnitOfMeasurement[] = [
  'g', 'ml', 'kg', 'krm', 'tsk', 'msk', 'dl', 'l', 'kaffemått', 'st',
  'cup', 'fl oz', 'oz', 'lbs', 'cl', 'pinch', 'tsp', 'tbsp',
]

type IngredientRow = { key: string; name: string; quantity: number; unit: UnitOfMeasurement; order: number }
function newRow(order: number): IngredientRow { return { key: crypto.randomUUID(), name: '', quantity: 0, unit: 'g', order } }

const fieldLabel = 'font-mono text-[10.5px] tracking-[0.12em] uppercase text-[var(--ink-50)]'

export function RecipeFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: existing } = useQuery({ queryKey: ['recipes', Number(id)], queryFn: () => getRecipeById(Number(id)), enabled: isEdit })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

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
  const [calories, setCalories] = useState<number | undefined>()
  const [protein, setProtein] = useState<number | undefined>()
  const [fat, setFat] = useState<number | undefined>()
  const [carbs, setCarbs] = useState<number | undefined>()
  const [initialized, setInitialized] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | undefined>()
  const [scanOpen, setScanOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

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
    setAllergens((existing.allergens ?? []).map(a => a.id))
    if (existing.calories != null) setCalories(existing.calories)
    if (existing.protein != null) setProtein(existing.protein)
    if (existing.fat != null) setFat(existing.fat)
    if (existing.carbs != null) setCarbs(existing.carbs)
    setInitialized(true)
  }

  // Browser beforeunload — warns when closing tab / refreshing with unsaved changes
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // React Router in-app navigation blocker
  const blocker = useBlocker(isDirty)

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name, description, difficulty,
        ...(categoryId !== undefined ? { categoryId } : {}),
        instructions: steps.filter(s => s.trim()).map((s, i) => `${i + 1}. ${s}`).join('\n') || instructions,
        servings, rating, prepTime, cookTime, imageUrl,
        calories: calories ?? null,
        protein: protein ?? null,
        fat: fat ?? null,
        carbs: carbs ?? null,
        allergens: allergens.map(id => ({ id })),
        ingredients: rows.filter(r => r.name.trim()).map((r, i) => ({
          order: i + 1,
          ingredient: { name: r.name },
          ingredientMeasurement: { quantity: r.quantity, unit: r.unit },
        })),
      }
      return isEdit ? updateRecipe(Number(id), payload) : createRecipe(payload)
    },
    onSuccess: saved => {
      setIsDirty(false)
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success(isEdit ? 'Recept uppdaterat' : 'Recept skapat')
      navigate(`/recipes/${saved.id}`)
    },
    onError: () => toast.error('Kunde inte spara receptet'),
  })

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setLocalPreview(preview)
    setUploading(true)
    setIsDirty(true)
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
    if (data.categoryName) {
      const match = categories.find(c => c.name === data.categoryName)
      if (match) setCategoryId(match.id)
    }
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
    if (data.calories != null) setCalories(data.calories)
    if (data.protein != null) setProtein(data.protein)
    if (data.fat != null) setFat(data.fat)
    if (data.carbs != null) setCarbs(data.carbs)
    if (data.allergens?.length) setAllergens(data.allergens.filter(a => ALLERGEN_OPTIONS.includes(a as AllergenId)))
    setIsDirty(true)
    toast.success('Recept skannat — granska och spara')
  }

  const saveDisabled = saveMutation.isPending || !name.trim()

  // Helper wrappers to mark form as dirty on change
  function markDirty<T>(setter: React.Dispatch<React.SetStateAction<T>>) {
    return (value: React.SetStateAction<T>) => {
      setter(value)
      setIsDirty(true)
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '36px 40px 80px', width: '100%' }}>

      {/* Unsaved-changes confirmation dialog (React Router blocker) */}
      <AlertDialog open={blocker.state === 'blocked'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Osparade ändringar</AlertDialogTitle>
            <AlertDialogDescription>
              Du har osparade ändringar. Vill du lämna sidan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>Nej, stanna kvar</AlertDialogCancel>
            <AlertDialogAction onClick={() => blocker.proceed?.()}>Ja, lämna</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate(isEdit ? `/recipes/${id}` : '/')}
        className="mb-[18px] px-0 text-[13px] text-[var(--ink-60)]"
      >
        ← Avbryt
      </Button>

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
        <Button
          type="button"
          variant="outline"
          className="rounded-full mt-2 shrink-0 text-[13px]"
          onClick={() => setScanOpen(true)}
        >
          ⌁ Skanna recept
        </Button>
      </header>

      <ScanRecipeDialog open={scanOpen} onOpenChange={setScanOpen} onApply={applyScannedRecipe} />

      {/* Metadata grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 36 }}>

        {/* Recipe name — spans all 4 columns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 4' }}>
          <Label className={fieldLabel}>
            Receptnamn <span style={{ color: 'var(--2eat-accent)', marginLeft: 1 }}>*</span>
          </Label>
          <Input
            value={name}
            onChange={e => markDirty(setName)(e.target.value)}
            placeholder="t.ex. Mormors köttbullar"
            className="font-serif text-[26px] tracking-[-0.02em] h-auto px-[18px] py-[14px]"
          />
        </div>

        {/* Description — spans 4 cols */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 4' }}>
          <Label className={fieldLabel}>Kort beskrivning</Label>
          <Textarea
            value={description}
            onChange={e => markDirty(setDescription)(e.target.value)}
            rows={2}
            placeholder="En liten mening om rätten…"
            className="resize-y"
          />
        </div>

        {/* Category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Label className={fieldLabel}>Kategori</Label>
          <Select value={String(categoryId ?? '')} onValueChange={v => { setCategoryId(v ? Number(v) : undefined); setIsDirty(true) }}>
            <SelectTrigger>
              <SelectValue placeholder="Välj kategori…" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Portioner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Label className={fieldLabel}>Portioner</Label>
          <Input type="number" value={servings} onChange={e => markDirty(setServings)(Number(e.target.value))} />
        </div>

        {/* Förberedelsetid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Label className={fieldLabel}>Förberedelsetid (min)</Label>
          <Input type="number" value={prepTime} onChange={e => markDirty(setPrepTime)(Number(e.target.value))} />
        </div>

        {/* Tillagningstid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Label className={fieldLabel}>Tillagningstid (min)</Label>
          <Input type="number" value={cookTime} onChange={e => markDirty(setCookTime)(Number(e.target.value))} />
        </div>

        {/* Difficulty */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Label className={fieldLabel}>Svårighet</Label>
          <Select value={difficulty} onValueChange={v => { setDifficulty(v); setIsDirty(true) }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lätt">Lätt</SelectItem>
              <SelectItem value="Medel">Medel</SelectItem>
              <SelectItem value="Svår">Svår</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rating */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Label className={fieldLabel}>Betyg</Label>
          <div style={{ padding: '8px 10px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10 }}>
            <StarPicker value={rating} onChange={v => markDirty(setRating)(v)} />
          </div>
        </div>

        {/* Image upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 4' }}>
          <Label className={fieldLabel}>Bild</Label>
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
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full text-white border-0"
                    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
                    onClick={() => fileRef.current?.click()}
                  >
                    Byt bild
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full text-white border-0"
                    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
                    onClick={() => { setImageUrl(undefined); setIsDirty(true) }}
                  >
                    Ta bort
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="rounded-full text-[13px] self-start"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              ↑ Ladda upp bild
            </Button>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
      </section>

      {/* Ingredients editor */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.025em', margin: 0, fontWeight: 400, color: 'var(--ink)' }}>Ingredienser</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setRows(arr => [...arr, newRow(arr.length + 1)]); setIsDirty(true) }}
          >
            + Lägg till rad
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map((row, i) => (
            <div key={row.key} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 100px 100px 36px', gap: 10, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', textAlign: 'center' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <Input
                placeholder="Ingrediens (t.ex. Vetemjöl)"
                value={row.name}
                aria-label={`Ingrediens rad ${i + 1}`}
                onChange={e => { setRows(arr => arr.map((x, j) => j === i ? { ...x, name: e.target.value } : x)); setIsDirty(true) }}
              />
              <Input
                type="number"
                placeholder="Mängd"
                value={row.quantity || ''}
                aria-label={`Mängd rad ${i + 1}`}
                onChange={e => { setRows(arr => arr.map((x, j) => j === i ? { ...x, quantity: +e.target.value } : x)); setIsDirty(true) }}
                className="font-mono text-right"
              />
              <Select
                value={row.unit}
                onValueChange={v => { setRows(arr => arr.map((x, j) => j === i ? { ...x, unit: v as UnitOfMeasurement } : x)); setIsDirty(true) }}
              >
                <SelectTrigger className="h-8 text-xs w-full font-mono" aria-label={`Enhet rad ${i + 1}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={`Ta bort ingrediens rad ${i + 1}`}
                onClick={() => { setRows(arr => arr.filter((_, j) => j !== i)); setIsDirty(true) }}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Steps editor */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.025em', margin: 0, fontWeight: 400, color: 'var(--ink)' }}>Tillagning</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSteps(arr => [...arr, '']); setIsDirty(true) }}
          >
            + Lägg till steg
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
                aria-label={`Steg ${i + 1}`}
                onChange={e => { setSteps(arr => arr.map((s, j) => j === i ? e.target.value : s)); setIsDirty(true) }}
                className="resize-y font-serif text-base leading-[1.5]"
              />
            </div>
          ))}
        </div>
        {steps.length === 0 && (
          <Textarea
            value={instructions}
            onChange={e => markDirty(setInstructions)(e.target.value)}
            placeholder="Instruktioner steg för steg…"
            aria-label="Instruktioner"
            rows={6}
            className="resize-y mt-2"
          />
        )}
      </section>

      {/* Allergen section */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.025em', margin: '0 0 14px', fontWeight: 400, color: 'var(--ink)' }}>Märkningar</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ALLERGEN_OPTIONS.map(a => (
            <Button
              key={a}
              variant={allergens.includes(a) ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
              onClick={() => { setAllergens(arr => arr.includes(a) ? arr.filter(x => x !== a) : [...arr, a]); setIsDirty(true) }}
            >
              {a}
            </Button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14, padding: '20px 0', borderTop: '1px solid var(--line)' }}>
        {!name.trim() && !saveMutation.isPending && (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-50)' }}>
            Ange ett receptnamn för att spara
          </span>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="outline"
            className="rounded-full text-[13px]"
            onClick={() => navigate(isEdit ? `/recipes/${id}` : '/')}
          >
            Avbryt
          </Button>
          <Button
            className="rounded-full text-[13px]"
            disabled={saveDisabled}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? 'Sparar…' : (isEdit ? 'Spara ändringar' : 'Spara recept') + ' ✓'}
          </Button>
        </div>
      </div>
    </div>
  )
}
