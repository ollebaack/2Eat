import type { ImgHTMLAttributes } from 'react'
import { useAuthenticatedSrc } from '@/hooks/useAuthenticatedSrc'

interface AuthImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null
}

export function AuthImg({ src, ...props }: AuthImgProps) {
  const blobUrl = useAuthenticatedSrc(src)
  if (!blobUrl) return null
  return <img src={blobUrl} {...props} />
}
