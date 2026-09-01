import type { Deadline, DeadlineStatus, MedicationRecord, PetData, PreventionRecord } from '../types'
import { addDays } from './date.ts'

const getStatus = (dueDate: string): DeadlineStatus => {
  const due = new Date(dueDate.length === 10 ? `${dueDate}T23:59:59` : dueDate)
  const days = (due.getTime() - Date.now()) / 86_400_000
  if (days < 0) return 'overdue'
  if (days <= 7) return 'upcoming'
  return 'ok'
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/

const localDateKey = (date: Date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-')

const validDateKey = (value: string) => {
  if (!DATE_PATTERN.test(value)) return false
  return localDateKey(new Date(`${value}T12:00:00`)) === value
}

const nextLocalDateKey = (value: string) => {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + 1)
  return localDateKey(date)
}

export const isMedicationTime = (value: string) => TIME_PATTERN.test(value)

export const nextMedicationDose = (medication: MedicationRecord, now = new Date()) => {
  const validTimes = medication.times.filter(isMedicationTime).sort()
  if (!validTimes.length || !validDateKey(medication.startDate)) return null
  if (medication.endDate && !validDateKey(medication.endDate)) return null

  const today = localDateKey(now)
  const candidateDate = medication.startDate > today ? medication.startDate : today
  const candidateTimes = candidateDate === today
    ? validTimes.filter((time) => new Date(`${candidateDate}T${time}:00`) > now)
    : validTimes
  const dueDate = candidateTimes.length ? candidateDate : nextLocalDateKey(candidateDate)
  const dueTime = candidateTimes[0] ?? validTimes[0]
  if (medication.endDate && dueDate > medication.endDate) return null
  return new Date(`${dueDate}T${dueTime}:00`).toISOString()
}

const monthIsPaused = (month: number, record: PreventionRecord) => {
  if (!record.seasonalPause || !record.pauseStartMonth || !record.pauseEndMonth) return false
  if (record.pauseStartMonth <= record.pauseEndMonth) {
    return month >= record.pauseStartMonth && month <= record.pauseEndMonth
  }
  return month >= record.pauseStartMonth || month <= record.pauseEndMonth
}

export const nextPreventionDate = (record: PreventionRecord) => {
  const due = new Date(`${addDays(record.lastDate, record.intervalDays)}T12:00:00`)
  let checks = 0
  while (monthIsPaused(due.getMonth() + 1, record) && checks < 12) {
    due.setMonth(due.getMonth() + 1)
    checks += 1
  }
  return due.toISOString().slice(0, 10)
}

export const buildDeadlines = (pet: PetData): Deadline[] => {
  const vaccinationDeadlines = pet.health.vaccinations
    .filter((record) => record.nextDate)
    .map((record) => ({
      id: `vaccination-${record.id}`,
      title: record.name,
      detail: 'Vaccinazione',
      dueDate: record.nextDate,
      status: getStatus(record.nextDate),
      source: 'vaccination' as const,
    }))

  const preventionDeadlines = pet.health.preventions
    .filter((record) => record.lastDate && record.intervalDays > 0)
    .map((record) => {
      const dueDate = nextPreventionDate(record)
      return {
        id: `prevention-${record.id}`,
        title: record.kind,
        detail: record.seasonalPause ? `${record.product} · pausa stagionale considerata` : record.product,
        dueDate,
        status: getStatus(dueDate),
        source: /svermin/i.test(record.kind) ? 'deworming' as const : 'prevention' as const,
      }
    })

  const medicationDeadlines = pet.health.medications.flatMap((record) => {
    if (!record.active) return []
    const dueDate = nextMedicationDose(record)
    return dueDate ? [{
        id: `medication-${record.id}`,
        title: record.name,
        detail: `Prossima dose · ${record.dose}`,
        dueDate,
        status: getStatus(dueDate),
        source: 'medication' as const,
      }] : []
  })

  const visitDeadlines = pet.health.visits
    .filter((record) => record.date >= new Date().toISOString().slice(0, 10))
    .map((record) => ({
      id: `visit-${record.id}`,
      title: record.title,
      detail: 'Visita veterinaria',
      dueDate: record.date,
      status: getStatus(record.date),
      source: 'visit' as const,
    }))

  const profileDates = [
    { id: 'annual-check', title: 'Controllo annuale', detail: 'Visita di controllo', dueDate: pet.profile.annualCheckDate, source: 'visit' as const },
    { id: 'microchip-renewal', title: 'Verifica dati microchip', detail: 'Controllo dei dati registrati', dueDate: pet.profile.microchipRenewalDate, source: 'profile' as const },
    { id: 'insurance-renewal', title: 'Rinnovo assicurazione', detail: 'Data inserita nel Profilo', dueDate: pet.profile.insuranceRenewalDate, source: 'profile' as const },
  ].filter((item) => item.dueDate).map((item) => ({ ...item, status: getStatus(item.dueDate) }))

  return [...vaccinationDeadlines, ...preventionDeadlines, ...medicationDeadlines, ...visitDeadlines, ...profileDates]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}
