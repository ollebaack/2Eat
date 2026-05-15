import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X, ArrowLeft, ArrowRight, Search, Sparkles, Copy, Trash2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { getWeekPlan, setDaySlot, clearDaySlot, getRecipes } from '@/lib/api'
import type { Recipe, WeekPlan } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhotoSlot } from '@/components/PhotoSlot'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ── Week helpers ─────────────────────────────────────────────────────────────

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getWeekNumber(d: Date): number {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

// ── Constants ────────────────────────────────────────────────────────────────

const WEEKDAYS = [
  { key: 1, label: 'Mån', long: 'Måndag' },
  { key: 2, label: 'Tis', long: 'Tisdag' },
  { key: 3, label: 'Ons', long: 'Onsdag' },
  { key: 4, label: 'Tor', long: 'Torsdag' },
  { key: 5, label: 'Fre', long: 'Fredag' },
  { key: 6, label: 'Lör', long: 'Lördag' },
  { key: 7, label: 'Sön', long: 'Söndag' },
]

// ── Recipe picker modal ──────────────────────────────────────────────────────

function RecipePickerModal({
  open,
  dayLabel,
  recipes,
  onClose,
  onPick,
}: {
  open: boolean
  dayLabel: string
  recipes: Recipe[]
  onClose: () => void
  onPick: (recipe: Recipe) => void
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query) return recipes
    const q = query.toLowerCase()
    return recipes.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.category?.name?.toLowerCase().includes(q)
    )
  }, [recipes, query])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(20,18,14,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'grid', placeItems: 'center',
        zIndex: 200, padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 620,
          maxHeight: '80vh',
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 24,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 30px 60px -20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-deep)' }}>
            Välj till {dayLabel}
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: '-0.03em', lineHeight: 1.05, color: 'var(--ink)', margin: '4px 0 16px', fontWeight: 400 }}>
            Vad ska vi äta?
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', background: 'var(--surface-1)', borderRadius: 999, border: '1px solid var(--line)' }}>
            <Search size={14} strokeWidth={1.5} style={{ color: 'var(--ink-50)', flexShrink: 0 }} />
            <Input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Sök recept…"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
              style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5 }}
            />
            {query && (
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setQuery('')}>
                <X size={13} />
              </Button>
            )}
          </div>
        </div>

        {/* Recipe list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--ink-50)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16 }}>
              Inga recept matchar sökningen.
            </div>
          ) : (
            filtered.map(r => (
              <button
                key={r.id}
                onClick={() => { onPick(r); onClose() }}
                style={{
                  display: 'grid', gridTemplateColumns: '56px 1fr auto',
                  gap: 14, alignItems: 'center',
                  padding: '10px 16px',
                  width: '100%', textAlign: 'left',
                  background: 'none', border: 'none',
                  borderBottom: '1px solid var(--line)',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <div style={{ borderRadius: 8, overflow: 'hidden', height: 48 }}>
                  <PhotoSlot imageUrl={r.imageUrl} recipeId={r.id} label={r.name} height="48px" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--ink)', letterSpacing: '-0.015em' }}>{r.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-50)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
                    {r.category?.name} · {r.totalTime} min · {r.servings} pers
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-50)', whiteSpace: 'nowrap' }}>
                  {r.totalTime} MIN
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--line)', flexShrink: 0 }}>
          <Button variant="outline" className="rounded-full" onClick={onClose} style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>
            Avbryt
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Day cell ─────────────────────────────────────────────────────────────────

function DayCell({
  day,
  date,
  isToday,
  recipe,
  onAdd,
  onRemove,
  note,
}: {
  day: { key: number; label: string; long: string }
  date: Date
  isToday: boolean
  recipe: Recipe | undefined
  onAdd: () => void
  onRemove: () => void
  note: string
}) {
  const dateNum = date.getDate()

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'var(--paper)',
      border: `1px solid ${isToday ? 'var(--ink)' : 'var(--line)'}`,
      borderRadius: 16, minHeight: 280,
      overflow: 'hidden',
    }}>
      {/* Date header */}
      <div style={{
        padding: '12px 14px',
        background: isToday ? 'var(--ink)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: isToday ? 'rgba(255,255,255,0.65)' : 'var(--ink-50)',
          }}>
            {day.label}
          </div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 24,
            letterSpacing: '-0.025em', lineHeight: 1.1,
            color: isToday ? 'var(--paper)' : 'var(--ink)',
          }}>
            {dateNum}
          </div>
        </div>
        {isToday && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            padding: '3px 8px',
            background: 'rgba(255,255,255,0.18)',
            color: 'var(--paper)',
            borderRadius: 999,
          }}>
            Idag
          </span>
        )}
      </div>

      {/* Content */}
      {recipe ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Photo */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <PhotoSlot imageUrl={recipe.imageUrl} recipeId={recipe.id} label={recipe.name} height="86px" />
            <button
              onClick={onRemove}
              style={{
                position: 'absolute', top: 6, right: 6,
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(4px)',
                border: 'none', cursor: 'pointer',
                display: 'grid', placeItems: 'center',
                color: 'var(--ink)',
              }}
            >
              <X size={12} strokeWidth={2} />
            </button>
          </div>

          {/* Recipe info */}
          <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, letterSpacing: '-0.02em', color: 'var(--ink)', lineHeight: 1.2 }}>
              {recipe.name}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {recipe.totalTime} min · {recipe.servings} pers
            </div>
            {note && (
              <div style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12.5,
                color: 'var(--ink-60)', lineHeight: 1.4,
                borderLeft: '2px solid var(--accent)',
                paddingLeft: 8, marginTop: 4,
              }}>
                {note}
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={onAdd}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8, background: 'none', border: 'none',
            cursor: 'pointer', padding: '16px 14px',
            transition: 'background 0.12s',
            borderRadius: '0 0 16px 16px',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '1.5px dashed var(--ink-30)',
            display: 'grid', placeItems: 'center',
            color: 'var(--ink-40)',
          }}>
            <Plus size={14} strokeWidth={1.5} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-40)' }}>
            Lägg till
          </span>
        </button>
      )}
    </div>
  )
}

