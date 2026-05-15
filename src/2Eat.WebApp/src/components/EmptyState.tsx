import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' as const }}
      className={cn(
        'flex flex-col items-center gap-3 py-[60px] bg-surface-1 rounded-[18px] border border-dashed border-line text-ink-50',
        className,
      )}
    >
      {icon && <div className="text-ink-40">{icon}</div>}
      <p
        className="text-ink m-0"
        style={{ fontFamily: 'var(--font-serif)', fontSize: 22 }}
      >
        {title}
      </p>
      {description && (
        <p className="text-ink-50 m-0" style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  )
}
