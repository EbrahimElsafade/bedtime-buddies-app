import { extractGoogleDriveId } from '@/components/admin/GoogleDriveVideoInput'

/** Normalize a file ID or full Drive URL to a bare file ID. */
export function normalizeGoogleDriveFileId(input: string): string | null {
  if (!input?.trim()) return null
  return extractGoogleDriveId(input.trim()) ?? input.trim()
}

/** Google Drive native preview embed (iframe). */
export function getGoogleDriveEmbedUrl(fileId: string): string {
  const id = normalizeGoogleDriveFileId(fileId)
  if (!id) return ''
  return `https://drive.google.com/file/d/${id}/preview`
}

export function getGoogleDriveViewUrl(fileId: string): string {
  const id = normalizeGoogleDriveFileId(fileId)
  if (!id) return ''
  return `https://drive.google.com/file/d/${id}/view`
}

export function getGoogleDriveThumbnailUrl(fileId: string): string {
  const id = normalizeGoogleDriveFileId(fileId)
  if (!id) return ''
  return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`
}
