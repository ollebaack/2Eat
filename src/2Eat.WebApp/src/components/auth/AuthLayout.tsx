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
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <div
            style={{
              width: 30,
              height: 30,
              background: 'var(--ink)',
              color: 'var(--paper)',
              fontFamily: 'var(--font-serif)',
              fontSize: 19,
              letterSpacing: '-0.04em',
              display: 'grid',
              placeItems: 'center',
              borderRadius: 8,
            }}
          >
            2
          </div>
          <div style={{ lineHeight: 1.05 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
              2Eat
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9.5,
                letterSpacing: '0.14em',
                color: 'var(--ink-50)',
                textTransform: 'uppercase',
              }}
            >
              Hemkokboken
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
