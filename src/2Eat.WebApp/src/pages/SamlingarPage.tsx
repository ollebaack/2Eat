import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getSamlingar, createSamling, deleteSamling } from '@/lib/api'
import { AuthImg } from '@/components/AuthImg'
import type { SamlingListItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { recipeSwatch } from '@/lib/recipeUtils'
import { Skeleton } from '@/components/ui/skeleton'

function CoverGrid({ images, id }: { images: (string | null)[]; id: number }) {
  const slots = [0, 1, 2, 3]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', aspectRatio: '1', borderRadius: '14px 14px 0 0', overflow: 'hidden' }}>
      {slots.map(i => (
        <div key={i} style={{ position: 'relative', overflow: 'hidden' }}>
          {images[i] ? (
            <AuthImg src={images[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: recipeSwatch(id + i * 7) }} />
          )}
        </div>
      ))}
    </div>
  )
}

function SamlingCard({ samling, onDelete }: { samling: SamlingListItem; onDelete: () => void }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  return (
    <article
      tabIndex={0}
      role="link"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/samlingar/${samling.id}`) } }}
      className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      style={{
        background: 'var(--paper)',
        border: `1px solid ${hovered ? 'var(--ink-30)' : 'var(--line)'}`,
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'transform 0.2s, border-color 0.15s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => navigate(`/samlingar/${samling.id}`)}
    >
      <CoverGrid images={samling.coverImages} id={samling.id} />
      <div style={{ padding: '14px 18px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 4px', fontWeight: 400, lineHeight: 1.15 }}>
            {samling.name}
          </h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-50)', letterSpacing: '0.06em' }}>
            {samling.receptCount} {samling.receptCount === 1 ? 'recept' : 'recept'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          aria-label="Ta bort samling"
          onClick={e => { e.stopPropagation(); onDelete() }}
          style={{ color: 'var(--ink-40)' }}
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </Button>
      </div>
    </article>
  )
}

export function SamlingarPage() {
  const queryClient = useQueryClient()
  const { data: samlingar, isLoading } = useQuery({ queryKey: ['samlingar'], queryFn: getSamlingar })

  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const createMutation = useMutation({
    mutationFn: () => createSamling(newName.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samlingar'] })
      toast.success('Samling skapad')
      setCreateOpen(false)
      setNewName('')
    },
    onError: () => toast.error('Kunde inte skapa samlingen'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSamling(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samlingar'] })
      toast.success('Samling borttagen')
      setDeleteId(null)
    },
    onError: () => toast.error('Kunde inte ta bort samlingen'),
  })

  const samlingToDelete = samlingar?.find(s => s.id === deleteId)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-0.03em', color: 'var(--ink)', margin: 0, fontWeight: 400 }}>
            Samlingar
          </h1>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-50)', margin: '6px 0 0' }}>
            Dina egna receptsamlingar
          </p>
        </div>
        <Button
          className="rounded-full gap-2"
          style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none', fontFamily: 'var(--font-sans)', fontSize: 13 }}
          onClick={() => setCreateOpen(true)}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--2eat-accent-deep)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--2eat-accent)')}
        >
          <Plus size={15} /> Ny samling
        </Button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {isLoading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="rounded-[18px]" style={{ aspectRatio: '1', height: 280 }} />)}
          </motion.div>
        ) : !samlingar?.length ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: 'easeOut' as const }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '80px 48px', color: 'var(--ink-50)' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)', margin: 0 }}>Inga samlingar ännu</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink-50)', margin: 0 }}>Skapa din första samling för att börja organisera dina recept.</p>
            <Button className="rounded-full gap-2 mt-2" onClick={() => setCreateOpen(true)}>
              <Plus size={15} /> Skapa samling
            </Button>
          </motion.div>
        ) : (
          <motion.div key="grid"
            variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
            initial="initial" animate="animate"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {samlingar.map(s => (
              <motion.div key={s.id} variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' as const } } }}>
                <SamlingCard samling={s} onDelete={() => setDeleteId(s.id)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={createOpen} onOpenChange={o => { setCreateOpen(o); if (!o) setNewName('') }}>
        <DialogContent style={{ background: 'var(--paper)', borderRadius: 18, maxWidth: 420 }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em' }}>
              Ny samling
            </DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Namn på samlingen"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) createMutation.mutate() }}
            style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}
          />
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setCreateOpen(false)}>Avbryt</Button>
            <Button
              className="rounded-full"
              style={{ background: 'var(--2eat-accent)', color: 'var(--paper)', border: 'none' }}
              disabled={!newName.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Skapa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={open => { if (!open) setDeleteId(null) }}
        title="Ta bort samling"
        description={<>Är du säker på att du vill ta bort <strong style={{ color: 'var(--ink)' }}>{samlingToDelete?.name}</strong>? Recepten i samlingen tas inte bort.</>}
        onConfirm={() => deleteId !== null && deleteMutation.mutate(deleteId)}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
