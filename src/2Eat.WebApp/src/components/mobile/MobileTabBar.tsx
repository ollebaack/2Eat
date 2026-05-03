import { useNavigate, useMatch } from 'react-router-dom'

const TABS = [
  { key: 'home',        label: 'Recept',      icon: '📖', to: '/'            },
  { key: 'ingredients', label: 'Ingredienser', icon: '🥕', to: '/ingredients' },
  { key: 'veckoplan',   label: 'Plan',         icon: '📅', to: '/veckoplan'   },
  { key: 'me',          label: 'Profil',       icon: '👤', to: ''             },
]

export function MobileTabBar() {
  const navigate = useNavigate()
  const isHome        = !!useMatch({ path: '/', end: true })
  const isIngredients = !!useMatch('/ingredients')
  const isVeckoplan   = !!useMatch('/veckoplan')

  function isActive(key: string) {
    if (key === 'home')        return isHome
    if (key === 'ingredients') return isIngredients
    if (key === 'veckoplan')   return isVeckoplan
    return false
  }

  return (
    <nav
      aria-label="Huvudnavigation"
      style={{
        position: 'fixed', left: 12, right: 12, bottom: 18, zIndex: 50,
        borderRadius: 28, padding: '8px 6px',
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '0.5px solid rgba(0,0,0,0.06)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        display: 'flex', justifyContent: 'space-around',
      }}
    >
      {TABS.map(tab => {
        const active = isActive(tab.key)
        return (
          <button
            key={tab.key}
            onClick={() => tab.to && navigate(tab.to)}
            aria-label={tab.label}
            style={{
              flex: 1, padding: '6px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: active ? 'var(--2eat-accent-deep)' : 'var(--ink-50)',
              fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 500,
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
