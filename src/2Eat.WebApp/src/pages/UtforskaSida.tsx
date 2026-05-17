import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { RefreshCw, Compass } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Button } from '@/components/ui/button'
import { ForslagCard } from '@/components/ForslagCard'
import { getUtforskaForslag, refreshForslagPool } from '@/lib/api'
import type { Forslag } from '@/types'

export function UtforskaSida() {
  const isMobile = useIsMobile()
  const [page, setPage] = useState(0)
  const [allForslag, setAllForslag] = useState<Forslag[]>([])

  const { isLoading, isFetching, refetch } = useQuery({
    queryKey: ['utforska', page],
    queryFn: async () => {
      const items = await getUtforskaForslag()
      if (page === 0) {
        setAllForslag(items)
      } else {
        setAllForslag(prev => {
          const existingIds = new Set(prev.map(f => f.id))
          return [...prev, ...items.filter(f => !existingIds.has(f.id))]
        })
      }
      return items
    },
    staleTime: 0,
  })

  const refreshMutation = useMutation({
    mutationFn: refreshForslagPool,
    onSuccess: (data) => {
      toast.success(data.message)
      setPage(0)
      setAllForslag([])
      refetch()
    },
    onError: (err: Error) => {
      if (err.message.startsWith('429')) {
        toast.error('Uppdatering blockerad — vänta 30 minuter innan nästa försök.')
      } else {
        toast.error('Uppdateringen misslyckades.')
      }
    },
  })

  const hasMore = allForslag.length > 0 && allForslag.length % 25 === 0

  const pageTitle = isMobile ? null : (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1
          className="m-0 font-normal"
          style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.03em', color: 'var(--ink)' }}
        >
          Utforska
        </h1>
        <p
          className="m-0 mt-1"
          style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-50)' }}
        >
          Recept från ICA, Köket och Coop — lägg till dem i ditt bibliotek
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-ink-50"
        disabled={refreshMutation.isPending}
        onClick={() => refreshMutation.mutate()}
        title="Uppdatera receptpoolen (max var 30:e minut)"
      >
        <RefreshCw size={14} strokeWidth={1.5} className={refreshMutation.isPending ? 'animate-spin' : ''} />
        Uppdatera
      </Button>
    </div>
  )

  const mobileHeader = isMobile ? (
    <div
      className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
      style={{
        background: 'color-mix(in oklch, var(--paper) 92%, transparent)',
        backdropFilter: 'blur(20px)',
        borderBottom: '0.5px solid var(--line)',
      }}
    >
      <div className="flex items-center gap-2">
        <Compass size={18} strokeWidth={1.5} className="text-ink-50" />
        <h1 className="m-0 font-normal" style={{ fontFamily: 'var(--font-serif)', fontSize: 20, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          Utforska
        </h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        disabled={refreshMutation.isPending}
        onClick={() => refreshMutation.mutate()}
        title="Uppdatera"
      >
        <RefreshCw size={15} strokeWidth={1.5} className={refreshMutation.isPending ? 'animate-spin' : ''} />
      </Button>
    </div>
  ) : null

  if (isLoading && allForslag.length === 0) {
    return (
      <div style={{ padding: isMobile ? '0' : '32px 40px' }}>
        {mobileHeader}
        <div style={{ padding: isMobile ? '24px 16px' : '0' }}>
          {pageTitle}
          <SkeletonGrid />
        </div>
      </div>
    )
  }

  if (!isLoading && allForslag.length === 0) {
    return (
      <div style={{ padding: isMobile ? '0' : '32px 40px' }}>
        {mobileHeader}
        <div style={{ padding: isMobile ? '40px 16px' : '0', textAlign: 'center' }}>
          {pageTitle}
          <Compass size={40} strokeWidth={1} className="text-ink-30 mx-auto mb-4" />
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--ink)', marginBottom: 8 }}>
            Inga förslag än
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-50)', marginBottom: 20 }}>
            Tryck på Uppdatera för att hämta recept från ICA, Köket och Coop.
          </p>
          <Button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
          >
            <RefreshCw size={14} className={`mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Hämta förslag
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: isMobile ? '0' : '32px 40px' }}>
      {mobileHeader}
      <div style={{ padding: isMobile ? '16px' : '0' }}>
        {pageTitle}

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(240px, 1fr))' }}
        >
          {allForslag.map(f => (
            <ForslagCard key={f.id} forslag={f} />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button
              variant="ghost"
              disabled={isFetching}
              onClick={() => setPage(p => p + 1)}
              className="gap-2"
            >
              {isFetching
                ? <><RefreshCw size={14} className="animate-spin" /> Laddar…</>
                : 'Visa fler förslag'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[18px] overflow-hidden animate-pulse"
          style={{ background: 'var(--surface-2)', aspectRatio: '5/6' }}
        />
      ))}
    </div>
  )
}
