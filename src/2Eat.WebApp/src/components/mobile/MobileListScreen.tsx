import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Bookmark } from 'lucide-react'
import type { Recipe } from '@/types'
import { AuthImg } from '@/components/AuthImg'
import { useAuth } from '@/context/AuthContext'
import { PhotoSlot } from '@/components/PhotoSlot'
import { StarRating } from '@/components/StarRating'
import { recipeSwatch } from '@/lib/recipeUtils'

function timeGreeting(): string {
  const h = new Date().getHours()
  if (h < 10) return 'God morgon'
  if (h < 13) return 'God förmiddag'
  if (h < 17) return 'God eftermiddag'
  if (h < 21) return 'God kväll'
  return 'God natt'
}

export interface MobileListScreenProps {
  recipes: Recipe[]
}

export function MobileListScreen({ recipes }: MobileListScreenProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [activeCategory, setActiveCategory] = useState('Alla')

  const today = new Date()
  const dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag']
  const monthNames = ['jan', 'feb', 'mars', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
  const dateStr = `${dayNames[today.getDay()]} · ${today.getDate()} ${monthNames[today.getMonth()]}`

  const firstName = user?.displayName?.split(' ')[0] ?? ''
  const initials = user?.displayName
    ? user.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const categoryNames = ['Alla', ...Array.from(new Set(recipes.map(r => r.category?.name).filter(Boolean)))]

  const filtered = recipes.filter(r => {
    const matchesQ = !q || r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.description?.toLowerCase().includes(q.toLowerCase())
    const matchesCat = activeCategory === 'Alla' || r.category?.name === activeCategory
    return matchesQ && matchesCat
  })

  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <div className="bg-paper overflow-x-hidden font-sans min-h-screen pb-28">
      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <div className="flex justify-between items-center mb-[18px]">
          <div>
            <div
              className="uppercase text-brand-deep"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em' }}
            >
              {dateStr}
            </div>
            <h1
              className="text-ink m-0 font-normal mt-1"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 34, lineHeight: 1.0, letterSpacing: '-0.035em' }}
            >
              {timeGreeting()}{firstName && (
                <>, <em className="italic text-brand-deep">{firstName}</em></>
              )}
            </h1>
          </div>
          {user?.avatarUrl ? (
            <AuthImg
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-[38px] h-[38px] rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-[38px] h-[38px] rounded-full shrink-0 grid place-items-center text-paper"
              style={{
                background: 'linear-gradient(135deg, var(--2eat-accent), var(--2eat-accent-deep))',
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
              }}
            >{initials}</div>
          )}
        </div>

        {/* Search bar */}
        <div
          className="flex items-center gap-[10px] px-[14px] py-[11px] border border-line rounded-full"
          style={{ background: 'var(--surface-1)' }}
        >
          <Search size={15} color="var(--ink-50)" strokeWidth={1.5} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Sök bland recept…"
            className="flex-1 border-0 outline-none bg-transparent text-ink"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}
          />
        </div>
      </div>

      {/* Featured ("Veckans recept") */}
      {featured && (
        <div className="px-5 pt-1 pb-5">
          <div className="flex justify-between items-baseline mb-[10px]">
            <span
              className="uppercase text-ink-50"
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
            onClick={() => navigate(`/recept/${featured.id}`)}
            className="rounded-[22px] overflow-hidden border border-line cursor-pointer"
          >
            <div className="h-[220px] relative">
              <PhotoSlot
                imageUrl={featured.imageUrl}
                recipeId={featured.id}
                swatch={recipeSwatch(featured.id)}
                label={featured.name}
                fill
              />
              <div className="absolute top-[14px] left-[14px]">
                <span
                  className="inline-flex items-center rounded-full px-2 py-[2px] text-paper uppercase"
                  style={{
                    background: 'var(--ink)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                  }}
                >★ Veckans</span>
              </div>
              <div className="absolute top-[14px] right-[14px]">
                <div className="w-8 h-8 rounded-full grid place-items-center" style={{ background: 'rgba(255,255,255,0.92)' }}>
                  <Bookmark size={14} strokeWidth={1.5} color="var(--ink)" />
                </div>
              </div>
            </div>
            <div className="p-[18px] bg-paper">
              <div
                className="uppercase text-ink-50 mb-[6px]"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em' }}
              >
                {featured.category?.name} · {featured.totalTime} min · {featured.servings} pers
              </div>
              <h2
                className="text-ink m-0 font-normal"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 28, lineHeight: 1.05, letterSpacing: '-0.03em' }}
              >
                {featured.name}
              </h2>
              <p
                className="text-ink-60 mt-2 mb-0 overflow-hidden"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  lineHeight: 1.45,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                } as React.CSSProperties}
              >
                {featured.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category chips */}
      <div className="py-1">
        <div
          className="flex gap-2 px-5 py-1 overflow-x-auto"
          style={{ scrollbarWidth: 'none' } as React.CSSProperties}
        >
          {categoryNames.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className="px-[14px] py-[7px] rounded-full whitespace-nowrap shrink-0 cursor-pointer"
              style={{
                border: '1px solid ' + (activeCategory === c ? 'var(--ink)' : 'var(--line)'),
                background: activeCategory === c ? 'var(--ink)' : 'transparent',
                color: activeCategory === c ? 'var(--paper)' : 'var(--ink-70)',
                fontFamily: 'var(--font-sans)',
                fontSize: 12.5,
              }}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Recipe list */}
      <div className="px-5 pt-2 pb-5">
        {rest.length > 0 && (
          <div className="flex justify-between items-baseline mb-3">
            <h2
              className="text-ink m-0 font-normal"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 24, letterSpacing: '-0.025em' }}
            >
              Senaste recepten
            </h2>
            <span
              className="uppercase text-ink-50"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em' }}
            >
              {recipes.length} st
            </span>
          </div>
        )}

        {filtered.length === 0 && (() => {
          const hasTextSearch = !!q
          const hasCategoryFilter = activeCategory !== 'Alla'
          if (!hasTextSearch && !hasCategoryFilter) {
            return (
              <p style={{ color: 'var(--ink-50)', fontFamily: 'var(--font-sans)', fontSize: 14, textAlign: 'center', paddingTop: 32 }}>
                Inga recept ännu.
              </p>
            )
          }
          if (hasTextSearch && !hasCategoryFilter) {
            return (
              <div style={{ textAlign: 'center', paddingTop: 32 }}>
                <p style={{ color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontSize: 18, margin: '0 0 6px' }}>
                  Inga recept matchar sökningen «{q}».
                </p>
                <p style={{ color: 'var(--ink-50)', fontFamily: 'var(--font-sans)', fontSize: 13, margin: 0 }}>
                  Prova ett annat sökord.
                </p>
              </div>
            )
          }
          if (!hasTextSearch && hasCategoryFilter) {
            return (
              <div style={{ textAlign: 'center', paddingTop: 32 }}>
                <p style={{ color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontSize: 18, margin: '0 0 6px' }}>
                  Inga recept i den här kategorin.
                </p>
                <p style={{ color: 'var(--ink-50)', fontFamily: 'var(--font-sans)', fontSize: 13, margin: 0 }}>
                  Prova att rensa filtren.
                </p>
              </div>
            )
          }
          // Both text search and category filter active
          return (
            <div style={{ textAlign: 'center', paddingTop: 32 }}>
              <p style={{ color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontSize: 18, margin: '0 0 6px' }}>
                Inga recept matchar.
              </p>
              <p style={{ color: 'var(--ink-50)', fontFamily: 'var(--font-sans)', fontSize: 13, margin: 0 }}>
                Prova ett annat sökord eller rensa filtren.
              </p>
            </div>
          )
        })()}

        <div className="flex flex-col gap-3">
          {rest.map(r => (
            <article
              key={r.id}
              onClick={() => navigate(`/recept/${r.id}`)}
              className="grid gap-[14px] p-[10px] bg-paper border border-line rounded-2xl cursor-pointer"
              style={{ gridTemplateColumns: '88px 1fr' }}
            >
              <div className="rounded-[10px] overflow-hidden h-[88px]">
                <PhotoSlot
                  imageUrl={r.imageUrl}
                  recipeId={r.id}
                  swatch={recipeSwatch(r.id)}
                  label={r.name}
                  height="88px"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-0 pt-[2px]">
                <span
                  className="uppercase text-ink-50"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.12em' }}
                >
                  {r.category?.name} · {r.totalTime} MIN
                </span>
                <h3
                  className="text-ink m-0 font-normal"
                  style={{ fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.15, letterSpacing: '-0.02em' }}
                >
                  {r.name}
                </h3>
                <div className="mt-auto flex justify-between items-center">
                  <StarRating value={r.rating} size={10} />
                  <ArrowRight size={14} strokeWidth={1.5} color="var(--ink-40)" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
