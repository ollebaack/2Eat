import { useState } from 'react'
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
  // Track only the user's local toggles as an override map — no useEffect needed.
  const [localChanges, setLocalChanges] = useState<Record<number, boolean>>({})

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

  function isChecked(id: number): boolean {
    if (id in localChanges) return localChanges[id]
    return membership?.samlingIds.includes(id) ?? false
  }

  function toggle(id: number) {
    setLocalChanges(prev => ({ ...prev, [id]: !isChecked(id) }))
  }

  const selectedIds = (samlingar ?? []).map(s => s.id).filter(id => isChecked(id))

  const syncMutation = useMutation({
    mutationFn: () => syncReceptSamlingar(recipeId, selectedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samlingar'] })
      queryClient.invalidateQueries({ queryKey: ['samlingar-for-recept', recipeId] })
      toast.success('Samlingar uppdaterade')
      handleClose()
    },
    onError: () => toast.error('Kunde inte uppdatera samlingar'),
  })

  function handleClose() {
    setLocalChanges({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) handleClose() }}>
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
              const checked = isChecked(s.id)
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
          <Button variant="outline" className="rounded-full" onClick={handleClose}>Avbryt</Button>
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
