import type { ReactNode } from 'react'

export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--surface-1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          padding: '36px 32px',
        }}
      >
        <div className="flex items-center gap-3 justify-center mb-6">
          <div
            style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8956 100%)',
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              fontFamily: '"Manrope", sans-serif',
              fontSize: 28,
              fontWeight: 800,
              color: 'white',
              flexShrink: 0,
            }}
          >
            2
          </div>
          <div style={{ lineHeight: 1.05 }}>
            <div style={{ fontFamily: '"Manrope", sans-serif', fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--ink)' }}>
              Eat
            </div>
            <div
              style={{
                fontFamily: '"Manrope", sans-serif',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '1.5px',
                color: 'var(--ink-50)',
                textTransform: 'uppercase',
              }}
            >
              Hemmakoken
            </div>
          </div>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 22,
            color: 'var(--ink)',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          {title}
        </h1>

        {children}
      </div>
    </div>
  )
}
