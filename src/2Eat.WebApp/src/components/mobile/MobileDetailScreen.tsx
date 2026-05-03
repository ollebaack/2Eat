import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bookmark, Check, Flame, ArrowRight } from 'lucide-react'
import type { Recipe } from '@/types'
import { Button } from '@/components/ui/button'
import { PhotoSlot } from '@/components/PhotoSlot'
import { recipeSwatch } from '@/lib/recipeUtils'

export function MobileDetailScreen({ recipe }: { recipe: Recipe }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'ingredients' | 'method'>('ingredients')
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  const steps = recipe.instructions
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  const toggle = (id: number) => setChecked(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="bg-paper min-h-screen overflow-y-auto pb-[160px] relative">

      {/* Hero */}
      <div className="relative h-[360px]">
        <PhotoSlot
          imageUrl={recipe.imageUrl}
          swatch={recipeSwatch(recipe.id)}
          label={recipe.name}
          fill
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 30%, transparent 58%, rgba(20,18,14,0.58) 100%)' }}
        />

        {/* Top buttons */}
        <div className="absolute top-14 left-4 right-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/92 backdrop-blur-lg shadow-md border-none hover:bg-white/95"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} className="text-ink" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/92 backdrop-blur-lg shadow-md border-none hover:bg-white/95"
          >
            <Bookmark size={16} className="text-ink" />
          </Button>
        </div>

        {/* Category + title */}
        <div className="absolute bottom-[18px] left-5 right-5">
          <div className="mb-2">
            <span
              className="inline-flex items-center bg-ink text-paper rounded-full font-mono uppercase"
              style={{ padding: '2px 8px', fontSize: 10.5, letterSpacing: '0.06em' }}
            >
              {recipe.category.name}
            </span>
          </div>
          <h1
            className="font-normal leading-[1.0] m-0"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 36,
              letterSpacing: '-0.035em',
              color: '#fff',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {recipe.name}
          </h1>
        </div>
      </div>

      {/* Stat strip — overlaps hero */}
      <div
        className="mx-4 -mt-[22px] relative z-[5] bg-paper border border-line rounded-[18px] py-[14px] px-2 grid grid-cols-3"
        style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.06)' }}
      >
        {[
          { k: 'Tid',   v: recipe.totalTime, u: 'min' },
          { k: 'Pers',  v: recipe.servings,  u: ''    },
          { k: 'Betyg', v: recipe.rating,    u: '/5'  },
        ].map((s, i) => (
          <div
            key={s.k}
            className="flex flex-col items-center gap-1"
            style={{ borderLeft: i === 0 ? 'none' : '1px solid var(--line)' }}
          >
            <span
              className="text-ink-50 uppercase"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em' }}
            >
              {s.k}
            </span>
            <span
              className="text-ink leading-none"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: '-0.02em' }}
            >
              {s.v}
              {s.u && (
                <span className="text-ink-50 ml-[2px]" style={{ fontSize: 11 }}>{s.u}</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Description */}
      {recipe.description && (
        <p
          className="text-ink-70 italic mx-5 mt-5 mb-2"
          style={{ fontFamily: 'var(--font-serif)', fontSize: 15.5, lineHeight: 1.5 }}
        >
          "{recipe.description}"
        </p>
      )}

      {/* Tabs */}
      <div className="flex mx-5 mt-[14px] mb-2 bg-surface-2 rounded-full p-[3px]">
        {(['ingredients', 'method'] as const).map(t => (
          <Button
            key={t}
            variant="ghost"
            className="flex-1 rounded-full h-auto py-2 transition-[background,box-shadow] duration-150"
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? 'var(--paper)' : 'transparent',
              color: tab === t ? 'var(--ink)' : 'var(--ink-60)',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: tab === t ? 500 : 400,
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            {t === 'ingredients'
              ? `Ingredienser · ${recipe.ingredients.length}`
              : `Metod · ${steps.length} steg`}
          </Button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-5 pt-1 pb-5">
        {tab === 'ingredients' ? (
          <ul className="list-none p-0 m-0">
            {recipe.ingredients.map((ri, i) => {
              const isOn = !!checked[ri.id]
              return (
                <li
                  key={ri.id}
                  onClick={() => toggle(ri.id)}
                  className="grid gap-3 items-center py-[13px] cursor-pointer transition-opacity duration-150"
                  style={{
                    gridTemplateColumns: '20px 1fr auto',
                    borderBottom: i === recipe.ingredients.length - 1 ? 'none' : '1px dotted var(--line)',
                    opacity: isOn ? 0.45 : 1,
                  }}
                >
                  <span
                    className="grid place-items-center transition-[background,border-color] duration-150"
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `1.5px solid ${isOn ? 'var(--2eat-accent)' : 'var(--ink-30)'}`,
                      background: isOn ? 'var(--2eat-accent)' : 'transparent',
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
                    {ri.ingredient.name}
                  </span>
                  <span
                    className="text-ink-60 whitespace-nowrap"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
                  >
                    {ri.ingredientMeasurement.quantity} {ri.ingredientMeasurement.unit}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : (
          <ol className="list-none p-0 m-0">
            {steps.map((step, i) => (
              <li
                key={i}
                className="grid gap-[14px] py-[14px]"
                style={{
                  gridTemplateColumns: '40px 1fr',
                  borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                }}
              >
                <span
                  className="italic text-brand-deep leading-[0.9]"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 36,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p
                  className="text-ink m-0"
                  style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.55 }}
                >
                  {step}
                </p>
              </li>
            ))}
            {steps.length === 0 && (
              <li className="text-ink-50 py-3" style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}>
                Inga instruktioner tillagda än.
              </li>
            )}
          </ol>
        )}
      </div>

      {/* Sticky CTA — above tab bar */}
      <div
        className="fixed left-3 right-3 bottom-24 z-[35] bg-ink text-paper px-5 py-[14px] rounded-full flex items-center justify-between cursor-pointer font-medium"
        style={{ fontFamily: 'var(--font-sans)', fontSize: 14, boxShadow: '0 8px 20px rgba(0,0,0,0.18)' }}
      >
        <span className="flex items-center gap-[10px]">
          <Flame size={16} className="text-paper" />
          Sätt igång &amp; laga
        </span>
        <ArrowRight size={16} className="text-paper" />
      </div>
    </div>
  )
}
