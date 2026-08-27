import type { AppData, Deadline, DeadlineStatus, MedicationRecord } from '../types'
import { addDays } from './date'

const getStatus = (dueDate: string): DeadlineStatus => {
  const due = new Date(dueDate.length === 10 ? `${dueDate}T23:59:59` : dueDate)
  const days = (due.getTime() - Date.now()) / 86_400_000
  if (days < 0) return 'overdue'
  if (days <= 7) return 'upcoming'
  return 'ok'
}

const nextDose = (medication: MedicationRecord) => {
  const today = new Date()
  const validTimes = medication.times.filter(Boolean).sort()
  for (const time of validTimes) {
    const [hours, minutes] = time.split(':').map(Number)
    const candidate = new Date()
    candidate.setHours(hours, minutes, 0, 0)
    if (candidate > today) return candidate.toISOString()
  }
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const [hours, minutes] = (validTimes[0] ?? '09:00').split(':').map(Number)
  tomorrow.setHours(hours, minutes, 0, 0)
  return tomorrow.toISOString()
}

export const buildDeadlines = (data: AppData): Deadline[] => {
  const vaccinationDeadlines = data.health.vaccinations
    .filter((record) => record.nextDate)
    .map((record) => ({
      id: `vaccination-${record.id}`,
      title: record.name,
      detail: 'Vaccinazione',
      dueDate: record.nextDate,
      status: getStatus(record.nextDate),
      source: 'vaccination' as const,
    }))

  const preventionDeadlines = data.health.preventions
    .filter((record) => record.lastDate && record.intervalDays > 0)
    .map((record) => {
      const dueDate = addDays(record.lastDate, record.intervalDays)
      return {
        id: `prevention-${record.id}`,
        title: record.kind,
        detail: record.product,
        dueDate,
        status: getStatus(dueDate),
        source: /svermin/i.test(record.kind) ? 'deworming' as const : 'prevention' as const,
      }
    })

  const medicationDeadlines = data.health.medications
    .filter((record) => record.active && (!record.endDate || record.endDate >= new Date().toISOString().slice(0, 10)))
    .map((record) => {
      const dueDate = nextDose(record)
      return {
        id: `medication-${record.id}`,
        title: record.name,
        detail: `Prossima dose · ${record.dose}`,
        dueDate,
        status: getStatus(dueDate),
        source: 'medication' as const,
      }
    })

  const visitDeadlines = data.health.visits
    .filter((record) => record.date >= new Date().toISOString().slice(0, 10))
    .map((record) => ({
      id: `visit-${record.id}`,
      title: record.title,
      detail: 'Visita veterinaria',
      dueDate: record.date,
      status: getStatus(record.date),
      source: 'visit' as const,
    }))

  const profileDates = data.profile ? [
    { id: 'annual-check', title: 'Controllo annuale', detail: 'Visita di controllo', dueDate: data.profile.annualCheckDate, source: 'visit' as const },
    { id: 'microchip-renewal', title: 'Verifica dati microchip', detail: 'Controllo dei dati registrati', dueDate: data.profile.microchipRenewalDate, source: 'profile' as const },
  ].filter((item) => item.dueDate).map((item) => ({
    ...item,
    status: getStatus(item.dueDate),
  })) : []

  return [...vaccinationDeadlines, ...preventionDeadlines, ...medicationDeadlines, ...visitDeadlines, ...profileDates]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}
