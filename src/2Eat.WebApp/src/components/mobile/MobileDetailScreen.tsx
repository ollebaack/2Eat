import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Recipe } from '@/types'
import { getFileUrl } from '@/lib/api'

const SWATCHES = [
  'oklch(0.65 0.12 50)', 'oklch(0.6 0.1 145)', 'oklch(0.62 0.12 30)',
  'oklch(0.6 0.08 210)', 'oklch(0.58 0.1 330)', 'oklch(0.65 0.1 90)',
]

function HeroPhoto({ recipe }: { recipe: Recipe }) {
  const swatch = SWATCHES[recipe.id % SWATCHES.length]
  const uid = `det-sw-${recipe.id}`
  if (recipe.imageUrl) {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <img
          src={getFileUrl(recipe.imageUrl)}
          alt={recipe.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    )
  }
  return (
    <div style={{ position: 'absolute', inset: 0, background: swatch }}>
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

export function MobileDetailScreen({ recipe }: { recipe: Recipe }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'ingredients' | 'method'>('ingredients')
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  const steps = recipe.instructions
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  const toggle = (id: number) => setChecked(prev => ({ ...prev, [id]: !prev[id] }))

  const glassBtn: React.CSSProperties = {
    width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: 'none', cursor: 'pointer',
    display: 'grid', placeItems: 'center', fontSize: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  }

  const stats = [
    { label: 'Tid',   value: recipe.totalTime,             unit: 'min' },
    { label: 'Pers',  value: recipe.servings,               unit: ''    },
    { label: 'Betyg', value: '★'.repeat(recipe.rating || 0), unit: ''  },
    { label: 'Nivå',  value: recipe.difficulty || 'Medel', unit: '' },
  ]

  return (
    <div style={{
      background: 'var(--paper)',
      minHeight: '100vh',
      overflowY: 'auto',
      paddingBottom: 120,
      position: 'relative',
    }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: 340 }}>
        <HeroPhoto recipe={recipe} />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%)',
        }} />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{ ...glassBtn, position: 'absolute', top: 52, left: 16 }}
        >←</button>

        {/* Bookmark button */}
        <button
          style={{ ...glassBtn, position: 'absolute', top: 52, right: 16 }}
        >🔖</button>

        {/* Category + title overlay */}
        <div style={{ position: 'absolute', bottom: 60, left: 20, right: 20 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.12em', color: 'rgba(255,255,255,0.75)',
            textTransform: 'uppercase', marginBottom: 6,
          }}>
            {recipe.category?.name}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 34, lineHeight: 1.0,
            letterSpacing: '-0.03em', color: '#fff', margin: 0, fontWeight: 400,
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}>
            {recipe.name}
          </h1>
        </div>

        {/* Stat strip — overlaps hero bottom */}
        <div style={{
          position: 'absolute', bottom: -28, left: 16, right: 16,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 18, padding: '14px 20px',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          border: '1px solid var(--line)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          zIndex: 5,
        }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              borderLeft: i === 0 ? 'none' : '1px solid var(--line)',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-50)',
              }}>{s.label}</span>
              <span style={{
                fontFamily: 'var(--font-serif)', fontSize: 18,
                lineHeight: 1.1, color: 'var(--ink)', letterSpacing: '-0.02em',
              }}>
                {s.value}
                {s.unit && (
                  <span style={{ fontSize: 11, color: 'var(--ink-50)', marginLeft: 2 }}>{s.unit}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Segmented tabs */}
      <div style={{ padding: '44px 20px 0' }}>
        <div style={{
          display: 'flex', background: 'var(--surface-1)', borderRadius: 12, padding: 4, marginBottom: 24,
        }}>
          {(['ingredients', 'method'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 9,
                border: 'none', cursor: 'pointer',
                background: tab === t ? 'var(--paper)' : 'transparent',
                color: tab === t ? 'var(--ink)' : 'var(--ink-50)',
                fontFamily: 'var(--font-sans)', fontSize: 13.5,
                fontWeight: tab === t ? 500 : 400,
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t === 'ingredients'
                ? `Ingredienser · ${recipe.ingredients.length}`
                : `Metod · ${steps.length} steg`}
            </button>
          ))}
        </div>

        {/* Ingredients tab */}
        {tab === 'ingredients' && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, paddingBottom: 40 }}>
            {recipe.ingredients.map((ri, i) => {
              const isOn = !!checked[ri.id]
              return (
                <li
                  key={ri.id}
                  onClick={() => toggle(ri.id)}
                  style={{
                    display: 'grid', gridTemplateColumns: '24px 1fr auto',
                    gap: 12, alignItems: 'center',
                    padding: '13px 0',
                    borderBottom: i < recipe.ingredients.length - 1 ? '1px dotted var(--line)' : 'none',
                    cursor: 'pointer',
                    opacity: isOn ? 0.45 : 1,
                    transition: 'opacity 0.15s',
                  }}
                >
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: '1.5px solid ' + (isOn ? 'var(--2eat-accent)' : 'var(--ink-30)'),
                    background: isOn ? 'var(--2eat-accent)' : 'transparent',
                    display: 'grid', placeItems: 'center',
                    color: 'var(--paper)', fontSize: 11,
                    transition: 'background 0.15s, border-color 0.15s',
                  }}>
                    {isOn && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="var(--paper)" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5 9-11" />
                      </svg>
                    )}
                  </span>

                  <span style={{
                    fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--ink)',
                    textDecoration: isOn ? 'line-through' : 'none',
                  }}>
                    {ri.ingredient.name}
                  </span>

                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12,
                    color: 'var(--ink-60)', whiteSpace: 'nowrap',
                  }}>
                    {ri.ingredientMeasurement.quantity} {ri.ingredientMeasurement.unit}
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        {/* Method tab */}
        {tab === 'method' && (
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, paddingBottom: 40 }}>
            {steps.map((step, i) => (
              <li
                key={i}
                style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr', gap: 16,
                  padding: '20px 0',
                  borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-serif)', fontSize: 36,
                  lineHeight: 0.9, letterSpacing: '-0.04em',
                  color: 'var(--2eat-accent-deep)', fontStyle: 'italic',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p style={{
                  fontFamily: 'var(--font-serif)', fontSize: 16,
                  lineHeight: 1.5, color: 'var(--ink)', margin: 0,
                }}>
                  {step}
                </p>
              </li>
            ))}

            {steps.length === 0 && (
              <li style={{ color: 'var(--ink-50)', fontFamily: 'var(--font-sans)', fontSize: 14, padding: '12px 0' }}>
                Inga instruktioner tillagda än.
              </li>
            )}
          </ol>
        )}
      </div>

      {/* Fixed CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 20px 32px',
        background: 'linear-gradient(to top, var(--paper) 70%, transparent)',
        zIndex: 40,
      }}>
        <button style={{
          width: '100%', padding: '16px', borderRadius: 18,
          border: 'none', background: 'var(--ink)', color: 'var(--paper)',
          fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, cursor: 'pointer',
        }}>
          Sätt igång &amp; laga
        </button>
      </div>
    </div>
  )
}
