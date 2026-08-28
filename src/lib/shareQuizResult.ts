import type { QuizArchetype } from '../data/quiz'

const drawWrappedText = (
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) => {
  const words = value.split(' ')
  let line = ''
  let currentY = y
  words.forEach((word) => {
    const candidate = `${line}${word} `
    if (line && context.measureText(candidate).width > maxWidth) {
      context.fillText(line.trim(), x, currentY)
      line = `${word} `
      currentY += lineHeight
    } else {
      line = candidate
    }
  })
  context.fillText(line.trim(), x, currentY)
}

const safeFilename = (value: string) => value.toLocaleLowerCase('it-IT')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')

export const shareQuizResult = async (petName: string, archetype: QuizArchetype) => {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1080
  const context = canvas.getContext('2d')
  if (!context) return

  context.fillStyle = '#FBF6EE'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#D9694A'
  context.fillRect(0, 0, canvas.width, 92)
  context.fillStyle = '#EFE3D1'
  context.beginPath()
  context.arc(175, 232, 92, 0, Math.PI * 2)
  context.fill()

  const logo = new Image()
  logo.src = `${import.meta.env.BASE_URL}dog-icon.svg`
  await logo.decode()
  context.drawImage(logo, 111, 168, 128, 128)

  context.fillStyle = '#2B2320'
  context.font = '600 54px Fraunces, serif'
  context.fillText('cuccia', 310, 220)
  context.fillStyle = '#6B6154'
  context.font = '600 27px Plus Jakarta Sans, sans-serif'
  context.fillText('CHE TIPO È?', 310, 266)

  context.textAlign = 'center'
  context.font = '150px Apple Color Emoji, Segoe UI Emoji, sans-serif'
  context.fillText(archetype.emoji, 540, 490)
  context.fillStyle = '#D9694A'
  context.font = '600 46px Fraunces, serif'
  context.fillText(petName, 540, 590)
  context.fillStyle = '#2B2320'
  context.font = '600 82px Fraunces, serif'
  drawWrappedText(context, archetype.name, 540, 700, 840, 92)

  context.fillStyle = '#8FA083'
  context.fillRect(420, 940, 240, 10)
  context.fillStyle = '#6B6154'
  context.font = '500 26px Plus Jakarta Sans, sans-serif'
  context.fillText('Solo per ridere.', 540, 1005)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return
  const filename = `${safeFilename(petName)}-${safeFilename(archetype.name)}.png`
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: `${petName}: ${archetype.name}` })
    return
  }
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1_000)
}
