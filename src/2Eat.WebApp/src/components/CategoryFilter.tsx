import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: string[]
  active: string
  onChange: (category: string) => void
  className?: string
  scrollable?: boolean
}

export function CategoryFilter({
  categories,
  active,
  onChange,
  className,
  scrollable = false,
}: CategoryFilterProps) {
  return (
    <div
      className={cn(
        'flex gap-[6px] flex-wrap',
        scrollable && 'flex-nowrap overflow-x-auto scrollbar-none',
        className,
      )}
    >
      {categories.map(cat => {
        const isActive = active === cat
        return (
          <Button
            key={cat}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className="rounded-full shrink-0"
            onClick={() => onChange(cat)}
            style={{
              background: isActive ? 'var(--ink)' : 'transparent',
              color: isActive ? 'var(--paper)' : 'var(--ink-70)',
              borderColor: isActive ? 'var(--ink)' : 'var(--line)',
              fontFamily: 'var(--font-sans)',
              fontSize: 12.5,
            }}
          >
            {cat}
          </Button>
        )
      })}
    </div>
  )
}
