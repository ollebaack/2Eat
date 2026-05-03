import { Link, NavLink, Outlet } from 'react-router-dom'
import { UtensilsCrossed, BookOpen, Carrot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { to: '/', label: 'Recipes', icon: BookOpen, end: true },
  { to: '/ingredients', label: 'Ingredients', icon: Carrot, end: false },
]

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-card">
        <Link to="/" className="flex items-center gap-2 px-4 py-5">
          <UtensilsCrossed className="h-6 w-6" />
          <span className="text-lg font-bold tracking-tight">2Eat</span>
        </Link>
        <Separator />
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex flex-1 flex-col overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
