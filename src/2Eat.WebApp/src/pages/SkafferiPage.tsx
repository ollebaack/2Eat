import { useState, useMemo, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Leaf, Sparkles, Clock, Search, Plus, Pencil, Trash2, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  getPantryItems,
  createPantryItem,
  updatePantryItem,
  deletePantryItem,
  getRecipes,
  scanReceipt,
  seedStarterItems,
  parseTextToPantryItems,
  getShoppingList,
  addShoppingListItem,
  type ScannedItem,
} from '@/lib/api'
import { Textarea } from '@/components/ui/textarea'
import { recipeSwatch } from '@/lib/recipeUtils'
import type { PantryItem, Recipe, RecipeIngredient } from '@/types'
import { AuthImg } from '@/components/AuthImg'

const PANTRY_CATEGORIES = ['Skafferi', 'Kyl', 'Frys', 'Grönsaker', 'Krydda', 'Mejeri', 'Frukt']
const FILTER_CATEGORIES = ['Alla', ...PANTRY_CATEGORIES]

type Tab = 'items' | 'suggestions' | 'expiring'

function daysUntil(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exp = new Date(expiresAt)
  return Math.round((exp.getTime() - today.getTime()) / 86400000)
}

function todayStr(): string {
  const d = new Date()
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })
}

// ── Add / Edit Modal ────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: '',
  category: PANTRY_CATEGORIES[0],
  quantity: 1,
  unit: 'st',
  expiresAt: '',
  isOpened: false,
  isLow: false,
}

type FormState = typeof EMPTY_FORM

function itemToForm(item: PantryItem): FormState {
  return {
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    expiresAt: item.expiresAt ? item.expiresAt.split('T')[0] : '',
    isOpened: item.isOpened,
    isLow: item.isLow,
  }
}

interface ItemFormModalProps {
  open: boolean
  editItem?: PantryItem | null
  onClose: () => void
  onSave: (form: FormState, id?: number) => void
  isPending: boolean
}

