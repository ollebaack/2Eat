import { useState } from 'react'
import { Moon, Sun, ChevronRight, X } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useQuery } from '@tanstack/react-query'
import { ProfilePage } from './ProfilePage'
import { IngredientsPage } from './IngredientsPage'
import { useTheme } from '@/hooks/useTheme'
import { useIsMobile } from '@/hooks/useIsMobile'
import { getIngredients } from '@/lib/api'

const iconButtonStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: '50%',
  border: '1px solid var(--line)', background: 'transparent',
  cursor: 'pointer', display: 'grid', placeItems: 'center',
  color: 'var(--ink-60)', flexShrink: 0,
}

export function SettingsPage() {
  const [open, setOpen] = useState(false)
  const { isDark, setIsDark } = useTheme()
  const isMobile = useIsMobile()
  const { data: ingredients } = useQuery({ queryKey: ['ingredients'], queryFn: getIngredients })
  const count = ingredients?.length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-line">
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>
          {isDark ? 'Mörkt läge' : 'Ljust läge'}
        </span>
        <button
          onClick={() => setIsDark(d => !d)}
          title={isDark ? 'Byt till ljust läge' : 'Byt till mörkt läge'}
          style={iconButtonStyle}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      <ProfilePage />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px 40px' }} className="sm:px-8">
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 28 }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--ink-50)', margin: '0 0 12px',
          }}>
            Bibliotek
          </p>
          <button
            onClick={() => setOpen(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              background: 'var(--paper)', border: '1px solid var(--line)',
              borderRadius: 10, padding: '14px 16px', cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--paper)')}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--surface-2)', display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink-60)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21l8-8"/><path d="M11 13c-2 2-6 5-8 8 5-1 8-4 10-6"/>
                <path d="M14 7c2-1 4-1 6 1s1 4 0 6l-7 0z"/>
              </svg>
            </div>
            <div className="flex flex-col min-w-0 flex-1" style={{ gap: 2 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                Ingredienser
              </span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-50)' }}>
                {count > 0 ? `${count} ingredienser` : 'Hantera ingrediensbiblioteket'}
              </span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--ink-40)', flexShrink: 0 }} />
          </button>
        </div>
      </div>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.5)',
            }}
            className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200"
          />
          <DialogPrimitive.Content
            style={isMobile ? {
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
              display: 'flex', flexDirection: 'column',
              background: 'var(--paper)',
              borderRadius: '20px 20px 0 0',
              maxHeight: '85vh',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
            } : {
              position: 'fixed', left: '50%', top: '50%', zIndex: 50,
              transform: 'translate(-50%, -50%)',
              display: 'flex', flexDirection: 'column',
              background: 'var(--paper)',
              borderRadius: 14,
              width: '100%', maxWidth: 980,
              maxHeight: '86vh',
              boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            }}
            className={isMobile
              ? 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300'
              : 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200'
            }
          >
            {isMobile && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--ink-30)' }} />
              </div>
            )}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: isMobile ? '8px 20px 12px' : '18px 24px 12px',
              borderBottom: '1px solid var(--line)', flexShrink: 0,
            }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: 'var(--ink-50)', margin: 0,
                }}>
                  Inställningar · Bibliotek
                </p>
                <p style={{
                  fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)',
                  margin: '4px 0 0', lineHeight: 1.1,
                }}>
                  Ingredienser
                </p>
              </div>
              <DialogPrimitive.Close style={iconButtonStyle} aria-label="Stäng">
                <X size={15} />
              </DialogPrimitive.Close>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <IngredientsPage />
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  )
}
