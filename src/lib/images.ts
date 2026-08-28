const readAsDataUrl = (file: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result ?? ''))
  reader.onerror = () => reject(reader.error ?? new Error('Impossibile leggere il file.'))
  reader.readAsDataURL(file)
})

const loadImage = (source: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = () => reject(new Error('Immagine non leggibile.'))
  image.src = source
})

export async function prepareLocalFile(file: File, maxDimension = 1400): Promise<string> {
  if (!file.type.startsWith('image/')) {
    if (file.size > 2_500_000) throw new Error('Il file supera 2,5 MB. Scegline uno più leggero.')
    return readAsDataUrl(file)
  }

  const source = await readAsDataUrl(file)
  const image = await loadImage(source)
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Impossibile preparare l’immagine.')
  context.fillStyle = '#FDFCFA'
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
    (result) => result ? resolve(result) : reject(new Error('Impossibile comprimere l’immagine.')),
    'image/jpeg',
    0.82,
  ))
  return readAsDataUrl(blob)
}
