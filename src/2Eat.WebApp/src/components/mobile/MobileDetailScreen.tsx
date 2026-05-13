import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bookmark, Shuffle, Flame, ArrowRight } from 'lucide-react'
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

  const pricedIngredients = recipe.ingredients.filter(ri => ri.ingredient?.pricePerUnit != null)
  const totalCost = pricedIngredients.reduce((sum, ri) => {
    return sum + (ri.ingredientMeasurement?.quantity ?? 0) * (ri.ingredient.pricePerUnit ?? 0)
  }, 0)
  const hasCost = pricedIngredients.length > 0

  const glassBtn: React.CSSProperties = {
    width: 40, height: 40, borderRadius: '50%',
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: 'none', cursor: 'pointer',
    display: 'grid', placeItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  }

  return (
    <div style={{
      background: 'var(--paper)',
      minHeight: '100vh',
      overflowY: 'auto',
      paddingBottom: 120,
      position: 'relative',
    }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: 360 }}>
        <HeroPhoto recipe={recipe} />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 30%, transparent 60%, rgba(20,18,14,0.55) 100%)',
        }} />

        {/* Back button */}
        <button
          aria-label="Tillbaka"
          onClick={() => navigate(-1)}
          style={{ ...glassBtn, position: 'absolute', top: 56, left: 16 }}
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
        </button>

        {/* Action buttons */}
        <div style={{ position: 'absolute', top: 56, right: 16, display: 'flex', gap: 8 }}>
          <button style={glassBtn}>
            <Bookmark size={16} strokeWidth={1.5} />
          </button>
          <button style={glassBtn}>
            <Shuffle size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Category pill + title overlay */}
        <div style={{ position: 'absolute', bottom: 18, left: 20, right: 20 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 8px', borderRadius: 999,
              background: 'var(--ink)', color: 'var(--paper)',
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {recipe.category?.name}
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 1.0,
            letterSpacing: '-0.035em', color: '#fff', margin: 0, fontWeight: 400,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {recipe.name}
          </h1>
        </div>
      </div>

      {/* Stat strip — floats over hero bottom */}
      <div style={{
        margin: '-22px 16px 0', position: 'relative', zIndex: 5,
        background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 18,
        padding: '14px 8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
      }}>
        {[
          { label: 'Tid',   value: recipe.totalTime,             unit: 'min' },
          { label: 'Pers',  value: recipe.servings,               unit: ''   },
          { label: 'Nivå',  value: recipe.difficulty || 'Medel', unit: ''   },
          { label: 'Betyg', value: recipe.rating,                unit: '/5' },
        ].map((s, i) => (
          <div key={s.label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            borderLeft: i === 0 ? 'none' : '1px solid var(--line)',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-50)',
            }}>{s.label}</span>
            <span style={{
              fontFamily: 'var(--font-serif)', fontSize: 22,
              lineHeight: 1, color: 'var(--ink)', letterSpacing: '-0.02em',
            }}>
              {s.value}
              {s.unit && (
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--ink-50)', marginLeft: 2 }}>
                  {s.unit}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Description italic quote */}
      {recipe.description && (
        <p style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15.5, lineHeight: 1.5,
          color: 'var(--ink-70)', margin: '20px 20px 8px',
        }}>
          "{recipe.description}"
        </p>
      )}

      {/* Nutrition strip */}
      {(recipe.calories || recipe.protein || recipe.fat || recipe.carbs) && (
        <div style={{ margin: '12px 16px 0', display: 'flex', gap: 0, background: 'var(--surface-1)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          {([
            { label: 'Kcal',  value: recipe.calories != null ? String(recipe.calories) : null },
            { label: 'Prot',  value: recipe.protein  != null ? `${recipe.protein}g`    : null },
            { label: 'Fett',  value: recipe.fat      != null ? `${recipe.fat}g`        : null },
            { label: 'Kh',    value: recipe.carbs    != null ? `${recipe.carbs}g`      : null },
          ] as { label: string; value: string | null }[]).filter(n => n.value !== null).map((n, i) => (
            <div key={n.label} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '10px 4px',
              borderLeft: i === 0 ? 'none' : '1px solid var(--line)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-50)' }}>{n.label}</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{n.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Allergens */}
      {(() => {
        const ingredientAllergenIds = [...new Set(recipe.ingredients.flatMap(ri => ri.ingredient?.allergens?.map(a => a.id) ?? []))]
        const recipeAllergenIds = (recipe.allergens ?? []).map(a => a.id)
        const allAllergenIds = [...new Set([...ingredientAllergenIds, ...recipeAllergenIds])]
        return allAllergenIds.length > 0 ? (
          <div style={{ margin: '10px 16px 0', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-50)' }}>Innehåller / passar</span>
            {allAllergenIds.map(a => (
              <span key={a} style={{
                padding: '2px 8px', borderRadius: 999,
                border: '1px solid var(--line)', background: 'var(--surface-2)',
                fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-70)',
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>{a}</span>
            ))}
          </div>
        ) : null
      })()}

      {/* Segmented tabs */}
      <div style={{ margin: '14px 20px 8px' }}>
        <div style={{
          display: 'flex', background: 'var(--surface-2)', borderRadius: 999, padding: 3,
        }}>
          {(['ingredients', 'method'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 999,
                border: 'none', cursor: 'pointer',
                background: tab === t ? 'var(--paper)' : 'transparent',
                color: tab === t ? 'var(--ink)' : 'var(--ink-60)',
                fontFamily: 'var(--font-sans)', fontSize: 13,
                fontWeight: tab === t ? 500 : 400,
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t === 'ingredients'
                ? `Ingredienser · ${recipe.ingredients.length}`
                : `Metod · ${steps.length} steg`}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: '8px 20px 20px' }}>
        {tab === 'ingredients' && (
          <>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recipe.ingredients.map((ri, i) => {
              const isOn = !!checked[ri.ingredientMeasurementId]
              return (
                <li
                  key={ri.ingredientMeasurementId}
                  onClick={() => toggle(ri.ingredientMeasurementId)}
                  style={{
                    display: 'grid', gridTemplateColumns: '20px 1fr auto',
                    gap: 12, alignItems: 'center',
                    padding: '13px 0',
                    borderBottom: i < recipe.ingredients.length - 1 ? '1px dotted var(--line)' : 'none',
                    cursor: 'pointer',
                    opacity: isOn ? 0.45 : 1,
                    transition: 'opacity 0.15s',
                  }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: '1.5px solid ' + (isOn ? 'var(--2eat-accent)' : 'var(--ink-30)'),
                    background: isOn ? 'var(--2eat-accent)' : 'transparent',
                    display: 'grid', placeItems: 'center',
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
                    fontFamily: 'var(--font-sans)', fontSize: 14.5, color: 'var(--ink)',
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
          {hasCost && (
            <div style={{
              marginTop: 14, padding: '12px 14px',
              background: 'var(--surface-1)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-50)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Beräknad kostnad
                {pricedIngredients.length < recipe.ingredients.length && (
                  <span style={{ opacity: 0.7 }}> ({pricedIngredients.length}/{recipe.ingredients.length})</span>
                )}
              </span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                ~{Math.round(totalCost)} kr
              </span>
            </div>
          )}
          </>
        )}

        {tab === 'method' && (
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {steps.map((step, i) => (
              <li
                key={i}
                style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr', gap: 14,
                  padding: '14px 0',
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
                  lineHeight: 1.5, color: 'var(--ink)', margin: 0, marginTop: 6,
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

      {/* Sticky CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 16px 36px',
        background: 'linear-gradient(to top, var(--paper) 60%, transparent)',
        zIndex: 40,
      }}>
        <button style={{
          width: '100%', padding: '14px 20px', borderRadius: 999,
          border: 'none', background: 'var(--ink)', color: 'var(--paper)',
          fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
          cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Flame size={16} strokeWidth={1.5} />
            Sätt igång &amp; laga
          </span>
          <ArrowRight size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
