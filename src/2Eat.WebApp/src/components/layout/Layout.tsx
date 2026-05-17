import { NavLink, Outlet, Link, useNavigate, useMatch } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen, Settings, Calendar, ShoppingBasket, Moon, Sun, LogOut, Library, Compass } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useTheme } from '@/hooks/useTheme'
import { MobileTabBar } from '@/components/mobile/MobileTabBar'
import { useAuth } from '@/context/AuthContext'
import { getSamlingar } from '@/lib/api'
import { AuthImg } from '@/components/AuthImg'

const navItems = [
  { to: '/',            label: 'Utforska',      icon: Compass,        end: true  },
  { to: '/recept',      label: 'Recept',        icon: BookOpen,       end: false },
  { to: '/veckoplan',   label: 'Veckoplan',     icon: Calendar,       end: false },
  { to: '/skafferi',    label: 'Skafferi',      icon: ShoppingBasket, end: false },
  { to: '/samlingar',   label: 'Samlingar',     icon: Library,        end: false },
  { to: '/settings',    label: 'Inställningar', icon: Settings,       end: false },
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

export function Layout() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { data: samlingar } = useQuery({ queryKey: ['samlingar'], queryFn: getSamlingar })
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const { isDark, setIsDark } = useTheme()
  const isNewRecipe  = !!useMatch('/recipes/new')
  const isEditRecipe = !!useMatch('/recipes/:id/edit')
  const isRecipeForm = isNewRecipe || isEditRecipe

  if (isMobile) {
    return (
      <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
        <main style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
          <Outlet />
        </main>
        {!isRecipeForm && (
          <Button
            size="icon"
            onClick={() => navigate('/recipes/new')}
            aria-label="Nytt recept"
            className="fixed rounded-full h-[52px] w-[52px] border-0 shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom) + 76px)',
              right: 20,
              zIndex: 40,
              background: 'var(--2eat-accent)',
              color: 'var(--paper)',
            }}
          >
            <Plus size={22} strokeWidth={2} />
          </Button>
        )}
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
            className="grid place-items-center shrink-0"
            style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8956 100%)',
              borderRadius: 9,
              fontFamily: '"Manrope", sans-serif', fontSize: 20, fontWeight: 800,
              color: 'white',
            }}
          >2</div>
          <div className="flex flex-col" style={{ lineHeight: 1.05 }}>
            <span style={{ fontFamily: '"Manrope", sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--ink)' }}>Eat</span>
            <span style={{ fontFamily: '"Manrope", sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '1.5px', color: 'var(--ink-50)', textTransform: 'uppercase', marginTop: 2 }}>
              Hemmakoken
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

        {samlingar && samlingar.length > 0 && (
          <div style={{ padding: '14px 14px 6px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-50)', padding: '0 10px 8px', margin: 0 }}>
              Mina samlingar
            </p>
            <nav className="flex flex-col gap-0.5">
              {samlingar.map(s => (
                <NavLink
                  key={s.id}
                  to={`/samlingar/${s.id}`}
                  className="flex items-center gap-2.5 rounded-lg no-underline transition-colors"
                  style={({ isActive }) => ({
                    padding: '7px 10px',
                    background: isActive ? 'var(--surface-2)' : 'transparent',
                    color: isActive ? 'var(--ink)' : 'var(--ink-60)',
                    fontFamily: 'var(--font-sans)', fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                  })}
                >
                  <span className="inline-block rounded-sm" style={{ width: 6, height: 6, background: 'var(--ink-30)', flexShrink: 0 }} />
                  {s.name}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 flex-wrap" style={{ padding: '14px 18px 18px', borderTop: '1px solid var(--line)' }}>
          {user?.avatarUrl ? (
            <AuthImg
              src={user.avatarUrl}
              alt={user.displayName}
              className="shrink-0 rounded-full"
              style={{ width: 32, height: 32, objectFit: 'cover' }}
            />
          ) : (
            <div
              className="shrink-0 grid place-items-center rounded-full"
              style={{
                width: 32, height: 32,
                background: 'linear-gradient(135deg, var(--2eat-accent), var(--2eat-accent-deep))',
                color: 'var(--paper)', fontFamily: 'var(--font-serif)', fontSize: 14,
              }}
            >
              {user?.displayName?.slice(0, 2).toUpperCase() ?? '??'}
            </div>
          )}
          <div
            className="flex flex-col min-w-0 flex-1 cursor-pointer"
            style={{ lineHeight: 1.2 }}
            onClick={() => navigate('/settings')}
          >
            <span className="truncate" style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>
              {user?.displayName ?? ''}
            </span>
            <span style={{ fontSize: 11, color: 'var(--ink-50)' }}>Min profil</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(d => !d)}
            title={isDark ? 'Byt till ljust läge' : 'Byt till mörkt läge'}
            className="rounded-full h-8 w-8 border border-[var(--line)] text-[var(--ink-60)] shrink-0"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logga ut"
            className="rounded-full h-8 w-8 border border-[var(--line)] text-[var(--ink-60)] shrink-0"
          >
            <LogOut size={15} />
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
