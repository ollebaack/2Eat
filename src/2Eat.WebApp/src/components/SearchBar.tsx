import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = 'Sök…', className }: SearchBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-[10px] px-4 bg-surface-1 border border-line rounded-full',
        className,
      )}
    >
      <Search size={15} strokeWidth={1.5} className="text-ink-50 shrink-0" />
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 text-ink"
        style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5 }}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-ink-50"
          onClick={() => onChange('')}
        >
          <X size={14} />
        </Button>
      )}
    </div>
  )
}
