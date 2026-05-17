import { useNavigate, useMatch } from 'react-router-dom'
import { BookOpen, ShoppingBasket, Utensils, Library, Compass } from 'lucide-react'

const TABS = [
  { key: 'utforska',  label: 'Utforska',  Icon: Compass,        to: '/utforska'   },
  { key: 'home',      label: 'Recept',    Icon: BookOpen,       to: '/'           },
  { key: 'skafferi',  label: 'Skafferi',  Icon: ShoppingBasket, to: '/skafferi'   },
  { key: 'plan',      label: 'Plan',      Icon: Utensils,       to: '/veckoplan'  },
  { key: 'samlingar', label: 'Samlingar', Icon: Library,        to: '/samlingar'  },
]

export function MobileTabBar() {
  const navigate = useNavigate()
  const isUtforska  = !!useMatch('/utforska')
  const isHome      = !!useMatch({ path: '/', end: true })
  const isSkafferi  = !!useMatch('/skafferi')
  const isVeckoplan = !!useMatch('/veckoplan')
  const isSamlingar = !!useMatch('/samlingar/*')

  function isActive(key: string) {
    if (key === 'utforska')  return isUtforska
    if (key === 'home')      return isHome
    if (key === 'skafferi')  return isSkafferi
    if (key === 'plan')      return isVeckoplan
    if (key === 'samlingar') return isSamlingar
    return false
  }

  return (
    <nav
      aria-label="Huvudnavigation"
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
        padding: '8px 6px',
        paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
        background: 'color-mix(in oklch, var(--paper) 92%, transparent)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '0.5px solid var(--line)',
        display: 'flex', justifyContent: 'space-around',
      }}
    >
      {TABS.map(({ key, label, Icon, to }) => {
        const active = isActive(key)
        return (
          <button
            key={key}
            onClick={() => navigate(to)}
            aria-label={label}
            style={{
              flex: 1, padding: '6px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: active ? 'var(--2eat-accent-deep)' : 'var(--ink-50)',
              fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 500,
            }}
          >
            <Icon
              size={20}
              strokeWidth={1.5}
              color={active ? 'var(--2eat-accent-deep)' : 'var(--ink-50)'}
            />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