// The `key` prop on this component (set to `editItem?.id ?? 'new'` at the
// call-site) remounts it whenever a different item is selected, giving a clean
// initial state without useEffect or render-phase mutations.
function ItemFormModal({ open, editItem, onClose, onSave, isPending }: ItemFormModalProps) {
  const [form, setForm] = useState<FormState>(() =>
    editItem ? itemToForm(editItem) : { ...EMPTY_FORM },
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form, editItem?.id)
  }

  const isEdit = editItem != null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent style={{ maxWidth: 480 }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>
            {isEdit ? 'Redigera vara' : 'Lägg till i skafferiet'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="item-name">Namn</Label>
            <Input
              id="item-name"
              placeholder="t.ex. Mjölk"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label>Kategori</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PANTRY_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="item-qty">Antal</Label>
              <Input
                id="item-qty"
                type="number"
                min={0}
                step={0.1}
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="item-unit">Enhet</Label>
              <Input
                id="item-unit"
                placeholder="t.ex. l, g, st"
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="item-exp">Bäst-före (valfritt)</Label>
            <Input
              id="item-exp"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input
                type="checkbox"
                checked={form.isOpened}
                onChange={(e) => setForm((f) => ({ ...f, isOpened: e.target.checked }))}
              />
              Öppnad
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input
                type="checkbox"
                checked={form.isLow}
                onChange={(e) => setForm((f) => ({ ...f, isLow: e.target.checked }))}
              />
              Låg nivå
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button type="submit" disabled={isPending || !form.name.trim()}>
              {isPending ? 'Sparar…' : isEdit ? 'Spara' : 'Lägg till'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Receipt Scan Modal ─────────────────────────────────────────────────────

interface ReceiptScanModalProps {
  open: boolean
  onClose: () => void
  onItemsAdded: () => void
}

type ScanStep = 'upload' | 'review'

function ReceiptScanModal({ open, onClose, onItemsAdded }: ReceiptScanModalProps) {
  const [step, setStep] = useState<ScanStep>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([])
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [isScanning, setIsScanning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleScan() {
    if (!selectedFile) return
    setIsScanning(true)
    try {
      const items = await scanReceipt(selectedFile)
      setScannedItems(items)
      setCheckedIds(new Set(items.map((_, i) => i)))
      setStep('review')
    } catch {
      toast.error('Kunde inte läsa kvittot')
    } finally {
      setIsScanning(false)
    }
  }

  async function handleConfirm() {
    setIsSaving(true)
    try {
      const selected = scannedItems.filter((_, i) => checkedIds.has(i))
      await Promise.all(
        selected.map((item) =>
          createPantryItem({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            expiresAt: null,
            isOpened: false,
            isLow: false,
          })
        )
      )
      toast.success(`${selected.length} varor tillagda`)
      onItemsAdded()
      handleClose()
    } catch {
      toast.error('Kunde inte lägga till varor')
    } finally {
      setIsSaving(false)
    }
  }

  function handleClose() {
    setStep('upload')
    setSelectedFile(null)
    setPreviewUrl(null)
    setScannedItems([])
    setCheckedIds(new Set())
    setIsScanning(false)
    setIsSaving(false)
    onClose()
  }

  function toggleItem(i: number) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent style={{ maxWidth: 480 }}>
        <DialogHeader>
          <DialogTitle>Skanna kvitto</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {previewUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <img
                  src={previewUrl}
                  alt="Kvitto"
                  style={{ maxHeight: 220, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{ fontSize: 13, color: 'var(--ink-60)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Välj annan bild
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '32px 16px',
                  border: '2px dashed var(--line)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  color: 'var(--ink-60)',
                  fontSize: 14,
                }}
              >
                <span style={{ fontSize: 28 }}>📷</span>
                <span>Ta foto eller välj bild</span>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Avbryt</Button>
              <Button onClick={handleScan} disabled={!selectedFile || isScanning}>
                {isScanning ? 'Analyserar…' : 'Analysera kvitto'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {scannedItems.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--ink-60)', textAlign: 'center', padding: '16px 0' }}>
                Inga varor hittades på kvittot.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
                {scannedItems.map((item, i) => (
                  <label
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--line)',
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checkedIds.has(i)}
                      onChange={() => toggleItem(i)}
                    />
                    <span style={{ flex: 1 }}>{item.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-60)', whiteSpace: 'nowrap' }}>
                      {item.quantity} {item.unit}
                    </span>
                    <span style={{
                      fontSize: 11,
                      background: 'var(--ink)',
                      color: 'var(--paper)',
                      padding: '2px 7px',
                      borderRadius: 99,
                      whiteSpace: 'nowrap',
                    }}>
                      {item.category}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Avbryt</Button>
              <Button onClick={handleConfirm} disabled={checkedIds.size === 0 || isSaving}>
                {isSaving ? 'Sparar…' : `Lägg till ${checkedIds.size} varor`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Shared review step used by text-parse and handlista-import modals ──────

interface ReviewStepProps {
  items: ScannedItem[]
  checkedIds: Set<number>
  onToggle: (i: number) => void
  onConfirm: () => void
  onCancel: () => void
  isSaving: boolean
}

function ReviewStep({ items, checkedIds, onToggle, onConfirm, onCancel, isSaving }: ReviewStepProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.length === 0 ? (
        <p style={{ fontSize: 14, color: 'var(--ink-60)', textAlign: 'center', padding: '16px 0' }}>
          Inga varor hittades.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
          {items.map((item, i) => (
            <label
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid var(--line)',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              <input type="checkbox" checked={checkedIds.has(i)} onChange={() => onToggle(i)} />
              <span style={{ flex: 1 }}>{item.name}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-60)', whiteSpace: 'nowrap' }}>
                {item.quantity} {item.unit}
              </span>
              <span style={{
                fontSize: 11,
                background: 'var(--ink)',
                color: 'var(--paper)',
                padding: '2px 7px',
                borderRadius: 99,
                whiteSpace: 'nowrap',
              }}>
                {item.category}
              </span>
            </label>
          ))}
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Avbryt</Button>
        <Button onClick={onConfirm} disabled={checkedIds.size === 0 || isSaving}>
          {isSaving ? 'Sparar…' : `Lägg till ${checkedIds.size} varor`}
        </Button>
      </DialogFooter>
    </div>
  )
}

// ── Text Parse Modal ────────────────────────────────────────────────────────

interface TextParseModalProps {
  open: boolean
  onClose: () => void
  onItemsAdded: () => void
}

type TextParseStep = 'input' | 'parsing' | 'review'

function TextParseModal({ open, onClose, onItemsAdded }: TextParseModalProps) {
  const [step, setStep] = useState<TextParseStep>('input')
  const [text, setText] = useState('')
  const [items, setItems] = useState<ScannedItem[]>([])
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [isSaving, setIsSaving] = useState(false)

  function handleClose() {
    setStep('input')
    setText('')
    setItems([])
    setCheckedIds(new Set())
    setIsSaving(false)
    onClose()
  }

  async function handleParse() {
    if (!text.trim()) return
    setStep('parsing')
    try {
      const parsed = await parseTextToPantryItems(text.trim())
      setItems(parsed)
      setCheckedIds(new Set(parsed.map((_, i) => i)))
      setStep('review')
    } catch {
      toast.error('Kunde inte tolka texten')
      setStep('input')
    }
  }

  async function handleConfirm() {
    setIsSaving(true)
    try {
      const selected = items.filter((_, i) => checkedIds.has(i))
      await Promise.all(
        selected.map((item) =>
          createPantryItem({ name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, expiresAt: null, isOpened: false, isLow: false })
        )
      )
      toast.success(`${selected.length} varor tillagda`)
      onItemsAdded()
      handleClose()
    } catch {
      toast.error('Kunde inte lägga till varor')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent style={{ maxWidth: 480 }}>
        <DialogHeader>
          <DialogTitle>Skriv vad du har hemma</DialogTitle>
        </DialogHeader>

        {(step === 'input' || step === 'parsing') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13.5, color: 'var(--ink-60)', margin: 0 }}>
              Skriv en lista på det du har hemma, separerat med komma eller radbrytning.
            </p>
            <Textarea
              placeholder="t.ex. mjölk, ägg, pasta, ris, smör, lök…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
            />
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Avbryt</Button>
              <Button onClick={handleParse} disabled={!text.trim() || step === 'parsing'}>
                {step === 'parsing' ? 'Analyserar…' : 'Fortsätt'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'review' && (
          <ReviewStep
            items={items}
            checkedIds={checkedIds}
            onToggle={(i) => setCheckedIds((prev) => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n })}
            onConfirm={handleConfirm}
            onCancel={handleClose}
            isSaving={isSaving}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Handlista Import Modal ──────────────────────────────────────────────────

interface HandlistaImportModalProps {
  open: boolean
  onClose: () => void
  onItemsAdded: () => void
}

type HandlistaStep = 'loading' | 'review' | 'empty'

function HandlistaImportModal({ open, onClose, onItemsAdded }: HandlistaImportModalProps) {
  const [step, setStep] = useState<HandlistaStep>('loading')
  const [items, setItems] = useState<ScannedItem[]>([])
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [isSaving, setIsSaving] = useState(false)

  // Fetch and parse whenever the modal opens
  const prevOpen = useRef(false)
  useEffect(() => {
    if (open && !prevOpen.current) {
      setStep('loading')
      setItems([])
      setCheckedIds(new Set())
      ;(async () => {
        try {
          const list = await getShoppingList()
          if (list.length === 0) { setStep('empty'); return }
          const text = list.map((i) => i.name).join(', ')
          const parsed = await parseTextToPantryItems(text)
          setItems(parsed)
          setCheckedIds(new Set(parsed.map((_, i) => i)))
          setStep('review')
        } catch {
          toast.error('Kunde inte hämta Handlistan')
          onClose()
        }
      })()
    }
    prevOpen.current = open
  }, [open, onClose])

  function handleClose() {
    setStep('loading')
    setItems([])
    setCheckedIds(new Set())
    setIsSaving(false)
    onClose()
  }

  async function handleConfirm() {
    setIsSaving(true)
    try {
      const selected = items.filter((_, i) => checkedIds.has(i))
      await Promise.all(
        selected.map((item) =>
          createPantryItem({ name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, expiresAt: null, isOpened: false, isLow: false })
        )
      )
      toast.success(`${selected.length} varor tillagda`)
      onItemsAdded()
      handleClose()
    } catch {
      toast.error('Kunde inte lägga till varor')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent style={{ maxWidth: 480 }}>
        <DialogHeader>
          <DialogTitle>Importera från Handlistan</DialogTitle>
        </DialogHeader>

        {step === 'loading' && (
          <p style={{ fontSize: 14, color: 'var(--ink-60)', textAlign: 'center', padding: '24px 0' }}>
            Hämtar varor…
          </p>
        )}

        {step === 'empty' && (
          <>
            <p style={{ fontSize: 14, color: 'var(--ink-60)', textAlign: 'center', padding: '16px 0' }}>
              Handlistan är tom.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Stäng</Button>
            </DialogFooter>
          </>
        )}

        {step === 'review' && (
          <ReviewStep
            items={items}
            checkedIds={checkedIds}
            onToggle={(i) => setCheckedIds((prev) => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n })}
            onConfirm={handleConfirm}
            onCancel={handleClose}
            isSaving={isSaving}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Stat Tab Card ──────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: number | string
  subtitle: string
  icon: React.ReactNode
  active: boolean
  tab: Tab
  onClick: (t: Tab) => void
  activeStyle: React.CSSProperties
}

function StatCard({ label, value, subtitle, icon, active, tab, onClick, activeStyle }: StatCardProps) {
  const baseStyle: React.CSSProperties = {
    padding: '20px 22px',
    borderRadius: 18,
    border: `1px solid ${active ? 'transparent' : 'var(--line)'}`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    textAlign: 'left',
    transition: 'all 0.15s ease',
    ...(active ? activeStyle : { background: 'var(--paper)' }),
  }

  return (
    <button style={baseStyle} onClick={() => onClick(tab)}>
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          opacity: 0.7,
          marginBottom: 4,
          color: active ? 'inherit' : 'var(--ink-50)',
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 44,
          lineHeight: 1,
          marginBottom: 4,
        }}>
          {value}
        </div>
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 12.5,
          opacity: 0.7,
        }}>
          {subtitle}
        </div>
      </div>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: 'var(--surface-1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        opacity: 0.8,
      }}>
        {icon}
      </div>
    </button>
  )
}

// ── Pantry Item Card ────────────────────────────────────────────────────────

interface PantryItemCardProps {
  item: PantryItem
  onDelete: (id: number) => void
  onEdit: (item: PantryItem) => void
}

function PantryItemCard({ item, onDelete, onEdit }: PantryItemCardProps) {
  const days = daysUntil(item.expiresAt)
  const expSoon = days !== null && days <= 3

  let daysText = ''
  if (days !== null) {
    if (days < 0) daysText = 'utgånget'
    else if (days === 0) daysText = 'idag'
    else if (days === 1) daysText = '1 dag'
    else daysText = `${days} dagar`
  }

  const expiryColor = expSoon
    ? 'oklch(0.5 0.15 30)'
    : days !== null && days <= 7
    ? 'oklch(0.5 0.13 60)'
    : 'var(--ink-50)'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '40px 1fr auto',
      gap: 10,
      alignItems: 'center',
      padding: '12px 14px',
      background: 'var(--paper)',
      border: '1px solid var(--line)',
      borderRadius: 12,
    }}>
      {/* Icon */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: expSoon
          ? 'color-mix(in oklch, oklch(0.7 0.14 30) 18%, var(--surface-2))'
          : 'var(--surface-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: 16,
        color: expSoon ? 'oklch(0.5 0.15 30)' : 'var(--ink-60)',
        flexShrink: 0,
      }}>
        {item.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13.5,
            fontWeight: 500,
            color: 'var(--ink)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {item.name}
          </span>
          {item.isOpened && (
            <span style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: 'var(--ink-30)',
              flexShrink: 0,
            }} />
          )}
          {item.isLow && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'oklch(0.5 0.15 30)',
              border: '1px solid oklch(0.7 0.14 30)',
              borderRadius: 4,
              padding: '0 4px',
              flexShrink: 0,
            }}>
              Låg
            </span>
          )}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          color: expiryColor,
        }}>
          {item.quantity} {item.unit}{daysText && ` · ${daysText}`}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {(
          [
            { label: 'Redigera', icon: <Pencil size={13} />, onClick: () => onEdit(item) },
            { label: 'Ta bort',  icon: <Trash2  size={13} />, onClick: () => onDelete(item.id) },
          ] as const
        ).map(({ label, icon, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ink-50)',
            }}
            aria-label={label}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Suggestions Tab ─────────────────────────────────────────────────────────

interface SuggestionEntry {
  recipe: Recipe
  have: number
  missing: RecipeIngredient[]
  ratio: number
}

interface PantryRecipeCardProps {
  entry: SuggestionEntry
  onNavigate: (id: number) => void
}

function PantryRecipeCard({ entry, onNavigate }: PantryRecipeCardProps) {
  const { recipe, have, missing, ratio } = entry
  const pct = Math.round(ratio * 100)
  const allPresent = missing.length === 0

  return (
    <article
      onClick={() => onNavigate(recipe.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-30)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'
      }}
    >
      {/* Photo */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
        {recipe.imageUrl ? (
          <AuthImg
            src={recipe.imageUrl}
            alt={recipe.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: recipeSwatch(recipe.id) }} />
        )}
        {/* Overlay pill */}
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          padding: '3px 8px',
          borderRadius: 999,
          fontSize: 10.5,
          fontFamily: 'var(--font-mono)',
          background: allPresent ? 'var(--2eat-accent)' : 'var(--paper)',
          color: allPresent ? 'white' : 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          {allPresent ? (
            <><Check size={10} /> Allt finns hemma</>
          ) : (
            `Saknas: ${missing.length}`
          )}
        </div>
        {/* Progress bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(0,0,0,0.15)' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: 'var(--2eat-accent)',
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 21, lineHeight: 1.15, color: 'var(--ink)' }}>
          {recipe.name}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-50)' }}>
          {recipe.totalTime}min · {pct}% matchar
        </div>

        {missing.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ink-50)',
              marginBottom: 6,
            }}>
              Köp till
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {missing.map((ri) => (
                <span key={ri.id} style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'var(--surface-1)',
                  border: '1px solid var(--line)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 11,
                  color: 'var(--ink-60)',
                }}>
                  {ri.ingredient.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Show have count if all present */}
        {allPresent && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            color: 'var(--2eat-accent)',
          }}>
            {have} ingredienser redo
          </div>
        )}
      </div>
    </article>
  )
}

