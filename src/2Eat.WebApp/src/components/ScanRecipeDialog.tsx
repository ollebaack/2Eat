import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getScanStatus, scanRecipeFromImage, scanRecipeFromUrl, getFileUrl } from '@/lib/api'
import type { ScannedRecipe } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (data: ScannedRecipe) => void
}

type Tab = 'image' | 'url'

const monoLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10.5,
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: 'var(--ink-50)',
}

export function ScanRecipeDialog({ open, onOpenChange, onApply }: Props) {
  const [tab, setTab] = useState<Tab>('image')
  const [url, setUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [preview, setPreview] = useState<ScannedRecipe | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: status } = useQuery({
    queryKey: ['scan-status'],
    queryFn: getScanStatus,
    staleTime: Infinity,
    enabled: open,
  })

  const scanEnabled = status?.enabled ?? false

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setScanning(true)
    try {
      const result = await scanRecipeFromImage(file)
      setPreview(result)
    } catch {
      toast.error('Skanningen misslyckades')
    } finally {
      setScanning(false)
    }
  }

  async function handleUrlScan() {
    if (!url.trim()) return
    setScanning(true)
    try {
      const result = await scanRecipeFromUrl(url.trim())
      setPreview(result)
    } catch {
      toast.error('Kunde inte hämta receptet')
    } finally {
      setScanning(false)
    }
  }

  function handleApply() {
    if (!preview) return
    onApply(preview)
    setPreview(null)
    setUrl('')
    onOpenChange(false)
  }

  function handleReset() {
    setPreview(null)
  }

  function handleClose() {
    if (scanning) return
    setPreview(null)
    setUrl('')
    onOpenChange(false)
  }

  const tabBtn = (t: Tab): React.CSSProperties => ({
    padding: '7px 18px',
    borderRadius: 999,
    border: tab === t ? 'none' : '1px solid var(--line)',
    background: tab === t ? 'var(--2eat-accent)' : 'transparent',
    color: tab === t ? 'var(--paper)' : 'var(--ink)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    fontWeight: tab === t ? 500 : 400,
  })

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent style={{ maxWidth: 480 }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 22, letterSpacing: '-0.02em' }}>
            Skanna recept
          </DialogTitle>
        </DialogHeader>

        {scanning && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px 0' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '3px solid var(--line)',
              borderTopColor: 'var(--2eat-accent)',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-50)', textTransform: 'uppercase' }}>
              Skannar…
            </span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!scanning && preview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {preview.imageUrl && (
                <img
                  src={getFileUrl(preview.imageUrl)}
                  alt=""
                  style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                />
              )}
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
                {preview.name ?? '—'}
              </p>
              {preview.description && (
                <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.5 }}>
                  {preview.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
                {preview.ingredients?.length ? (
                  <span style={monoLabel}>{preview.ingredients.length} ingredienser</span>
                ) : null}
                {preview.steps?.length ? (
                  <span style={monoLabel}>{preview.steps.length} steg</span>
                ) : null}
                {preview.servings ? (
                  <span style={monoLabel}>{preview.servings} port.</span>
                ) : null}
                {(preview.prepTime || preview.cookTime) ? (
                  <span style={monoLabel}>
                    {((preview.prepTime ?? 0) + (preview.cookTime ?? 0))} min totalt
                  </span>
                ) : null}
              </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleReset}
                style={{ flex: 1, padding: '10px 0', borderRadius: 999, border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink)' }}
              >
                Skanna igen
              </button>
              <button
                onClick={handleApply}
                style={{ flex: 2, padding: '10px 0', borderRadius: 999, border: 'none', background: 'var(--2eat-accent)', color: 'var(--paper)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500 }}
              >
                Använd recept ✓
              </button>
            </div>
          </div>
        )}

        {!scanning && !preview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={tabBtn('image')} onClick={() => setTab('image')}>Bild</button>
              <button style={tabBtn('url')} onClick={() => setTab('url')}>URL</button>
            </div>

            {tab === 'image' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.5 }}>
                  Fotografera eller ladda upp en bild av ett recept — från en kokbok, ett receptkort eller en utskrift.
                </p>
                <button
                  type="button"
                  disabled={!scanEnabled}
                  title={!scanEnabled ? 'Konfigurera Anthropic API-nyckel för att aktivera skanning' : undefined}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 10, padding: '32px 24px',
                    border: '1.5px dashed var(--line)', borderRadius: 12,
                    background: scanEnabled ? 'transparent' : 'var(--paper)',
                    cursor: scanEnabled ? 'pointer' : 'not-allowed',
                    opacity: scanEnabled ? 1 : 0.5,
                  }}
                >
                  <span style={{ fontSize: 28 }}>📷</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>
                    {scanEnabled ? 'Välj eller ta en bild' : 'API-nyckel krävs'}
                  </span>
                  {!scanEnabled && (
                    <span style={{ ...monoLabel, fontSize: 10, textAlign: 'center' }}>
                      Sätt Anthropic:ApiKey i appsettings eller miljövariabel
                    </span>
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handleImageFile}
                />
              </div>
            )}

            {tab === 'url' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.5 }}>
                  Klistra in en länk till en receptsida eller ett Instagram-inlägg så hämtar vi receptet automatiskt.
                </p>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && scanEnabled && handleUrlScan()}
                  placeholder="https://…"
                  disabled={!scanEnabled}
                  style={{
                    width: '100%', padding: '11px 14px',
                    background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10,
                    fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink)',
                    outline: 'none', boxSizing: 'border-box' as const,
                    opacity: scanEnabled ? 1 : 0.5,
                  }}
                />
                <button
                  onClick={handleUrlScan}
                  disabled={!scanEnabled || !url.trim()}
                  title={!scanEnabled ? 'Konfigurera Anthropic API-nyckel för att aktivera skanning' : undefined}
                  style={{
                    padding: '10px 0', borderRadius: 999, border: 'none',
                    background: (scanEnabled && url.trim()) ? 'var(--2eat-accent)' : 'var(--ink-50)',
                    color: 'var(--paper)',
                    cursor: (scanEnabled && url.trim()) ? 'pointer' : 'not-allowed',
                    fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
                  }}
                >
                  Skanna recept
                </button>
                {!scanEnabled && (
                  <span style={{ ...monoLabel, fontSize: 10 }}>
                    Sätt Anthropic:ApiKey i appsettings eller miljövariabel för att aktivera
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
