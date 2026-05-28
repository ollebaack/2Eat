import { useNavigate, useMatch } from 'react-router-dom'
import { BookOpen, ShoppingBasket, Utensils, Library, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TABS = [
  { key: 'utforska',  label: 'Utforska',  Icon: Compass,        to: '/'          },
  { key: 'home',      label: 'Recept',    Icon: BookOpen,       to: '/recept'    },
  { key: 'skafferi',  label: 'Skafferi',  Icon: ShoppingBasket, to: '/skafferi'  },
  { key: 'plan',      label: 'Plan',      Icon: Utensils,       to: '/veckoplan' },
  { key: 'samlingar', label: 'Samlingar', Icon: Library,        to: '/samlingar' },
]

export function MobileTabBar() {
  const navigate = useNavigate()
  const isUtforska  = !!useMatch({ path: '/', end: true })
  const isHome      = !!useMatch('/recept')
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
          <Button
            key={key}
            variant="ghost"
            onClick={() => navigate(to)}
            aria-label={label}
            className="h-auto flex-1 flex-col gap-[3px] py-1.5 px-0 rounded-lg text-[10.5px] font-medium"
            style={{
              color: active ? 'var(--2eat-accent-deep)' : 'var(--ink-50)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span>{label}</span>
          </Button>
        )
      })}
    </nav>
  )
}
