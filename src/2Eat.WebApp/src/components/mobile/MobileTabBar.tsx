import { useNavigate, useMatch } from 'react-router-dom'
import { BookOpen, Search, UtensilsCrossed, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Tab {
  key: string
  label: string
  icon: LucideIcon
  to: string
  matchPath: string
  end?: boolean
}

const TABS: Tab[] = [
  { key: 'home',        label: 'Recept',      icon: BookOpen,        to: '/',             matchPath: '/',             end: true  },
  { key: 'ingredients', label: 'Ingredienser', icon: Search,          to: '/ingredients',  matchPath: '/ingredients',  end: false },
  { key: 'new',         label: 'Nytt',         icon: UtensilsCrossed, to: '/recipes/new',  matchPath: '/recipes/new',  end: false },
  { key: 'me',          label: 'Mig',          icon: Users,           to: '',              matchPath: '/__never__',    end: false },
]

export function MobileTabBar() {
  const navigate = useNavigate()
  const isHome        = !!useMatch({ path: '/', end: true })
  const isIngredients = !!useMatch('/ingredients')
  const isNew         = !!useMatch('/recipes/new')

  function isActive(tab: Tab) {
    if (tab.key === 'home')        return isHome
    if (tab.key === 'ingredients') return isIngredients
    if (tab.key === 'new')         return isNew
    return false
  }

  return (
    <nav
      aria-label="Huvudnavigation"
      style={{
        position: 'fixed', left: 12, right: 12, bottom: 18, zIndex: 40,
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
        const active = isActive(tab)
        const Icon = tab.icon
        return (
          <button
            key={tab.key}
            onClick={() => tab.to && navigate(tab.to)}
            aria-label={tab.label}
            style={{
              flex: 1, padding: '6px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 500,
              color: active ? 'var(--2eat-accent-deep)' : 'var(--ink-50)',
            }}
          >
            <Icon
              size={20}
              strokeWidth={1.5}
              color={active ? 'var(--2eat-accent-deep)' : 'var(--ink-50)'}
            />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