// ── Expiring Tab ────────────────────────────────────────────────────────────

interface ExpiringRowProps {
  item: PantryItem
  recipes: Recipe[]
  onManage: (item: PantryItem) => void
  onNavigate: (id: number) => void
}

function ExpiringRow({ item, recipes, onManage, onNavigate }: ExpiringRowProps) {
  const days = daysUntil(item.expiresAt)
  if (days === null) return null
  const urgent = days <= 3
  const soonish = days <= 5

  const matchingRecipes = recipes
    .filter((r) =>
      r.ingredients.some(
        (ri) => ri.ingredient.name.toLowerCase() === item.name.toLowerCase()
      )
    )
    .slice(0, 3)

  let dayLabel = 'dagar'
  if (days === 0) dayLabel = 'idag'
  else if (days === 1) dayLabel = 'dag'

  const dayDisplay = days <= 0 ? '!' : String(days)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '64px 1fr 1.5fr auto',
      gap: 22,
      alignItems: 'center',
      padding: '14px 18px',
      background: 'var(--paper)',
      border: `1px solid ${urgent ? 'oklch(0.7 0.14 30)' : 'var(--line)'}`,
      borderLeft: `3px solid ${urgent ? 'oklch(0.6 0.16 30)' : soonish ? 'oklch(0.65 0.13 60)' : 'var(--line)'}`,
      borderRadius: 12,
    }}>
      {/* Day counter */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 36,
          lineHeight: 1,
          color: urgent ? 'oklch(0.5 0.15 30)' : 'var(--ink)',
        }}>
          {dayDisplay}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          textTransform: 'uppercase',
          color: 'var(--ink-50)',
          marginTop: 2,
        }}>
          {dayLabel}
        </div>
      </div>

      {/* Item info */}
      <div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, color: 'var(--ink)', marginBottom: 2 }}>
          {item.name}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-50)' }}>
          {item.quantity} {item.unit} · {item.category}
        </div>
      </div>

      {/* Recipe suggestions */}
      <div>
        {matchingRecipes.length > 0 && (
          <>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              textTransform: 'uppercase',
              color: 'var(--ink-50)',
              marginBottom: 6,
              letterSpacing: '0.06em',
            }}>
              Använd i
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {matchingRecipes.map((r) => (
                <button
                  key={r.id}
                  onClick={(e) => { e.stopPropagation(); onNavigate(r.id) }}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: 'var(--surface-1)',
                    border: '1px solid var(--line)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11.5,
                    color: 'var(--ink-60)',
                    cursor: 'pointer',
                  }}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Manage button */}
      <button
        onClick={() => onManage(item)}
        style={{
          padding: '6px 12px',
          borderRadius: 8,
          background: 'transparent',
          border: '1px solid var(--line)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          color: 'var(--ink-60)',
          whiteSpace: 'nowrap',
        }}
      >
        Hantera <ArrowRight size={12} />
      </button>
    </div>
  )
}

