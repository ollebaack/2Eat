import { useState, useRef, useEffect, useCallback } from 'react'
import { X, ChefHat } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Ingredient } from '@/types'

interface Props {
  ingredients: Ingredient[]
  selectedIds: number[]
  onChange: (ids: number[]) => void
}

export function IngredientCombobox({ ingredients, selectedIds, onChange }: Props) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedIngredients = ingredients.filter(i => selectedIds.includes(i.id))
  const suggestions = search
    ? ingredients
        .filter(i => !selectedIds.includes(i.id) && i.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 8)
    : []

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const select = useCallback((id: number) => {
    onChange([...selectedIds, id])
    setSearch('')
    setOpen(false)
  }, [selectedIds, onChange])

  const remove = useCallback((id: number) => {
    onChange(selectedIds.filter(x => x !== id))
  }, [selectedIds, onChange])

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px',
          background: 'var(--surface-1)', border: '1px solid var(--line)',
          borderRadius: 999, width: 300,
        }}>
          <ChefHat size={15} strokeWidth={1.5} style={{ color: 'var(--ink-50)', flexShrink: 0 }} />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); setSearch('') } }}
            placeholder="Filtrera på ingredienser…"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--ink)' }}
          />
          {search && (
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" style={{ color: 'var(--ink-50)' }} onClick={() => setSearch('')}>
              <X size={14} />
            </Button>
          )}
        </div>
        <AnimatePresence>
          {open && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 6,
                background: 'var(--paper)', border: '1px solid var(--line)',
                borderRadius: 14, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.14)',
                zIndex: 50, minWidth: 300, overflow: 'hidden',
              }}
            >
              {suggestions.map(i => (
                <button
                  key={i.id}
                  onMouseDown={e => { e.preventDefault(); select(i.id) }}
                  style={{
                    display: 'block', width: '100%', padding: '9px 16px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: 13.5,
                    color: 'var(--ink)', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  {i.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedIngredients.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {selectedIngredients.map(i => (
            <div
              key={i.id}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 999,
                background: 'color-mix(in oklch, var(--2eat-accent) 12%, transparent)',
                border: '1px solid color-mix(in oklch, var(--2eat-accent) 35%, transparent)',
                color: 'var(--2eat-accent-deep)',
                fontFamily: 'var(--font-mono)', fontSize: 10.5,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}
            >
              {i.name}
              <button
                onClick={() => remove(i.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 0, display: 'flex', color: 'inherit', opacity: 0.7,
                }}
              >
                <X size={11} />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange([])}
            style={{
              padding: '4px 10px', borderRadius: 999,
              background: 'none', border: '1px dashed var(--ink-30)',
              color: 'var(--ink-50)', fontFamily: 'var(--font-mono)',
              fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Rensa
          </button>
        </div>
      )}
    </div>
  )
}
