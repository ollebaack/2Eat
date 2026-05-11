import { useNavigate, useMatch } from 'react-router-dom'
import { BookOpen, Search, Utensils, Users } from 'lucide-react'

const TABS = [
  { key: 'home',   label: 'Recept', Icon: BookOpen, to: '/'          },
  { key: 'search', label: 'Sök',    Icon: Search,   to: '/?search=1' },
  { key: 'plan',   label: 'Plan',   Icon: Utensils, to: '/veckoplan' },
  { key: 'me',     label: 'Mig',    Icon: Users,    to: '/profile'   },
]

export function MobileTabBar() {
  const navigate = useNavigate()
  const isHome      = !!useMatch({ path: '/', end: true })
  const isVeckoplan = !!useMatch('/veckoplan')
  const isProfile   = !!useMatch('/profile')

  function isActive(key: string) {
    if (key === 'home')   return isHome
    if (key === 'plan')   return isVeckoplan
    if (key === 'me')     return isProfile
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
