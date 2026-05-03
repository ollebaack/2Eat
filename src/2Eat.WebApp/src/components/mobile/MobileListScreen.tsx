import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import type { Recipe } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PhotoSlot } from '@/components/PhotoSlot'
import { StarRating } from '@/components/StarRating'
import { recipeSwatch } from '@/lib/recipeUtils'
import { Search } from 'lucide-react'

export interface MobileListScreenProps {
  recipes: Recipe[]
}

export function MobileListScreen({ recipes }: MobileListScreenProps) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [activeCategory, setActiveCategory] = useState('Alla')

  const today = new Date()
  const dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag']
  const monthNames = ['jan', 'feb', 'mars', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
  const dateStr = `${dayNames[today.getDay()]} · ${today.getDate()} ${monthNames[today.getMonth()]}`

  const categoryNames = ['Alla', ...Array.from(new Set(recipes.map(r => r.category.name)))]

  const filtered = recipes.filter(r => {
    const matchesQ = !q || r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.description?.toLowerCase().includes(q.toLowerCase())
    const matchesCat = activeCategory === 'Alla' || r.category.name === activeCategory
    return matchesQ && matchesCat
  })

  const featured = filtered[0]
  const rest = filtered.slice(1, 6)

  return (
    <div
      className="bg-paper overflow-x-hidden min-h-screen pb-[110px]"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* Header */}
      <div className="px-5 pt-16 pb-5">
        <div className="flex justify-between items-center mb-[18px]">
          <div>
            <div
              className="text-brand-deep uppercase"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em' }}
            >
              {dateStr}
            </div>
            <h1
              className="text-ink font-normal"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 38,
                lineHeight: 1.0,
                letterSpacing: '-0.035em',
                margin: '4px 0 0',
              }}
            >
              Välkommen,{' '}
              <em className="italic text-brand-deep">Elsa</em>
            </h1>
          </div>
          <div
            className="w-[38px] h-[38px] rounded-full shrink-0 grid place-items-center text-paper"
            style={{
              background: 'linear-gradient(135deg, var(--2eat-accent), var(--2eat-accent-deep))',
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
            }}
          >
            EL
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-[10px] px-[14px] py-[11px] bg-surface-1 border border-line rounded-full">
          <Search size={15} className="text-ink-50" />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Sök recept eller ingrediens…"
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 text-ink"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}
          />
        </div>
      </div>

      {/* Featured ("Veckans recept") */}
      {featured && (
        <div className="px-5 pb-5">
          <div className="flex justify-between items-baseline mb-[10px]">
            <span
              className="text-ink-50 uppercase"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em' }}
            >
              Veckans recept
            </span>
            <span
              onClick={() => { setActiveCategory('Alla'); setQ('') }}
              className="text-brand-deep cursor-pointer"
              style={{ fontFamily: 'var(--font-sans)', fontSize: 12 }}
            >
              Visa alla
            </span>
          </div>
          <div
            onClick={() => navigate(`/recipes/${featured.id}`)}
            className="rounded-[22px] overflow-hidden border border-line cursor-pointer"
          >
            <div className="h-[220px] relative">
              <PhotoSlot
                imageUrl={featured.imageUrl}
                swatch={recipeSwatch(featured.id)}
                label={featured.name}
                height="100%"
              />
              <div className="absolute top-[14px] left-[14px]">
                <span
                  className="inline-flex items-center bg-ink text-paper rounded-full font-mono uppercase"
                  style={{ padding: '2px 8px', fontSize: 10.5, letterSpacing: '0.06em' }}
                >
                  ★ Veckans
                </span>
              </div>
              <div className="absolute top-[14px] right-[14px]">
                <div className="w-8 h-8 rounded-full bg-white/92 grid place-items-center">
                  <Bookmark size={14} className="text-ink" />
                </div>
              </div>
            </div>
            <div className="p-[18px] bg-paper">
              <div
                className="text-ink-50 uppercase mb-[6px]"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em' }}
              >
                {featured.category.name} · {featured.totalTime} min · {featured.servings} pers
              </div>
              <h2
                className="text-ink m-0 font-normal leading-[1.05]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.03em' }}
              >
                {featured.name}
              </h2>
              <p
                className="text-ink-60 mt-2 mb-0 line-clamp-2"
                style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.45 }}
              >
                {featured.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category chips */}
      <div className="pb-2">
        <div
          className="flex gap-2 overflow-x-auto px-5 py-1"
          style={{ scrollbarWidth: 'none' } as React.CSSProperties}
        >
          {categoryNames.map(c => (
            <Button
              key={c}
              variant={activeCategory === c ? 'default' : 'outline'}
              size="sm"
              className="rounded-full whitespace-nowrap shrink-0"
              onClick={() => setActiveCategory(c)}
              style={{
                background: activeCategory === c ? 'var(--ink)' : 'transparent',
                color: activeCategory === c ? 'var(--paper)' : 'var(--ink-70)',
                borderColor: activeCategory === c ? 'var(--ink)' : 'var(--line)',
                fontFamily: 'var(--font-sans)',
                fontSize: 12.5,
              }}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {/* Recipe list */}
      <div className="px-5 pt-2">
        <div className="flex justify-between items-baseline mb-3">
          <h2
            className="text-ink m-0 font-normal"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 24, letterSpacing: '-0.025em' }}
          >
            {activeCategory === 'Alla' ? 'Senaste recepten' : activeCategory}
          </h2>
          <span
            className="text-ink-50 uppercase"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em' }}
          >
            {filtered.length} st
          </span>
        </div>

        {rest.length === 0 && !featured && (
          <p className="text-ink-50" style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}>
            Inga recept hittades.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {rest.map(r => (
            <article
              key={r.id}
              onClick={() => navigate(`/recipes/${r.id}`)}
              className="grid gap-[14px] items-center p-[10px] bg-paper border border-line rounded-2xl cursor-pointer"
              style={{ gridTemplateColumns: '88px 1fr' }}
            >
              <div className="rounded-[10px] overflow-hidden h-[88px]">
                <PhotoSlot
                  imageUrl={r.imageUrl}
                  swatch={recipeSwatch(r.id)}
                  label={r.name}
                  height="88px"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-0 pt-[2px]">
                <span
                  className="text-ink-50 uppercase"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.12em' }}
                >
                  {r.category.name} · {r.totalTime} MIN
                </span>
                <h3
                  className="text-ink m-0 font-normal leading-[1.15] line-clamp-2"
                  style={{ fontFamily: 'var(--font-serif)', fontSize: 19, letterSpacing: '-0.02em' }}
                >
                  {r.name}
                </h3>
                <div className="mt-auto flex justify-between items-center">
                  <StarRating value={r.rating} size={10} />
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--ink-40)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
