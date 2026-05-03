import { useState, useEffect } from 'react'
import { NavLink, Outlet, Link, useNavigate, useMatch } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen, Carrot, Calendar, ShoppingBasket, Moon, Sun } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { MobileTabBar } from '@/components/mobile/MobileTabBar'

const navItems = [
  { to: '/',            label: 'Recept',       icon: BookOpen,       end: true  },
  { to: '/ingredients', label: 'Ingredienser', icon: Carrot,         end: false },
  { to: '/veckoplan',   label: 'Veckoplan',    icon: Calendar,       end: false },
  { to: '/skafferi',    label: 'Skafferi',     icon: ShoppingBasket, end: false },
]

function NavItem({ to, label, icon: Icon, end }: { to: string; label: string; icon: LucideIcon; end: boolean }) {
  const active = useMatch(end ? { path: to, end: true } : to)
  const isActive = !!active
  return (
    <NavLink
      to={to}
      end={end}
      className="flex items-center gap-3 rounded-lg no-underline transition-colors relative"
      style={{
        padding: '9px 10px',
        background: isActive ? 'var(--surface-2)' : 'transparent',
        color: isActive ? 'var(--ink)' : 'var(--ink-60)',
        fontFamily: 'var(--font-sans)', fontSize: 13.5,
        fontWeight: isActive ? 500 : 400,
      }}
    >
      {isActive && (
        <span
          className="absolute rounded-sm"
          style={{ left: -14, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, background: 'var(--2eat-accent)' }}
        />
      )}
      <Icon size={16} strokeWidth={1.5} style={{ color: isActive ? 'var(--ink)' : 'var(--ink-50)' }} />
      <span>{label}</span>
    </NavLink>
  )
}

const collections = [
  { key: 'favs', label: 'Favoriter',  count: 12 },
  { key: 'mid',  label: 'Vardagsmat', count: 38 },
  { key: 'fika', label: 'Fika og bak', count: 9  },
  { key: 'hi',   label: 'Helgmiddag', count: 7  },
]

export function Layout() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme')
    return stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  if (isMobile) {
    return (
      <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
        <main>
          <Outlet />
        </main>
        <MobileTabBar />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--surface-1)' }}>
      <aside
        className="flex flex-col shrink-0 sticky top-0 h-screen"
        style={{ width: 248, background: 'var(--paper)', borderRight: '1px solid var(--line)', zIndex: 10 }}
      >
        <Link to="/" className="flex items-center gap-2.5 no-underline" style={{ padding: '22px 22px 16px' }}>
          <div
            className="grid place-items-center rounded-lg shrink-0"
            style={{
              width: 30, height: 30, background: 'var(--ink)', color: 'var(--paper)',
              fontFamily: 'var(--font-serif)', fontSize: 19, letterSpacing: '-0.04em',
            }}
          >2</div>
          <div className="flex flex-col" style={{ lineHeight: 1.05 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: '-0.03em', color: 'var(--ink)' }}>2Eat</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--ink-50)', textTransform: 'uppercase', marginTop: 2 }}>
              Hemkokboken
            </span>
          </div>
        </Link>

        <div className="px-3.5">
          <Button
            className="w-full rounded-full gap-2"
            style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none', fontFamily: 'var(--font-sans)', fontSize: 13 }}
            onClick={() => navigate('/recipes/new')}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--2eat-accent-deep)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--2eat-accent)')}
          >
            <Plus size={15} />
            Nytt recept
          </Button>
        </div>

        <div style={{ padding: '22px 14px 6px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-50)', padding: '0 10px 8px', margin: 0 }}>
            Bibliotek
          </p>
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>
        </div>

        <div style={{ padding: '14px 14px 6px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-50)', padding: '0 10px 8px', margin: 0 }}>
            Samlingar
          </p>
          <nav className="flex flex-col gap-0.5">
            {collections.map(c => (
              <Button
                key={c.key}
                variant="ghost"
                className="w-full justify-between rounded-lg px-2.5 h-auto py-[7px]"
                style={{ color: 'var(--ink-60)', fontFamily: 'var(--font-sans)', fontSize: 13 }}
              >
                <span className="flex items-center gap-2.5">
                  <span className="inline-block rounded-sm" style={{ width: 6, height: 6, background: 'var(--ink-30)' }} />
                  {c.label}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-40)' }}>{c.count}</span>
              </Button>
            ))}
          </nav>
        </div>

        <div className="mt-auto flex items-center gap-2.5" style={{ padding: '14px 18px 18px', borderTop: '1px solid var(--line)' }}>
          <div
            className="shrink-0 grid place-items-center rounded-full"
            style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, var(--2eat-accent), var(--2eat-accent-deep))',
              color: 'var(--paper)', fontFamily: 'var(--font-serif)', fontSize: 14,
            }}
          >EL</div>
          <div className="flex flex-col" style={{ lineHeight: 1.2 }}>
            <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>Elsa Lindqvist</span>
            <span style={{ fontSize: 11, color: 'var(--ink-50)' }}>Hemkokboken</span>
          </div>
          <button
            onClick={() => setIsDark(d => !d)}
            title={isDark ? 'Byt till ljust läge' : 'Byt till mörkt läge'}
            style={{
              marginLeft: 'auto',
              width: 32, height: 32,
              borderRadius: '50%',
              border: '1px solid var(--line)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'grid', placeItems: 'center',
              color: 'var(--ink-60)',
              flexShrink: 0,
            }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
