import { useState } from 'react'
import { Plus, Loader2, ExternalLink } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Forslag, SamlingListItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PhotoSlot } from '@/components/PhotoSlot'
import { fastAddForslag, getSamlingar } from '@/lib/api'

interface ForslagCardProps {
  forslag: Forslag
}

const SITE_COLORS: Record<string, string> = {
  ICA: '#E3000B',
  Köket: '#F5820A',
  Coop: '#00904A',
}

export function ForslagCard({ forslag }: ForslagCardProps) {
  const [hovered, setHovered] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const queryClient = useQueryClient()

  const { data: samlingar = [] } = useQuery<SamlingListItem[]>({
    queryKey: ['samlingar'],
    queryFn: getSamlingar,
  })

  const addMutation = useMutation({
    mutationFn: () => fastAddForslag(forslag.id, selectedIds),
    onSuccess: (data) => {
      setOpen(false)
      setSelectedIds([])
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success(`"${data.name}" har lagts till i ditt bibliotek`)
    },
    onError: () => {
      toast.error('Kunde inte lägga till receptet — försök igen.')
    },
  })

  const siteColor = SITE_COLORS[forslag.sourceSite] ?? 'var(--ink-50)'

  function toggleSamling(id: number) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col rounded-[18px] overflow-hidden"
      style={{
        background: 'var(--paper)',
        border: `1px solid ${hovered ? 'var(--ink-30)' : 'var(--line)'}`,
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'transform 200ms, border-color 200ms, box-shadow 200ms',
        boxShadow: hovered ? '0 8px 24px -16px rgba(0,0,0,0.18)' : 'none',
      }}
    >
      {/* Card image — tapping opens source URL */}
      <a
        href={forslag.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative no-underline"
        aria-label={`Öppna ${forslag.title} på ${forslag.sourceSite}`}
      >
        <PhotoSlot
          imageUrl={forslag.imageUrl ?? undefined}
          swatch="#e8e0d8"
          aspect="5/4"
        />
        {/* Source badge */}
        <span
          className="absolute top-3 left-3 rounded-full px-2 py-0.5 text-white"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.06em',
            background: siteColor,
          }}
        >
          {forslag.sourceSite}
        </span>
        <span className="absolute top-3 right-3 rounded-full p-1.5 bg-paper/80 backdrop-blur-sm">
          <ExternalLink size={12} strokeWidth={1.5} className="text-ink-50" />
        </span>
      </a>

      {/* Card body */}
      <div className="p-[18px] flex items-start justify-between gap-3">
        <a
          href={forslag.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 no-underline min-w-0"
        >
          <h3
            className="text-ink m-0 font-normal leading-[1.15] line-clamp-2"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: '-0.02em' }}
          >
            {forslag.title}
          </h3>
        </a>

        {/* Fast-add button + Samling picker */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              className="shrink-0 rounded-full h-9 w-9 border-0 shadow-sm"
              style={{ background: 'var(--2eat-accent)', color: 'var(--paper)' }}
              aria-label={`Lägg till ${forslag.title}`}
              onClick={e => e.stopPropagation()}
            >
              <Plus size={16} strokeWidth={2.5} />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 p-3"
            align="end"
            onClick={e => e.stopPropagation()}
          >
            <p
              className="mb-2"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-50)' }}
            >
              Lägg till i samling
            </p>

            {samlingar.length === 0 ? (
              <p className="text-ink-50 text-xs py-1">Inga samlingar ännu</p>
            ) : (
              <div className="flex flex-col gap-1 mb-3">
                {samlingar.map(s => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 cursor-pointer rounded-md px-1.5 py-1 hover:bg-surface-1"
                  >
                    <Checkbox
                      id={`samling-${s.id}`}
                      checked={selectedIds.includes(s.id)}
                      onCheckedChange={() => toggleSamling(s.id)}
                    />
                    <span className="text-sm text-ink truncate">{s.name}</span>
                  </label>
                ))}
              </div>
            )}

            <Button
              className="w-full"
              size="sm"
              style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
              disabled={addMutation.isPending}
              onClick={(_e: React.MouseEvent) => addMutation.mutate()}
            >
              {addMutation.isPending ? (
                <><Loader2 size={14} className="animate-spin mr-1.5" /> Hämtar recept…</>
              ) : (
                'Lägg till recept'
              )}
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </article>
  )
}
