import { useState, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { getRecipeById, createRecipe, updateRecipe, uploadFile } from '@/lib/api'
import type { RecipeIngredient, UnitOfMeasurement } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const UNITS: UnitOfMeasurement[] = ['g', 'ml', 'kg', 'krm', 'tsk', 'msk', 'dl', 'l', 'kaffemått', 'st']

type IngredientRow = {
  key: string
  name: string
  quantity: number
  unit: UnitOfMeasurement
  order: number
}

function newRow(order: number): IngredientRow {
  return { key: crypto.randomUUID(), name: '', quantity: 0, unit: 'g', order }
}

export function RecipeFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: existing } = useQuery({
    queryKey: ['recipes', Number(id)],
    queryFn: () => getRecipeById(Number(id)),
    enabled: isEdit,
  })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [instructions, setInstructions] = useState('')
  const [servings, setServings] = useState(4)
  const [rating, setRating] = useState(3)
  const [prepTime, setPrepTime] = useState(15)
  const [cookTime, setCookTime] = useState(30)
  const [imageUrl, setImageUrl] = useState<string | undefined>()
  const [rows, setRows] = useState<IngredientRow[]>([newRow(1)])
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
    setRows(
      sorted.length > 0
        ? sorted.map((ri: RecipeIngredient) => ({
            key: String(ri.id),
            name: ri.ingredient?.name ?? '',
            quantity: ri.ingredientMeasurement?.quantity ?? 0,
            unit: ri.ingredientMeasurement?.unit ?? 'g',
            order: ri.order,
          }))
        : [newRow(1)],
    )
    setInitialized(true)
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name,
        description,
        instructions,
        servings,
        rating,
        prepTime,
        cookTime,
        imageUrl,
        ingredients: rows
          .filter((r) => r.name.trim())
          .map((r, i) => ({
            order: i + 1,
            ingredient: { name: r.name },
            ingredientMeasurement: { quantity: r.quantity, unit: r.unit },
          })),
      }
      return isEdit ? updateRecipe(Number(id), payload) : createRecipe(payload)
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success(isEdit ? 'Recipe updated' : 'Recipe created')
      navigate(`/recipes/${saved.id}`)
    },
    onError: () => toast.error('Failed to save recipe'),
  })

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const upload = await uploadFile(file)
      if (upload.isSuccess) setImageUrl(upload.storedFileName)
      else toast.error('Upload failed')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function updateRow(key: string, patch: Partial<IngredientRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function addRow() {
    setRows((prev) => [...prev, newRow(prev.length + 1)])
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key))
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={isEdit ? `/recipes/${id}` : '/'}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Recipe' : 'New Recipe'}</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Recipe name" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="servings">Servings</Label>
            <Input
              id="servings"
              type="number"
              min={1}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rating">Rating (1–5)</Label>
            <Input
              id="rating"
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prepTime">Prep (min)</Label>
            <Input
              id="prepTime"
              type="number"
              min={0}
              value={prepTime}
              onChange={(e) => setPrepTime(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cookTime">Cook (min)</Label>
            <Input
              id="cookTime"
              type="number"
              min={0}
              value={cookTime}
              onChange={(e) => setCookTime(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Image</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading…' : 'Upload image'}
            </Button>
            {imageUrl && <span className="text-sm text-muted-foreground">{imageUrl}</span>}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label>Ingredients</Label>
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          {rows.map((row) => (
            <div key={row.key} className="flex items-center gap-2">
              <Input
                placeholder="Ingredient name"
                className="flex-1"
                value={row.name}
                onChange={(e) => updateRow(row.key, { name: e.target.value })}
              />
              <Input
                type="number"
                min={0}
                className="w-20"
                value={row.quantity}
                onChange={(e) => updateRow(row.key, { quantity: Number(e.target.value) })}
              />
              <Select value={row.unit} onValueChange={(v) => updateRow(row.key, { unit: v as UnitOfMeasurement })}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => removeRow(row.key)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <Separator />

        <div className="grid gap-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Step-by-step instructions…"
            rows={8}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link to={isEdit ? `/recipes/${id}` : '/'}>Cancel</Link>
          </Button>
          <Button disabled={saveMutation.isPending || !name.trim()} onClick={() => saveMutation.mutate()}>
            {saveMutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create recipe'}
          </Button>
        </div>
      </div>
    </div>
  )
}
