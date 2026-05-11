import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Bookmark } from 'lucide-react'
import type { Recipe } from '@/types'
import { getFileUrl } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const SWATCHES = [
  'oklch(0.65 0.12 50)', 'oklch(0.6 0.1 145)', 'oklch(0.62 0.12 30)',
  'oklch(0.6 0.08 210)', 'oklch(0.58 0.1 330)', 'oklch(0.65 0.1 90)',
]

function PhotoSlot({ recipe, height = 'auto', aspect = '4/3' }: {
  recipe: Recipe; height?: string; aspect?: string
}) {
  const swatch = SWATCHES[recipe.id % SWATCHES.length]
  const uid = `mob-sw-${recipe.id}`
  const style: React.CSSProperties = {
    position: 'relative', width: '100%',
    height, aspectRatio: height === 'auto' ? aspect : undefined,
    overflow: 'hidden', borderRadius: 'inherit',
  }
  if (recipe.imageUrl) {
    return (
      <div style={style}>
        <img src={getFileUrl(recipe.imageUrl)} alt={recipe.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }
  return (
    <div style={{ ...style, background: swatch }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <pattern id={uid} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          </pattern>
          <radialGradient id={uid + 'r'} cx="30%" cy="25%" r="80%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${uid})`} />
        <rect width="100%" height="100%" fill={`url(#${uid}r)`} />
      </svg>
    </div>
  )
}

function Stars({ value = 0, size = 10 }: { value: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.9z"
            fill={i <= value ? 'var(--2eat-accent)' : 'none'}
            stroke={i <= value ? 'var(--2eat-accent)' : 'var(--ink-30)'}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  )
}

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
    <div style={{
      background: 'var(--paper)',
      overflowX: 'hidden',
      fontFamily: 'var(--font-sans)',
      minHeight: '100vh',
      paddingBottom: 110,
    }}>
      {/* Header */}
      <div style={{ padding: '56px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.16em', color: 'var(--2eat-accent-deep)',
              textTransform: 'uppercase',
            }}>
              {dateStr}
            </div>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontSize: 34, lineHeight: 1.0,
              letterSpacing: '-0.035em', margin: '4px 0 0', fontWeight: 400, color: 'var(--ink)',
            }}>
              {timeGreeting()}{firstName && (
                <>, <em style={{ fontStyle: 'italic', color: 'var(--2eat-accent-deep)' }}>{firstName}</em></>
              )}
            </h1>
          </div>
          {user?.avatarUrl ? (
            <img
              src={getFileUrl(user.avatarUrl)}
              alt={user.displayName}
              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--2eat-accent), var(--2eat-accent-deep))',
              display: 'grid', placeItems: 'center', color: 'var(--paper)',
              fontFamily: 'var(--font-serif)', fontSize: 14,
            }}>{initials}</div>
          )}
        </div>

        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px',
          background: 'var(--surface-1)', border: '1px solid var(--line)', borderRadius: 999,
        }}>
          <Search size={15} color="var(--ink-50)" strokeWidth={1.5} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Sök recept eller ingrediens…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink)',
            }}
          />
        </div>
      </div>

      {/* Featured ("Veckans recept") */}
      {featured && (
        <div style={{ padding: '4px 20px 20px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.14em', color: 'var(--ink-50)', textTransform: 'uppercase',
            }}>
              Veckans recept
            </span>
            <span
              onClick={() => { setActiveCategory('Alla'); setQ('') }}
              style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--2eat-accent-deep)', cursor: 'pointer' }}
            >
              Visa alla
            </span>
          </div>
          <div
            onClick={() => navigate(`/recipes/${featured.id}`)}
            style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid var(--line)', cursor: 'pointer' }}
          >
            <div style={{ height: 220, position: 'relative' }}>
              <PhotoSlot recipe={featured} height="100%" />
              <div style={{ position: 'absolute', top: 14, left: 14 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '2px 8px', borderRadius: 999,
                  background: 'var(--ink)', color: 'var(--paper)',
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>★ Veckans</span>
              </div>
              <div style={{ position: 'absolute', top: 14, right: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.92)', display: 'grid', placeItems: 'center',
                }}>
                  <Bookmark size={14} strokeWidth={1.5} color="var(--ink)" />
                </div>
              </div>
            </div>
            <div style={{ padding: 18, background: 'var(--paper)' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.12em', color: 'var(--ink-50)',
                textTransform: 'uppercase', marginBottom: 6,
              }}>
                {featured.category?.name} · {featured.totalTime} min · {featured.servings} pers
              </div>
              <h2 style={{
                fontFamily: 'var(--font-serif)', fontSize: 28, lineHeight: 1.05,
                letterSpacing: '-0.03em', margin: 0, fontWeight: 400, color: 'var(--ink)',
              }}>
                {featured.name}
              </h2>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.45,
                color: 'var(--ink-60)', margin: '8px 0 0',
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              } as React.CSSProperties}>
                {featured.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category chips */}
      <div style={{ padding: '4px 0 8px' }}>
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 20px',
          scrollbarWidth: 'none',
        } as React.CSSProperties}>
          {categoryNames.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              style={{
                padding: '7px 14px', borderRadius: 999, whiteSpace: 'nowrap',
                border: '1px solid ' + (activeCategory === c ? 'var(--ink)' : 'var(--line)'),
                background: activeCategory === c ? 'var(--ink)' : 'transparent',
                color: activeCategory === c ? 'var(--paper)' : 'var(--ink-70)',
                fontFamily: 'var(--font-sans)', fontSize: 12.5, cursor: 'pointer', flexShrink: 0,
              }}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Recipe list */}
      <div style={{ padding: '8px 20px 20px' }}>
        {rest.length > 0 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12,
          }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: 24, letterSpacing: '-0.025em',
              margin: 0, fontWeight: 400, color: 'var(--ink)',
            }}>
              Senaste recepten
            </h2>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'var(--ink-50)', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {recipes.length} st
            </span>
          </div>
        )}

        {filtered.length === 0 && (
          <p style={{ color: 'var(--ink-50)', fontFamily: 'var(--font-sans)', fontSize: 14, textAlign: 'center', paddingTop: 32 }}>
            Inga recept hittades.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rest.map(r => (
            <article
              key={r.id}
              onClick={() => navigate(`/recipes/${r.id}`)}
              style={{
                display: 'grid', gridTemplateColumns: '88px 1fr', gap: 14,
                padding: 10, background: 'var(--paper)',
                border: '1px solid var(--line)', borderRadius: 16,
                cursor: 'pointer',
              }}
            >
              <div style={{ borderRadius: 10, overflow: 'hidden', height: 88 }}>
                <PhotoSlot recipe={r} height="100%" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, paddingTop: 2 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9.5,
                  letterSpacing: '0.12em', color: 'var(--ink-50)', textTransform: 'uppercase',
                }}>
                  {r.category?.name} · {r.totalTime} MIN
                </span>
                <h3 style={{
                  fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.15,
                  letterSpacing: '-0.02em', margin: 0, fontWeight: 400, color: 'var(--ink)',
                }}>
                  {r.name}
                </h3>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stars value={r.rating} size={10} />
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
