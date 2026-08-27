const drawWrappedText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  for (const word of words) {
    const testLine = `${line}${word} `
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line.trim(), x, currentY)
      line = `${word} `
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  context.fillText(line.trim(), x, currentY)
}

export const shareTrickBadge = async (dogName: string, trickName: string) => {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1080
  const context = canvas.getContext('2d')
  if (!context) return

  context.fillStyle = '#FBF6EE'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#D9694A'
  context.fillRect(0, 0, canvas.width, 90)
  context.fillStyle = '#EFE3D1'
  context.beginPath()
  context.arc(190, 250, 105, 0, Math.PI * 2)
  context.fill()

  const logo = new Image()
  logo.src = './dog-icon.svg'
  await logo.decode()
  context.drawImage(logo, 112, 172, 156, 156)

  context.fillStyle = '#2B2320'
  context.font = '600 54px Fraunces, serif'
  context.fillText('cuccia', 330, 225)
  context.fillStyle = '#6B6154'
  context.font = '600 28px Plus Jakarta Sans, sans-serif'
  context.fillText('TRAGUARDO PERSONALE', 330, 275)

  context.fillStyle = '#2B2320'
  context.font = '600 86px Fraunces, serif'
  drawWrappedText(context, `${dogName} ha imparato`, 110, 520, 860, 96)
  context.fillStyle = '#D9694A'
  context.font = '600 78px Fraunces, serif'
  drawWrappedText(context, trickName, 110, 730, 860, 88)

  context.fillStyle = '#8FA083'
  context.fillRect(110, 930, 210, 10)
  context.fillStyle = '#6B6154'
  context.font = '500 27px Plus Jakarta Sans, sans-serif'
  context.fillText('Un passo gentile alla volta.', 110, 990)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return
  const file = new File([blob], `${dogName}-${trickName}.png`, { type: 'image/png' })
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: `${dogName} ha imparato ${trickName}` })
    return
  }
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = file.name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1_000)
}
