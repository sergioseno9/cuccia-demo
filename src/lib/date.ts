const dayFormatter = new Intl.DateTimeFormat('it-IT', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
})

export const timeFormatter = new Intl.DateTimeFormat('it-IT', {
  hour: '2-digit',
  minute: '2-digit',
})

export const compactDateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
})

export const isoDateFromNow = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export const addDays = (dateValue: string, days: number) => {
  const date = new Date(`${dateValue}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export const formatDate = (value: string) => value
  ? compactDateFormatter.format(new Date(value.length === 10 ? `${value}T12:00:00` : value))
  : 'Non inserita'

const localDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const dayKey = (value: string) => value.length === 10
  ? value
  : localDateKey(new Date(value))

export const todayKey = () => localDateKey(new Date())

export const dayLabel = (value: string) => {
  const key = dayKey(value)
  if (key === todayKey()) return 'Oggi'
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (key === yesterday.toISOString().slice(0, 10)) return 'Ieri'
  return dayFormatter.format(new Date(`${key}T12:00:00`))
}

export const ageLabel = (birthDate: string) => {
  if (!birthDate) return 'Età non inserita'
  const birth = new Date(`${birthDate}T12:00:00`)
  const now = new Date()
  const months = Math.max(
    0,
    (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth(),
  )
  if (months < 4) return `${Math.max(1, Math.round((now.getTime() - birth.getTime()) / 604_800_000))} settimane`
  if (months < 24) return `${months} mesi`
  const years = Math.floor(months / 12)
  return `${years} ${years === 1 ? 'anno' : 'anni'}`
}

export const relativeAgo = (value: string) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000))
  if (minutes < 60) return `${minutes} min fa`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? 'ora' : 'ore'} fa`
  return `${Math.floor(hours / 24)} g fa`
}
