interface StubPageProps {
  eyebrow: string
  title: string
  description: string
}

export function StubPage({ eyebrow, title, description }: StubPageProps) {
  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '60px 40px', width: '100%' }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        letterSpacing: '0.16em', color: 'var(--2eat-accent-deep)',
        textTransform: 'uppercase',
      }}>
        {eyebrow}
      </span>
      <h1 style={{
        fontFamily: 'var(--font-serif)', fontSize: 64,
        letterSpacing: '-0.035em', lineHeight: 0.95,
        margin: '8px 0 16px', fontWeight: 400, color: 'var(--ink)',
      }}>
        {title}
      </h1>
      <p style={{
        fontFamily: 'var(--font-serif)', fontStyle: 'italic',
        fontSize: 19, lineHeight: 1.5, color: 'var(--ink-70)',
        margin: 0, maxWidth: 600,
      }}>
        {description}
      </p>
      <div style={{
        marginTop: 36, height: 280, borderRadius: 18,
        border: '1px dashed var(--line)', background: 'var(--surface-1)',
        display: 'grid', placeItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)',
        letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>
        Wireframe · Kommer snart
      </div>
    </div>
  )
}
