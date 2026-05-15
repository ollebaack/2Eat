import { useState, useEffect } from 'react'
import { fetchFile } from '@/lib/api'

export function useAuthenticatedSrc(storedFileName?: string | null): string | undefined {
  const [blobUrl, setBlobUrl] = useState<string | undefined>()

  useEffect(() => {
    if (!storedFileName) {
      setBlobUrl(undefined)
      return
    }
    let url: string | undefined
    fetchFile(storedFileName)
      .then((blob) => {
        url = URL.createObjectURL(blob)
        setBlobUrl(url)
      })
      .catch(() => setBlobUrl(undefined))
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [storedFileName])

  return blobUrl
}
