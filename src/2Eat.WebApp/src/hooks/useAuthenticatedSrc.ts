import { useState, useEffect } from 'react'
import { fetchFile } from '@/lib/api'

export function useAuthenticatedSrc(storedFileName?: string | null): string | undefined {
  const [blobUrl, setBlobUrl] = useState<string | undefined>()

  useEffect(() => {
    if (!storedFileName) return

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
  }, [storedFileName])

  return blobUrl
}
