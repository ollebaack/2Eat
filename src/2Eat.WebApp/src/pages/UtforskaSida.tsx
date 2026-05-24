import { useState, useRef, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { RefreshCw, Compass } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Button } from '@/components/ui/button'
import { ForslagCard, type MatchInfo } from '@/components/ForslagCard'
import { getUtforskaForslag, getAllUnseenForslag, refreshForslagPool, getPantryItems } from '@/lib/api'
import type { Forslag } from '@/types'

function scoreForslag(forslag: Forslag, skafferiNames: string[]): MatchInfo {
  if (forslag.ingredientNames.length === 0) {
    return { score: 0, missing: [] }
  }
  const lowerSkafferi = skafferiNames.map(n => n.toLowerCase())
  const missing = forslag.ingredientNames.filter(
    ing => !lowerSkafferi.some(s => ing.includes(s) || s.includes(ing))
  )
  const score = (forslag.ingredientNames.length - missing.length) / forslag.ingredientNames.length
  return { score, missing }
}

export function UtforskaSida() {
  const isMobile = useIsMobile()
  const [page, setPage] = useState(0)
  const [allForslag, setAllForslag] = useState<Forslag[]>([])
  const [filterActive, setFilterActive] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Normal paginated feed
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
    enabled: !filterActive,
  })

  // Filter mode — fetch all unseen once
  const { data: allUnseen, isLoading: isLoadingAll } = useQuery({
    queryKey: ['utforska', 'all'],
    queryFn: getAllUnseenForslag,
    staleTime: 0,
    enabled: filterActive,
  })

  // Skafferi for ingredient matching
  const { data: pantryItems = [] } = useQuery({
    queryKey: ['pantry'],
    queryFn: getPantryItems,
    enabled: filterActive,
  })

  const skafferiNames = useMemo(
    () => pantryItems.map(p => p.name),
    [pantryItems]
  )

  // Scored + sorted Förslag for filter mode
  const filteredForslag = useMemo(() => {
    if (!filterActive || !allUnseen) return null
    return allUnseen
      .map(f => ({ forslag: f, matchInfo: scoreForslag(f, skafferiNames) }))
      .sort((a, b) => b.matchInfo.score - a.matchInfo.score)
  }, [filterActive, allUnseen, skafferiNames])

  const refreshMutation = useMutation({
    mutationFn: refreshForslagPool,
    onSuccess: (data) => {
      toast.success(data.message)
      setPage(0)
      setAllForslag([])
      refetch()
    },
    onError: () => {
      toast.error('Uppdateringen misslyckades.')
    },
  })

  const hasMore = !filterActive && allForslag.length > 0 && allForslag.length % 10 === 0

  useEffect(() => {
    if (!hasMore || isFetching) return
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setPage(p => p + 1) },
      { threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isFetching])

  function toggleFilter() {
    setFilterActive(v => !v)
  }

  const filterChip = (
    <Button
      variant="ghost"
      onClick={toggleFilter}
      className="h-auto rounded-full px-[14px] py-[6px] font-mono text-[10.5px] uppercase tracking-[0.06em] whitespace-nowrap"
      style={{
        border: filterActive ? '1px solid var(--2eat-accent)' : '1px dashed var(--ink-30)',
        ...(filterActive && { background: 'color-mix(in oklch, var(--2eat-accent) 12%, transparent)' }),
        color: filterActive ? 'var(--2eat-accent-deep)' : 'var(--ink-50)',
        transition: 'all 0.15s',
      }}
    >
      Från skafferiet
    </Button>
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
      <div className="flex items-center gap-2">
        {filterChip}
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
    </div>
  ) : null

  const desktopHeader = !isMobile ? (
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
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-ink-50"
          disabled={refreshMutation.isPending}
          onClick={() => refreshMutation.mutate()}
          title="Uppdatera receptpoolen"
        >
          <RefreshCw size={14} strokeWidth={1.5} className={refreshMutation.isPending ? 'animate-spin' : ''} />
          Uppdatera
        </Button>
      </div>
    </div>
  ) : null

  const desktopFilterBar = !isMobile ? (
    <div className="flex items-center gap-3 mb-6">
      {filterChip}
    </div>
  ) : null

  const loading = filterActive ? isLoadingAll : (isLoading && allForslag.length === 0)
  const displayList = filterActive ? filteredForslag : allForslag

  if (loading) {
    return (
      <div style={{ padding: isMobile ? '0' : '32px 40px' }}>
        {mobileHeader}
        <div style={{ padding: isMobile ? '16px' : '0' }}>
          {desktopHeader}
          {desktopFilterBar}
          <SkeletonFeed />
        </div>
      </div>
    )
  }

  const isEmpty = filterActive
    ? filteredForslag !== null && filteredForslag.length === 0
    : !isLoading && allForslag.length === 0

  if (isEmpty) {
    return (
      <div style={{ padding: isMobile ? '0' : '32px 40px' }}>
        {mobileHeader}
        <div style={{ padding: isMobile ? '40px 16px' : '0', textAlign: 'center' }}>
          {desktopHeader}
          {desktopFilterBar}
          <Compass size={40} strokeWidth={1} className="text-ink-30 mx-auto mb-4" />
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--ink)', marginBottom: 8 }}>
            {filterActive ? 'Inga förslag matchar skafferiet' : 'Inga förslag än'}
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-50)', marginBottom: 20 }}>
            {filterActive
              ? 'Lägg till fler varor i skafferiet eller uppdatera receptpoolen.'
              : 'Tryck på Uppdatera för att hämta recept från ICA, Köket och Coop.'}
          </p>
          {!filterActive && (
            <Button
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
            >
              <RefreshCw size={14} className={`mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              Hämta förslag
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: isMobile ? '0' : '32px 40px' }}>
      {mobileHeader}
      <div style={{ padding: isMobile ? '16px' : '0' }}>
        {desktopHeader}
        {desktopFilterBar}

        <div className="mx-auto flex flex-col gap-6" style={{ maxWidth: 600 }}>
          {filterActive && filteredForslag
            ? filteredForslag.map(({ forslag, matchInfo }) => (
                <ForslagCard key={forslag.id} forslag={forslag} matchInfo={matchInfo} />
              ))
            : (displayList as Forslag[]).map(f => (
                <ForslagCard key={f.id} forslag={f} />
              ))
          }
        </div>

        {!filterActive && (
          <div ref={sentinelRef} className="flex justify-center mt-8 py-4 min-h-[40px]">
            {isFetching && allForslag.length > 0 && (
              <RefreshCw size={16} className="animate-spin text-ink-50" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SkeletonFeed() {
  return (
    <div className="mx-auto flex flex-col gap-6" style={{ maxWidth: 600 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[18px] overflow-hidden animate-pulse"
          style={{ background: 'var(--surface-2)', aspectRatio: '4/3' }}
        />
      ))}
    </div>
  )
}
