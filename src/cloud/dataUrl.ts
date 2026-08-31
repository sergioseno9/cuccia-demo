export const dataUrlToBlob = (dataUrl: string) => {
  const match = dataUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/s)
  if (!match) throw new Error('Allegato locale non valido.')
  const mimeType = match[1] || 'application/octet-stream'
  const binary = match[2] ? atob(match[3]) : decodeURIComponent(match[3])
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  return new Blob([bytes], { type: mimeType })
}

export const safeStorageName = (value: string) =>
  value.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'file'