// ── Stats strip ──────────────────────────────────────────────────────────────

function StatsStrip({ weekPlan, recipes }: { weekPlan: WeekPlan | undefined; recipes: Recipe[] | undefined }) {
  const stats = useMemo(() => {
    if (!weekPlan || !recipes) return { planned: 0, totalTime: 0, shopping: 0, vegetarian: 0 }

    let planned = 0, totalTime = 0, vegCount = 0
    const ingredientSet = new Set<string>()

    weekPlan.days.forEach(day => {
      if (!day.recipeId) return
      const recipe = recipes.find(r => r.id === day.recipeId)
      if (!recipe) return
      planned++
      totalTime += recipe.totalTime
      recipe.ingredients.forEach(ri => {
        ingredientSet.add(ri.ingredient.name)
      })
      const isVeg = recipe.ingredients.every(ri =>
        ri.ingredient.allergens?.some(a => a.id === 'Vegetariskt' || a.id === 'Veganskt')
      )
      if (isVeg) vegCount++
    })

    return { planned, totalTime, shopping: ingredientSet.size, vegetarian: vegCount }
  }, [weekPlan, recipes])

  const cells = [
    { label: 'Planerade middagar', value: stats.planned, unit: 'av 7' },
    { label: 'Total tid', value: stats.totalTime, unit: 'min' },
    { label: 'Ingredienser', value: stats.shopping, unit: 'st' },
    { label: 'Vegetariska', value: stats.vegetarian, unit: 'middagar' },
  ]

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      background: 'var(--paper)', border: '1px solid var(--line)',
      borderRadius: 18, overflow: 'hidden', marginBottom: 28,
    }}>
      {cells.map((cell, i) => (
        <div
          key={cell.label}
          style={{
            padding: '20px 24px',
            borderRight: i < cells.length - 1 ? '1px solid var(--line)' : 'none',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-50)', marginBottom: 6 }}>
            {cell.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 1, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
              {cell.value}
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-50)' }}>
              {cell.unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Shopping list edit dialog ────────────────────────────────────────────────

function ShoppingListEditDialog({
  open,
  onClose,
  sourceItems,
}: {
  open: boolean
  onClose: () => void
  sourceItems: Array<{ key: string; name: string; qty: number; unit: string; category: string }>
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [removed, setRemoved] = useState<Set<string>>(new Set())

  const visible = sourceItems.filter(it => !removed.has(it.key))

  function toggle(key: string) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function remove(key: string) {
    setRemoved(prev => new Set([...prev, key]))
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 20, maxWidth: 480 }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-serif)', fontSize: 24, letterSpacing: '-0.025em', fontWeight: 400 }}>
            Inköpslista
          </DialogTitle>
        </DialogHeader>
        <div style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {visible.length === 0 && (
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-50)', padding: '12px 0' }}>
              Inköpslistan är tom — planera middagar för att fylla på.
            </p>
          )}
          {visible.map(item => {
            const isChecked = checked.has(item.key)
            return (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px dotted var(--line)' }}>
                <button
                  onClick={() => toggle(item.key)}
                  style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: `1.5px solid ${isChecked ? 'var(--accent)' : 'var(--ink-30)'}`,
                    background: isChecked ? 'var(--accent)' : 'transparent',
                    cursor: 'pointer', display: 'grid', placeItems: 'center',
                    color: 'var(--paper)',
                  }}
                >
                  {isChecked && <Check size={11} strokeWidth={2.5} />}
                </button>
                <span style={{
                  flex: 1, fontFamily: 'var(--font-sans)', fontSize: 14,
                  color: isChecked ? 'var(--ink-40)' : 'var(--ink)',
                  textDecoration: isChecked ? 'line-through' : 'none',
                }}>
                  {item.name}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-50)', whiteSpace: 'nowrap' }}>
                  {item.qty} {item.unit}
                </span>
                <button
                  onClick={() => remove(item.key)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-40)', padding: 4, display: 'grid', placeItems: 'center' }}
                  aria-label="Ta bort"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Shopping list ────────────────────────────────────────────────────────────

function ShoppingList({ weekPlan, recipes }: { weekPlan: WeekPlan | undefined; recipes: Recipe[] | undefined }) {
  const [editOpen, setEditOpen] = useState(false)
  const [editKey, setEditKey] = useState(0)

  const { groups, flatItems } = useMemo(() => {
    if (!weekPlan || !recipes) return { groups: {} as Record<string, Array<{ name: string; unit: string; qty: number; recipes: string[] }>>, flatItems: [] }
    const map = new Map<string, { name: string; unit: string; qty: number; recipes: string[]; category: string }>()

    weekPlan.days.forEach(day => {
      if (!day.recipeId) return
      const recipe = recipes.find(r => r.id === day.recipeId)
      if (!recipe) return
      recipe.ingredients.forEach(ri => {
        const key = `${ri.ingredient.name}|${ri.ingredientMeasurement.unit}`
        const cur = map.get(key)
        if (cur) {
          cur.qty += ri.ingredientMeasurement.quantity
          if (!cur.recipes.includes(recipe.name)) cur.recipes.push(recipe.name)
        } else {
          map.set(key, {
            name: ri.ingredient.name,
            unit: ri.ingredientMeasurement.unit,
            qty: ri.ingredientMeasurement.quantity,
            recipes: [recipe.name],
            category: ri.ingredient.category?.name ?? 'Övrigt',
          })
        }
      })
    })

    const grouped: Record<string, Array<{ name: string; unit: string; qty: number; recipes: string[] }>> = {}
    for (const it of map.values()) {
      if (!grouped[it.category]) grouped[it.category] = []
      grouped[it.category].push({ name: it.name, unit: it.unit, qty: it.qty, recipes: it.recipes })
    }

    const flat = Array.from(map.values()).map(it => ({
      key: `${it.name}|${it.unit}`,
      name: it.name,
      qty: it.qty,
      unit: it.unit,
      category: it.category,
    }))

    return { groups: grouped, flatItems: flat }
  }, [weekPlan, recipes])

  const isEmpty = flatItems.length === 0

  function copyList() {
    const lines: string[] = []
    Object.entries(groups).forEach(([category, items]) => {
      lines.push(category.toUpperCase())
      items.forEach(item => {
        lines.push(`${item.qty} ${item.unit} ${item.name}`.trim())
      })
      lines.push('')
    })
    navigator.clipboard.writeText(lines.join('\n').trim())
      .then(() => toast.success('Handlista kopierad'))
      .catch(() => toast.error('Kunde inte kopiera'))
  }

  return (
    <>
      <ShoppingListEditDialog key={editKey} open={editOpen} onClose={() => setEditOpen(false)} sourceItems={flatItems} />
      <div style={{
        background: 'var(--paper)', border: '1px solid var(--line)',
        borderRadius: 18, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent-deep)', marginBottom: 2 }}>
            Automatisk
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, letterSpacing: '-0.025em', color: 'var(--ink)', margin: 0, fontWeight: 400 }}>
            Inköpslista
          </h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 8px' }}>
          {isEmpty ? (
            <p style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: 14, color: 'var(--ink-50)',
              padding: '24px 22px', margin: 0,
            }}>
              Inköpslistan fylls när du planerat någon middag.
            </p>
          ) : (
            Object.entries(groups).map(([category, items]) => (
              <div key={category}>
                <div style={{
                  padding: '12px 22px 6px',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-deep)', whiteSpace: 'nowrap' }}>
                    {category}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-40)' }}>{items.length}</span>
                </div>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid', gridTemplateColumns: '20px 1fr auto',
                      gap: 10, alignItems: 'center',
                      padding: '7px 22px',
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: 4,
                      border: '1.5px solid var(--line)',
                      flexShrink: 0,
                    }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.2 }}>
                        {item.name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-50)', marginTop: 1 }}>
                        till: {item.recipes.join(', ')}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-70)', whiteSpace: 'nowrap' }}>
                      {item.qty} {item.unit}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
          <Button
            className="flex-1 rounded-full gap-1.5"
            style={{ background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'var(--font-sans)', fontSize: 13, border: 'none' }}
            onClick={copyList}
          >
            <Copy size={13} /> Kopiera lista
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}
            onClick={() => { setEditKey(k => k + 1); setEditOpen(true) }}
          >
            Redigera
          </Button>
        </div>
      </div>
    </>
  )
}

// ── Recipe library ───────────────────────────────────────────────────────────

function RecipeLibrary({ recipes, onDragStart }: { recipes: Recipe[]; onDragStart: (recipe: Recipe) => void }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query) return recipes
    const q = query.toLowerCase()
    return recipes.filter(r => r.name.toLowerCase().includes(q) || r.category?.name?.toLowerCase().includes(q))
  }, [recipes, query])

  return (
    <div style={{
      background: 'var(--paper)', border: '1px solid var(--line)',
      borderRadius: 18, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent-deep)', marginBottom: 2 }}>
          Dra till kalender
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, letterSpacing: '-0.025em', color: 'var(--ink)', margin: '0 0 12px', fontWeight: 400 }}>
          Receptbiblioteket
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', background: 'var(--surface-1)', borderRadius: 999, border: '1px solid var(--line)' }}>
          <Search size={13} strokeWidth={1.5} style={{ color: 'var(--ink-50)', flexShrink: 0 }} />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filtrera recept…"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-8"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}
          />
          {query && (
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setQuery('')}>
              <X size={12} />
            </Button>
          )}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {filtered.map(recipe => (
          <div
            key={recipe.id}
            draggable
            onDragStart={() => onDragStart(recipe)}
            style={{
              display: 'grid', gridTemplateColumns: '56px 1fr auto',
              gap: 14, alignItems: 'center',
              padding: '8px 16px',
              cursor: 'grab',
              transition: 'background 0.12s',
              userSelect: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <div style={{ borderRadius: 8, overflow: 'hidden', height: 48, flexShrink: 0 }}>
              <PhotoSlot imageUrl={recipe.imageUrl} recipeId={recipe.id} label={recipe.name} height="48px" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, letterSpacing: '-0.015em', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {recipe.name}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-50)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
                {recipe.category?.name} · {recipe.totalTime} min
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0, opacity: 0.35 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 16, height: 1.5, background: 'var(--ink)', borderRadius: 1 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Mobile view ──────────────────────────────────────────────────────────────

function MobileView({
  weekStart,
  weekPlan,
  recipes,
  onAddDay,
  onRemoveDay,
}: {
  weekStart: Date
  weekPlan: WeekPlan | undefined
  recipes: Recipe[] | undefined
  onAddDay: (dayKey: number) => void
  onRemoveDay: (dayKey: number) => void
}) {
  const todayDate = new Date()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {WEEKDAYS.map(day => {
        const date = new Date(weekStart)
        date.setDate(date.getDate() + day.key - 1)
        const isToday = date.toDateString() === todayDate.toDateString()
        const planDay = weekPlan?.days.find(d => d.dayOfWeek === day.key)
        const recipe = recipes?.find(r => r.id === planDay?.recipeId)

        return (
          <DayCell
            key={day.key}
            day={day}
            date={date}
            isToday={isToday}
            recipe={recipe}
            note={planDay?.note ?? ''}
            onAdd={() => onAddDay(day.key)}
            onRemove={() => onRemoveDay(day.key)}
          />
        )
      })}
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────

export function VeckoplanPage() {
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const [weekOffset, setWeekOffset] = useState(0)
  const [pickerDay, setPickerDay] = useState<number | null>(null)
  const [draggedRecipe, setDraggedRecipe] = useState<Recipe | null>(null)

  const weekStart = useMemo(() => {
    const d = getMonday(new Date())
    d.setDate(d.getDate() + weekOffset * 7)
    return d
  }, [weekOffset])

  const weekStartStr = toDateString(weekStart)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const weekNum = getWeekNumber(weekStart)
  const dateRange = `${weekStart.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })} – ${weekEnd.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}`

  const { data: weekPlan } = useQuery({
    queryKey: ['weekplan', weekStartStr],
    queryFn: () => getWeekPlan(weekStartStr),
    retry: false,
  })

  const { data: recipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: getRecipes,
  })

  const setSlotMutation = useMutation({
    mutationFn: ({ dayOfWeek, recipeId, note }: { dayOfWeek: number; recipeId: number | null; note: string }) =>
      setDaySlot(weekStartStr, dayOfWeek, { recipeId, note }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weekplan', weekStartStr] }),
    onError: () => toast.error('Kunde inte spara middagen'),
  })

  const clearSlotMutation = useMutation({
    mutationFn: (dayOfWeek: number) => clearDaySlot(weekStartStr, dayOfWeek),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weekplan', weekStartStr] }),
    onError: () => toast.error('Kunde inte ta bort middagen'),
  })

  const pickerDayLabel = pickerDay != null
    ? WEEKDAYS.find(d => d.key === pickerDay)?.long ?? ''
    : ''

  const handlePickRecipe = (recipe: Recipe, dayOfWeek?: number) => {
    const targetDay = dayOfWeek ?? pickerDay
    if (targetDay == null) return
    setSlotMutation.mutate({ dayOfWeek: targetDay, recipeId: recipe.id, note: '' })
    toast.success(`${recipe.name} lagd på ${WEEKDAYS.find(d => d.key === targetDay)?.long}`)
  }

  const handleRemove = (dayOfWeek: number) => {
    clearSlotMutation.mutate(dayOfWeek)
    toast.success('Middag borttagen')
  }

  const todayDate = new Date()

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '24px 16px 48px' : '36px 40px 60px', width: '100%' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', color: 'var(--accent-deep)', textTransform: 'uppercase' }}>
            Vecka {weekNum} · {dateRange}
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 5.4vw, 60px)', letterSpacing: '-0.035em', lineHeight: 0.98, color: 'var(--ink)', margin: 0, fontWeight: 400 }}>
            Veckoplan
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Week nav */}
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 999, overflow: 'hidden' }}>
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              style={{ padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-60)', display: 'flex', alignItems: 'center' }}
            >
              <ArrowLeft size={15} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              style={{
                padding: '8px 16px',
                background: weekOffset === 0 ? 'var(--ink)' : 'none',
                color: weekOffset === 0 ? 'var(--paper)' : 'var(--ink)',
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: 13,
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              Den här veckan
            </button>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              style={{ padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-60)', display: 'flex', alignItems: 'center' }}
            >
              <ArrowRight size={15} strokeWidth={1.5} />
            </button>
          </div>

          {/* Auto-fill button */}
          <Button
            variant="outline"
            className="rounded-full gap-2"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 13, background: 'var(--paper)' }}
            onClick={() => {
              if (!recipes || recipes.length === 0) return

              const emptyDays = WEEKDAYS.filter(day =>
                !weekPlan?.days.find(d => d.dayOfWeek === day.key)?.recipeId
              )
              if (emptyDays.length === 0) return

              const usedIds = new Set(
                weekPlan?.days.filter(d => d.recipeId).map(d => d.recipeId) ?? []
              )
              const shuffle = (arr: Recipe[]) => [...arr].sort(() => Math.random() - 0.5)
              const pool = [
                ...shuffle(recipes.filter(r => !usedIds.has(r.id))),
                ...shuffle(recipes.filter(r => usedIds.has(r.id))),
              ]

              emptyDays.forEach((day, i) => {
                setSlotMutation.mutate({ dayOfWeek: day.key, recipeId: pool[i % pool.length].id, note: '' })
              })
              toast.success('Veckan auto-fylld!')
            }}
          >
            <Sparkles size={14} /> Auto-fyll vecka
          </Button>
        </div>
      </header>

      {/* Stats strip */}
      {!isMobile && <StatsStrip weekPlan={weekPlan} recipes={recipes} />}

      {/* 7-day grid or mobile list */}
      {isMobile ? (
        <MobileView
          weekStart={weekStart}
          weekPlan={weekPlan}
          recipes={recipes}
          onAddDay={dayKey => setPickerDay(dayKey)}
          onRemoveDay={handleRemove}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginBottom: 36 }}>
          {WEEKDAYS.map(day => {
            const date = new Date(weekStart)
            date.setDate(date.getDate() + day.key - 1)
            const isToday = date.toDateString() === todayDate.toDateString()
            const planDay = weekPlan?.days.find(d => d.dayOfWeek === day.key)
            const recipe = recipes?.find(r => r.id === planDay?.recipeId)

            return (
              <div
                key={day.key}
                onDragOver={e => { e.preventDefault() }}
                onDrop={e => {
                  e.preventDefault()
                  if (draggedRecipe) {
                    handlePickRecipe(draggedRecipe, day.key)
                    setDraggedRecipe(null)
                  }
                }}
              >
                <DayCell
                  day={day}
                  date={date}
                  isToday={isToday}
                  recipe={recipe}
                  note={planDay?.note ?? ''}
                  onAdd={() => setPickerDay(day.key)}
                  onRemove={() => handleRemove(day.key)}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Lower split panel (desktop only) */}
      {!isMobile && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 22 }}>
          <RecipeLibrary
            recipes={recipes ?? []}
            onDragStart={setDraggedRecipe}
          />
          <ShoppingList weekPlan={weekPlan} recipes={recipes} />
        </div>
      )}

      {/* Mobile: shopping list below */}
      {isMobile && (
        <div style={{ marginTop: 24 }}>
          <ShoppingList weekPlan={weekPlan} recipes={recipes} />
        </div>
      )}

      {/* Recipe picker modal */}
      <RecipePickerModal
        open={pickerDay != null}
        dayLabel={pickerDayLabel}
        recipes={recipes ?? []}
        onClose={() => setPickerDay(null)}
        onPick={recipe => handlePickRecipe(recipe)}
      />
    </div>
  )
}
