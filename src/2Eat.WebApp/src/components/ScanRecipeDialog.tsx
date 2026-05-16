import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getScanStatus, scanRecipeFromImage, scanRecipeFromUrl } from '@/lib/api'
import { AuthImg } from '@/components/AuthImg'
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
                <AuthImg
                  src={preview.imageUrl}
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
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 rounded-full"
              >
                Skanna igen
              </Button>
              <Button
                onClick={handleApply}
                className="flex-[2] rounded-full"
              >
                Använd recept ✓
              </Button>
            </div>
          </div>
        )}

        {!scanning && !preview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant={tab === 'image' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('image')}>Bild</Button>
              <Button variant={tab === 'url' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('url')}>URL</Button>
            </div>

            {tab === 'image' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.5 }}>
                  Fotografera eller ladda upp en bild av ett recept — från en kokbok, ett receptkort eller en utskrift.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!scanEnabled}
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-auto flex-col gap-2 py-8 border-dashed"
                >
                  <span className="text-[28px]">📷</span>
                  <span className="text-sm text-[var(--ink-60)]">
                    {scanEnabled ? 'Välj eller ta en bild' : 'API-nyckel krävs'}
                  </span>
                  {!scanEnabled && (
                    <span className="font-mono text-[10px] text-center text-[var(--ink-50)] tracking-[0.12em] uppercase">
                      Sätt Anthropic:ApiKey i appsettings eller miljövariabel
                    </span>
                  )}
                </Button>
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
                <Input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && scanEnabled && handleUrlScan()}
                  placeholder="https://…"
                  disabled={!scanEnabled}
                />
                <Button
                  className="w-full rounded-full"
                  disabled={!scanEnabled || !url.trim()}
                  onClick={handleUrlScan}
                  title={!scanEnabled ? 'Konfigurera Anthropic API-nyckel för att aktivera skanning' : undefined}
                >
                  Skanna recept
                </Button>
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