// ── Shared section header: italic serif title + divider + optional right node ──

function SectionHeader({ children, right, mb = 20 }: { children: React.ReactNode; right?: React.ReactNode; mb?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: mb }}>
      {children}
      <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      {right}
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────

export function SkafferiPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()

  const [tab, setTab] = useState<Tab>('items')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Alla')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)
  const [showTextModal, setShowTextModal] = useState(false)
  const [showHandlistaModal, setShowHandlistaModal] = useState(false)
  const [isSeedingStarter, setIsSeedingStarter] = useState(false)
  const [editItem, setEditItem] = useState<PantryItem | null>(null)
  const [isAddingLowItems, setIsAddingLowItems] = useState(false)

  const { data: pantryItems = [] } = useQuery({
    queryKey: ['pantry'],
    queryFn: getPantryItems,
  })

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: getRecipes,
  })

  const createMutation = useMutation({
    mutationFn: createPantryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] })
      toast.success('Lagt till i skafferiet')
      setShowAddModal(false)
    },
    onError: () => toast.error('Kunde inte lägga till'),
  })

  function handleItemSave(form: FormState, id?: number) {
    const payload: Omit<PantryItem, 'id'> = {
      name: form.name.trim(),
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit.trim() || 'st',
      expiresAt: form.expiresAt || null,
      isOpened: form.isOpened,
      isLow: form.isLow,
    }
    if (id != null) {
      updateMutation.mutate({ id, item: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  async function handleSeedStarter() {
    setIsSeedingStarter(true)
    try {
      const added = await seedStarterItems()
      queryClient.invalidateQueries({ queryKey: ['pantry'] })
      toast.success(`${added.length} basvaror tillagda`)
    } catch {
      toast.error('Kunde inte lägga till basvaror')
    } finally {
      setIsSeedingStarter(false)
    }
  }

  const deleteMutation = useMutation({
    mutationFn: deletePantryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] })
      toast.success('Borttagen')
    },
    onError: () => toast.error('Kunde inte ta bort'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, item }: { id: number; item: Omit<PantryItem, 'id'> }) =>
      updatePantryItem(id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] })
      toast.success('Sparat')
      setEditItem(null)
    },
    onError: () => toast.error('Kunde inte spara'),
  })

  // Precompute days-until for each item once per render (avoids N*logN repeated calls in sort)
  const daysMap = useMemo(
    () => new Map(pantryItems.map((i) => [i.id, daysUntil(i.expiresAt)])),
    [pantryItems],
  )

  const urgentCount = useMemo(
    () => pantryItems.filter((i) => { const d = daysMap.get(i.id) ?? null; return d !== null && d <= 3 }).length,
    [pantryItems, daysMap],
  )
  const lowItems = useMemo(() => pantryItems.filter((i) => i.isLow), [pantryItems])

  async function handleAddLowItemsToHandlista() {
    if (lowItems.length === 0) return
    setIsAddingLowItems(true)
    try {
      await Promise.all(
        lowItems.map((item) => addShoppingListItem(item.name, item.quantity, item.unit))
      )
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] })
      toast.success(`${lowItems.length} ${lowItems.length === 1 ? 'vara tillagd' : 'varor tillagda'} på Handlistan`)
    } catch {
      toast.error('Kunde inte lägga till på Handlistan')
    } finally {
      setIsAddingLowItems(false)
    }
  }

  // Suggestions computation — includes derived cookableNow / almostThere to avoid re-filtering on unrelated state
  const { cookableNow, almostThere } = useMemo(() => {
    const haveSet = new Set(pantryItems.map((i) => i.name.toLowerCase()))
    const all: SuggestionEntry[] = recipes
      .map((r) => {
        const have = r.ingredients.filter((i) => haveSet.has(i.ingredient.name.toLowerCase()))
        const missing = r.ingredients.filter((i) => !haveSet.has(i.ingredient.name.toLowerCase()))
        return {
          recipe: r,
          have: have.length,
          missing,
          ratio: r.ingredients.length > 0 ? have.length / r.ingredients.length : 0,
        }
      })
      .sort((a, b) => b.ratio - a.ratio)
    return {
      cookableNow: all.filter((s) => s.recipe.ingredients.length > 0 && s.missing.length === 0),
      almostThere: all.filter((s) => s.missing.length > 0 && s.missing.length <= 2),
    }
  }, [pantryItems, recipes])

  // Expiring items — use precomputed daysMap for O(n) instead of O(n log n) daysUntil calls
  const expiringItems = useMemo(
    () =>
      pantryItems
        .filter((item) => { const d = daysMap.get(item.id) ?? null; return d !== null && d <= 7 })
        .sort((a, b) => (daysMap.get(a.id) ?? 999) - (daysMap.get(b.id) ?? 999)),
    [pantryItems, daysMap],
  )

  // Filtered items for items tab
  const filtered = useMemo(() => pantryItems.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'Alla' || item.category === categoryFilter
    return matchSearch && matchCat
  }), [pantryItems, search, categoryFilter])

  // Group by category
  const grouped = useMemo(() => {
    const result = PANTRY_CATEGORIES.reduce<Record<string, PantryItem[]>>((acc, cat) => {
      const items = filtered.filter((i) => i.category === cat)
      if (items.length > 0) acc[cat] = items
      return acc
    }, {})
    const ungrouped = filtered.filter((i) => !PANTRY_CATEGORIES.includes(i.category))
    if (ungrouped.length > 0) result['Övrigt'] = ungrouped
    return result
  }, [filtered])

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '24px 16px 60px' : '36px 40px 60px', width: '100%' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 24,
        marginBottom: 36,
      }}>
        <div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--2eat-accent-deep)',
            display: 'block',
            marginBottom: 8,
          }}>
            Skafferi · senast inventerat {todayStr()}
          </span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(40px, 5.4vw, 60px)',
            letterSpacing: '-0.035em',
            lineHeight: 0.98,
            margin: '0 0 12px',
            color: 'var(--ink)',
          }}>
            Vad har jag{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--2eat-accent-deep)' }}>hemma</em>?
          </h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--ink-60)',
            margin: 0,
            maxWidth: 480,
          }}>
            Håll koll på vad som finns hemma och få förslag på vad du kan laga ikväll.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowHandlistaModal(true)}
            style={{
              padding: '9px 18px',
              borderRadius: 999,
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              fontFamily: 'var(--font-sans)',
              fontSize: 13.5,
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
          >
            Importera från Handlistan
          </button>
          <button
            onClick={() => setShowTextModal(true)}
            style={{
              padding: '9px 18px',
              borderRadius: 999,
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              fontFamily: 'var(--font-sans)',
              fontSize: 13.5,
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
          >
            Skriv vad du har
          </button>
          <button
            onClick={() => setShowScanModal(true)}
            style={{
              padding: '9px 18px',
              borderRadius: 999,
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              fontFamily: 'var(--font-sans)',
              fontSize: 13.5,
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
          >
            Skanna kvitto
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '9px 18px',
              borderRadius: 999,
              background: 'var(--ink)',
              border: '1px solid var(--ink)',
              fontFamily: 'var(--font-sans)',
              fontSize: 13.5,
              color: 'var(--paper)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Plus size={14} /> Lägg till i skafferi
          </button>
        </div>
      </div>

      {/* ── Stat/Tab Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 32,
      }}>
        <StatCard
          label="I skafferiet"
          value={pantryItems.length}
          subtitle={`${PANTRY_CATEGORIES.length} kategorier`}
          icon={<Leaf size={20} />}
          active={tab === 'items'}
          tab="items"
          onClick={setTab}
          activeStyle={{ background: 'var(--ink)', color: 'var(--paper)' }}
        />
        <StatCard
          label="Klart att laga"
          value={cookableNow.length}
          subtitle={`${almostThere.length} nästan`}
          icon={<Sparkles size={20} />}
          active={tab === 'suggestions'}
          tab="suggestions"
          onClick={setTab}
          activeStyle={{ background: 'color-mix(in oklch, var(--2eat-accent) 15%, var(--paper))', color: 'var(--ink)' }}
        />
        <StatCard
          label="Går ut snart"
          value={urgentCount}
          subtitle={`${lowItems.length} låga`}
          icon={<Clock size={20} />}
          active={tab === 'expiring'}
          tab="expiring"
          onClick={setTab}
          activeStyle={{ background: 'color-mix(in oklch, oklch(0.7 0.14 30) 15%, var(--paper))', color: 'var(--ink)' }}
        />
      </div>

      {/* ── Tab: Items ── */}
      {tab === 'items' && (
        <div>
          {/* Low-stock banner */}
          {lowItems.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '12px 16px',
              marginBottom: 20,
              borderRadius: 12,
              background: 'color-mix(in oklch, oklch(0.7 0.14 30) 12%, var(--paper))',
              border: '1px solid oklch(0.75 0.12 30)',
            }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--ink)' }}>
                {lowItems.length} {lowItems.length === 1 ? 'vara har' : 'varor har'} låg nivå
              </span>
              <button
                onClick={handleAddLowItemsToHandlista}
                disabled={isAddingLowItems}
                style={{
                  padding: '7px 16px',
                  borderRadius: 999,
                  background: 'oklch(0.5 0.15 30)',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  color: 'white',
                  cursor: isAddingLowItems ? 'default' : 'pointer',
                  opacity: isAddingLowItems ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {isAddingLowItems ? 'Lägger till…' : 'Lägg till på Handlistan'}
              </button>
            </div>
          )}

          {/* Search + filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--surface-1)',
              border: '1px solid var(--line)',
              borderRadius: 999,
              padding: '8px 16px',
            }}>
              <Search size={15} style={{ color: 'var(--ink-50)', flexShrink: 0 }} />
              <input
                placeholder="Sök i skafferiet…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  color: 'var(--ink)',
                  width: '100%',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {FILTER_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 999,
                    border: `1px solid ${categoryFilter === cat ? 'var(--ink)' : 'var(--line)'}`,
                    background: categoryFilter === cat ? 'var(--ink)' : 'transparent',
                    color: categoryFilter === cat ? 'var(--paper)' : 'var(--ink-70)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12.5,
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grouped items */}
          {Object.keys(grouped).length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 0',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: 'var(--ink-50)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}>
              {search || categoryFilter !== 'Alla'
                ? 'Inga varor matchade din sökning.'
                : (
                  <>
                    <span>Skafferiet är tomt.</span>
                    <button
                      onClick={handleSeedStarter}
                      disabled={isSeedingStarter}
                      style={{
                        padding: '10px 22px',
                        borderRadius: 999,
                        background: 'var(--ink)',
                        border: 'none',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13.5,
                        color: 'var(--paper)',
                        cursor: isSeedingStarter ? 'default' : 'pointer',
                        opacity: isSeedingStarter ? 0.6 : 1,
                      }}
                    >
                      {isSeedingStarter ? 'Lägger till…' : 'Fyll på med vanliga basvaror'}
                    </button>
                  </>
                )}
            </div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 32 }}>
                <SectionHeader mb={14} right={
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', whiteSpace: 'nowrap' }}>
                    {items.length} st
                  </span>
                }>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 28, color: 'var(--2eat-accent-deep)', margin: 0, whiteSpace: 'nowrap' }}>
                    {cat}
                  </h2>
                </SectionHeader>

                {/* Items grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: 8,
                }}>
                  {items.map((item) => (
                    <PantryItemCard
                      key={item.id}
                      item={item}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      onEdit={(i) => setEditItem(i)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tab: Suggestions ── */}
      {tab === 'suggestions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* Cookable now */}
          <section>
            <SectionHeader right={
              <span style={{ padding: '3px 10px', borderRadius: 999, background: 'var(--2eat-accent)', color: 'white', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                {cookableNow.length}
              </span>
            }>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, margin: 0, color: 'var(--ink)' }}>
                Kan lagas{' '}
                <em style={{ fontStyle: 'italic', color: 'var(--2eat-accent-deep)' }}>nu</em>
              </h2>
            </SectionHeader>
            {cookableNow.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink-50)' }}>
                Inga recept kan lagas med enbart det du har hemma just nu.
              </p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}>
                {cookableNow.map((entry) => (
                  <PantryRecipeCard key={entry.recipe.id} entry={entry} onNavigate={(id) => navigate(`/recipes/${id}`)} />
                ))}
              </div>
            )}
          </section>

          {/* Almost there */}
          <section>
            <SectionHeader right={
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)' }}>köp 1–2 saker</span>
            }>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, margin: 0, color: 'var(--ink)' }}>
                Nästan där
              </h2>
            </SectionHeader>
            {almostThere.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink-50)' }}>
                Inga recept är nästan klara.
              </p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}>
                {almostThere.map((entry) => (
                  <PantryRecipeCard key={entry.recipe.id} entry={entry} onNavigate={(id) => navigate(`/recipes/${id}`)} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── Tab: Expiring ── */}
      {tab === 'expiring' && (
        <div>
          <SectionHeader mb={24}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, margin: 0, color: 'var(--ink)' }}>
              På väg{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--2eat-accent-deep)' }}>ut</em>
            </h2>
          </SectionHeader>

          {expiringItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 0',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: 'var(--ink-50)',
            }}>
              Inga varor går ut inom 7 dagar.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {expiringItems.map((item) => (
                <ExpiringRow
                  key={item.id}
                  item={item}
                  recipes={recipes}
                  onManage={(i) => setEditItem(i)}
                  onNavigate={(id) => navigate(`/recipes/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Add Modal ── */}
      <ItemFormModal
        key="add"
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleItemSave}
        isPending={createMutation.isPending}
      />

      {/* ── Edit Modal ── */}
      <ItemFormModal
        key={editItem?.id ?? 'edit'}
        open={editItem !== null}
        editItem={editItem}
        onClose={() => setEditItem(null)}
        onSave={handleItemSave}
        isPending={updateMutation.isPending}
      />

      {/* ── Receipt Scan Modal ── */}
      <ReceiptScanModal
        open={showScanModal}
        onClose={() => setShowScanModal(false)}
        onItemsAdded={() => queryClient.invalidateQueries({ queryKey: ['pantry'] })}
      />

      {/* ── Text Parse Modal ── */}
      <TextParseModal
        open={showTextModal}
        onClose={() => setShowTextModal(false)}
        onItemsAdded={() => queryClient.invalidateQueries({ queryKey: ['pantry'] })}
      />

      {/* ── Handlista Import Modal ── */}
      <HandlistaImportModal
        open={showHandlistaModal}
        onClose={() => setShowHandlistaModal(false)}
        onItemsAdded={() => queryClient.invalidateQueries({ queryKey: ['pantry'] })}
      />
    </div>
  )
}
