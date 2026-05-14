import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSamlingar, getSamlingarForRecept, syncReceptSamlingar } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AddToSamlingModalProps {
  recipeId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddToSamlingModal({ recipeId, open, onOpenChange }: AddToSamlingModalProps) {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const { data: samlingar } = useQuery({
    queryKey: ['samlingar'],
    queryFn: getSamlingar,
    enabled: open,
  })

  const { data: membership } = useQuery({
    queryKey: ['samlingar-for-recept', recipeId],
    queryFn: () => getSamlingarForRecept(recipeId),
    enabled: open,
  })

  useEffect(() => {
    if (membership) {
      setSelected(new Set(membership.samlingIds))
    }
  }, [membership])

  const syncMutation = useMutation({
    mutationFn: () => syncReceptSamlingar(recipeId, [...selected]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samlingar'] })
      queryClient.invalidateQueries({ queryKey: ['samlingar-for-recept', recipeId] })
      toast.success('Samlingar uppdaterade')
      onOpenChange(false)
    },
    onError: () => toast.error('Kunde inte uppdatera samlingar'),
  })

  function toggle(id: number) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: 'var(--paper)', borderRadius: 18, maxWidth: 400 }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em' }}>
            Lägg till i samling
          </DialogTitle>
        </DialogHeader>

        {!samlingar?.length ? (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink-50)', margin: 0 }}>
            Du har inga samlingar ännu. Skapa en på sidan Samlingar.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {samlingar.map(s => {
              const checked = selected.has(s.id)
              return (
                <li key={s.id}>
                  <label
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                      borderRadius: 10, cursor: 'pointer',
                      background: checked ? 'var(--surface-1)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span
                      style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        border: `1.5px solid ${checked ? 'var(--2eat-accent)' : 'var(--ink-30)'}`,
                        background: checked ? 'var(--2eat-accent)' : 'transparent',
                        display: 'grid', placeItems: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <input type="checkbox" checked={checked} onChange={() => toggle(s.id)} style={{ display: 'none' }} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink)' }}>
                      {s.name}
                    </span>
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-50)' }}>
                      {s.receptCount}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}

        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>Avbryt</Button>
          <Button
            className="rounded-full"
            style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
            disabled={syncMutation.isPending || !samlingar?.length}
            onClick={() => syncMutation.mutate()}
          >
            Spara
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
