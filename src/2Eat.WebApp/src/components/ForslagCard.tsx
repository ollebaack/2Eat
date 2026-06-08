import { useState } from 'react'
import { Plus, Loader2, ArrowUpRight } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Forslag, SamlingListItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { PhotoSlot } from '@/components/PhotoSlot'
import { fastAddForslag, getSamlingar } from '@/lib/api'

export interface MatchInfo {
  score: number      // 0–1 fraction of ingredients matched
  missing: string[]  // lowercase ingredient name strings not in Skafferi
}

interface ForslagCardProps {
  forslag: Forslag
  matchInfo?: MatchInfo
}

const SITE_COLORS: Record<string, string> = {
  ICA: '#E3000B',
  Köket: '#F5820A',
  Coop: '#00904A',
}

function sourceDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function ForslagCard({ forslag, matchInfo }: ForslagCardProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const queryClient = useQueryClient()

  const { data: samlingar = [] } = useQuery<SamlingListItem[]>({
    queryKey: ['samlingar'],
    queryFn: getSamlingar,
  })

  const addMutation = useMutation({
    mutationFn: () => fastAddForslag(forslag.id, selectedIds),
    onSuccess: (data) => {
      setPopoverOpen(false)
      setSelectedIds([])
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success(`"${data.name}" har lagts till i ditt bibliotek`)
    },
    onError: () => {
      toast.error('Kunde inte lägga till receptet — försök igen.')
    },
  })

  const siteColor = SITE_COLORS[forslag.sourceSite] ?? 'var(--ink-50)'
  const domain = sourceDomain(forslag.sourceUrl)

  function toggleSamling(id: number) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const matchPct = matchInfo ? Math.round(matchInfo.score * 100) : null

  return (
    <article
      className="flex flex-col rounded-[18px] overflow-hidden"
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
      }}
    >
      {/* Image — tapping opens preview dialog */}
      <button
        className="block relative w-full bg-transparent p-0 border-0 cursor-pointer text-left"
        onClick={() => setDialogOpen(true)}
        aria-label={`Förhandsgranska ${forslag.title}`}
      >
        <PhotoSlot
          imageUrl={forslag.imageUrl ?? undefined}
          swatch="#e8e0d8"
          aspect="4/3"
        />
        {/* Source badge — bottom-left of image */}
        <span
          className="absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-white"
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
        {/* Missing count badge — top-right of image */}
        {matchInfo && matchInfo.missing.length > 0 && (
          <span
            className="absolute top-3 right-3 rounded-full px-2.5 py-1"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.04em',
              background: 'rgba(20,18,14,0.82)',
              color: '#fff',
              backdropFilter: 'blur(4px)',
            }}
          >
            Saknas: {matchInfo.missing.length}
          </span>
        )}
      </button>

      {/* Card body */}
      <div className="p-5 flex flex-col gap-3">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <button
            className="flex-1 text-left bg-transparent border-0 p-0 cursor-pointer min-w-0"
            onClick={() => setDialogOpen(true)}
          >
            <h3
              className="text-ink m-0 font-normal leading-[1.2]"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: '-0.02em' }}
            >
              {forslag.title}
            </h3>
          </button>

          {/* Fast-add button + Samling picker */}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                className="shrink-0 rounded-full h-10 w-10 border-0 shadow-sm"
                style={{ background: 'var(--2eat-accent)', color: 'var(--paper)' }}
                aria-label={`Lägg till ${forslag.title}`}
                onClick={e => e.stopPropagation()}
              >
                <Plus size={18} strokeWidth={2.5} />
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
                onClick={() => addMutation.mutate()}
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

        {/* Match info row — only in filter mode */}
        {matchInfo && (
          <div className="flex flex-col gap-2">
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10.5,
                color: matchPct! >= 80 ? 'var(--2eat-accent-deep)' : 'var(--ink-50)',
                letterSpacing: '0.04em',
              }}
            >
              {matchPct}% matchar
            </span>
            {matchInfo.missing.length > 0 && (
              <div className="flex flex-col gap-1">
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9.5,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-40)',
                  }}
                >
                  Köp till
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {matchInfo.missing.map(name => (
                    <span
                      key={name}
                      className="rounded-full px-2.5 py-0.5"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.04em',
                        background: 'var(--surface-1)',
                        border: '1px solid var(--line)',
                        color: 'var(--ink-70)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Source line */}
        <a
          href={forslag.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline flex items-center gap-1 self-start"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', letterSpacing: '0.04em' }}
        >
          {domain}
          <ArrowUpRight size={12} strokeWidth={1.5} />
        </a>
      </div>

      <ForslagPreviewDialog
        forslag={forslag}
        matchInfo={matchInfo}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </article>
  )
}

interface ForslagPreviewDialogProps {
  forslag: Forslag
  matchInfo?: MatchInfo
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ForslagPreviewDialog({ forslag, matchInfo, open, onOpenChange }: ForslagPreviewDialogProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const queryClient = useQueryClient()

  const { data: samlingar = [] } = useQuery<SamlingListItem[]>({
    queryKey: ['samlingar'],
    queryFn: getSamlingar,
    enabled: open,
  })

  const addMutation = useMutation({
    mutationFn: () => fastAddForslag(forslag.id, selectedIds),
    onSuccess: (data) => {
      onOpenChange(false)
      setSelectedIds([])
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success(`"${data.name}" har lagts till i ditt bibliotek`)
    },
    onError: () => {
      toast.error('Kunde inte lägga till receptet — försök igen.')
    },
  })

  function toggleSamling(id: number) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handleOpenChange(next: boolean) {
    if (!next) setSelectedIds([])
    onOpenChange(next)
  }

  const siteColor = SITE_COLORS[forslag.sourceSite] ?? 'var(--ink-50)'
  const matchPct = matchInfo ? Math.round(matchInfo.score * 100) : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="p-0 overflow-hidden [&>button:last-child]:z-10 [&>button:last-child]:rounded-full [&>button:last-child]:bg-black/50 [&>button:last-child]:text-white [&>button:last-child]:p-1.5 [&>button:last-child]:opacity-90 [&>button:last-child]:hover:opacity-100"
        style={{
          background: 'var(--paper)',
          borderRadius: 18,
          maxWidth: 440,
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          padding: 0,
          maxHeight: '92dvh',
          overflow: 'hidden',
        }}
      >
        {/* Full-bleed image */}
        <div className="relative shrink-0">
          <PhotoSlot
            imageUrl={forslag.imageUrl ?? undefined}
            swatch="#e8e0d8"
            aspect="4/3"
          />
          <span
            className="absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-white"
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
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-4">
          <h2
            className="m-0 font-normal leading-[1.2]"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 24, letterSpacing: '-0.025em', color: 'var(--ink)' }}
          >
            {forslag.title}
          </h2>

          {/* Match info */}
          {matchInfo && (
            <div className="flex flex-col gap-2">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: matchPct! >= 80 ? 'var(--2eat-accent-deep)' : 'var(--ink-50)', letterSpacing: '0.04em' }}>
                {matchPct}% matchar
              </span>
              {matchInfo.missing.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-40)' }}>
                    Köp till
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchInfo.missing.map(name => (
                      <span
                        key={name}
                        className="rounded-full px-2.5 py-0.5"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.04em', background: 'var(--surface-1)', border: '1px solid var(--line)', color: 'var(--ink-70)', textTransform: 'capitalize' }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ingredients */}
          {forslag.ingredientNames.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-40)' }}>
                Ingredienser
              </span>
              <div className="flex flex-wrap gap-1.5">
                {forslag.ingredientNames.map(name => (
                  <span
                    key={name}
                    className="rounded-full px-2.5 py-0.5"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.04em', background: 'var(--surface-1)', border: '1px solid var(--line)', color: 'var(--ink-70)', textTransform: 'capitalize' }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Collection picker */}
          {samlingar.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-40)' }}>
                Lägg till i samling
              </span>
              <div className="flex flex-col">
                {samlingar.map(s => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 hover:bg-surface-1"
                  >
                    <Checkbox
                      id={`preview-samling-${s.id}`}
                      checked={selectedIds.includes(s.id)}
                      onCheckedChange={() => toggleSamling(s.id)}
                    />
                    <span className="text-sm" style={{ color: 'var(--ink)' }}>{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button variant="outline" className="flex-1 rounded-full gap-1.5" asChild>
              <a href={forslag.sourceUrl} target="_blank" rel="noopener noreferrer">
                <ArrowUpRight size={14} strokeWidth={1.5} />
                Gå till originalet
              </a>
            </Button>
            <Button
              className="flex-1 rounded-full gap-1.5"
              style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
              disabled={addMutation.isPending}
              onClick={() => addMutation.mutate()}
            >
              {addMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} strokeWidth={2.5} />
              )}
              Lägg till recept
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
