import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description: React.ReactNode
  onConfirm: () => void
  isPending?: boolean
  confirmLabel?: string
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = 'Ta bort?',
  description,
  onConfirm,
  isPending = false,
  confirmLabel = 'Ta bort',
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 20 }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 26,
              letterSpacing: '-0.02em',
              fontWeight: 400,
            }}
          >
            {title}
          </DialogTitle>
          <DialogDescription
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-60)' }}
          >
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Avbryt
          </Button>
          <Button
            variant="destructive"
            className="rounded-full"
            disabled={isPending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
