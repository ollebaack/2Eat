import { useState, useEffect } from 'react'
import { fetchFile } from '@/lib/api'

export function useAuthenticatedSrc(storedFileName?: string | null): string | undefined {
  const isExternal = storedFileName?.startsWith('http') ?? false
  const [blobUrl, setBlobUrl] = useState<string | undefined>()

  useEffect(() => {
    // External URLs (Coop Cloudinary, koket.se CDN, etc.) are used directly.
    if (!storedFileName || isExternal) return

    let url: string | undefined
    let cancelled = false

    fetchFile(storedFileName)
      .then((blob) => {
        if (!cancelled) {
          url = URL.createObjectURL(blob)
          setBlobUrl(url)
        }
      })
      .catch(() => {
        if (!cancelled) setBlobUrl(undefined)
      })

    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
      setBlobUrl(undefined)
    }
  }, [storedFileName, isExternal])

  return isExternal ? storedFileName ?? undefined : blobUrl
}
