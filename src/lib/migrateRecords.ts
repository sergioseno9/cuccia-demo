import type {
  AchievementBadge,
  CareEvent,
  CareEventType,
  Caregiver,
  GroomingRecord,
  HealthData,
  MedicationRecord,
  PetDocument,
  PreventionRecord,
  QuizResultRecord,
  TrickProgressRecord,
  TrickStatus,
  VaccinationRecord,
  VetVisitRecord,
  WeightRecord,
} from '../types'

const eventTypes: CareEventType[] = [
  'meal', 'water', 'pee', 'poop', 'walk', 'sleep', 'grooming', 'litterbox', 'medication', 'note',
]
const documentKinds = ['libretto', 'pedigree', 'esame', 'ricevuta', 'altro'] as const
const trickStatuses: TrickStatus[] = ['da_imparare', 'in_corso', 'imparato']

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null
export const text = (value: unknown) => typeof value === 'string' ? value : ''
const number = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback
export const optionalNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined
const optionalText = (value: unknown) => typeof value === 'string' && value ? value : undefined
const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
const recordList = (value: unknown) => Array.isArray(value) ? value.filter(isRecord) : []

export const migrateCaregivers = (value: unknown): Caregiver[] => {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord).map((caregiver, index) => ({
    id: text(caregiver.id) || createId(),
    name: text(caregiver.name) || `Persona ${index + 1}`,
    role: text(caregiver.role) || 'Famiglia',
    color: text(caregiver.color) || '#D9694A',
  }))
}

export const migrateDocuments = (value: unknown): PetDocument[] => {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord).map((document) => ({
    id: text(document.id) || createId(),
    name: text(document.name) || 'Documento',
    kind: documentKinds.includes(document.kind as PetDocument['kind'])
      ? document.kind as PetDocument['kind']
      : 'altro',
    dataUrl: text(document.dataUrl),
    addedAt: text(document.addedAt) || new Date().toISOString(),
  }))
}

export const migrateEvents = (value: unknown): CareEvent[] => {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord).map((event) => {
    const note = optionalText(event.note) ?? optionalText(event.detail)
    const durationMin = optionalNumber(event.durationMin) ?? optionalNumber(event.durationMinutes)
    return {
      id: text(event.id) || createId(),
      type: eventTypes.includes(event.type as CareEventType) ? event.type as CareEventType : 'note',
      caregiverId: text(event.caregiverId) || text(event.authorId),
      happenedAt: text(event.happenedAt) || new Date().toISOString(),
      ...(note ? { note } : {}),
      ...(durationMin !== undefined ? { durationMin } : {}),
      ...(optionalText(event.medicationId) ? { medicationId: optionalText(event.medicationId) } : {}),
      ...(optionalText(event.editedBy) ? { editedBy: optionalText(event.editedBy) } : {}),
      ...(optionalText(event.editedAt) ? { editedAt: optionalText(event.editedAt) } : {}),
      ...(optionalText(event.deletedBy) ? { deletedBy: optionalText(event.deletedBy) } : {}),
      ...(optionalText(event.deletedAt) ? { deletedAt: optionalText(event.deletedAt) } : {}),
    }
  })
}

const migrateVaccinations = (value: unknown): VaccinationRecord[] => recordList(value).map((record) => ({
  id: text(record.id) || createId(), name: text(record.name) || 'Vaccinazione',
  administeredDate: text(record.administeredDate), nextDate: text(record.nextDate),
  lotNumber: text(record.lotNumber), expiryDate: text(record.expiryDate), notes: text(record.notes),
  documents: migrateDocuments(record.documents),
}))

const migratePreventions = (value: unknown): PreventionRecord[] => recordList(value).map((record) => ({
  id: text(record.id) || createId(), kind: text(record.kind) || 'Antiparassitario',
  product: text(record.product), lastDate: text(record.lastDate), intervalDays: number(record.intervalDays, 30),
  seasonalPause: record.seasonalPause === true,
  ...(optionalNumber(record.pauseStartMonth) ? { pauseStartMonth: optionalNumber(record.pauseStartMonth) } : {}),
  ...(optionalNumber(record.pauseEndMonth) ? { pauseEndMonth: optionalNumber(record.pauseEndMonth) } : {}),
  documents: migrateDocuments(record.documents),
}))

const migrateMedications = (value: unknown): MedicationRecord[] => recordList(value).map((record) => ({
  id: text(record.id) || createId(), name: text(record.name) || 'Terapia', dose: text(record.dose),
  times: Array.isArray(record.times) ? record.times.map(text).filter(Boolean) : [],
  startDate: text(record.startDate), endDate: text(record.endDate), active: record.active === true,
  documents: migrateDocuments(record.documents),
}))

const migrateVisits = (value: unknown): VetVisitRecord[] => recordList(value).map((record) => ({
  id: text(record.id) || createId(), title: text(record.title) || 'Visita veterinaria',
  date: text(record.date), notes: text(record.notes), documents: migrateDocuments(record.documents),
}))

const migrateWeights = (value: unknown): WeightRecord[] => recordList(value).map((record) => ({
  id: text(record.id) || createId(), value: number(record.value), date: text(record.date),
  documents: migrateDocuments(record.documents),
}))

const migrateGrooming = (value: unknown): GroomingRecord[] => recordList(value).map((record) => ({
  id: text(record.id) || createId(), title: text(record.title) || 'Toelettatura / bagno',
  lastDate: text(record.lastDate), intervalWeeks: number(record.intervalWeeks), notes: text(record.notes),
  documents: migrateDocuments(record.documents),
}))

export const migrateHealth = (value: unknown): HealthData => {
  const health = isRecord(value) ? value : {}
  return {
    vaccinations: migrateVaccinations(health.vaccinations),
    preventions: migratePreventions(health.preventions),
    medications: migrateMedications(health.medications),
    visits: migrateVisits(health.visits),
    weights: migrateWeights(health.weights),
    grooming: migrateGrooming(health.grooming),
  }
}

export const migrateTrickProgress = (value: unknown) => {
  if (!isRecord(value)) return {}
  return Object.entries(value).reduce<Record<string, TrickProgressRecord>>((result, [id, progress]) => {
    if (!isRecord(progress) || !trickStatuses.includes(progress.status as TrickStatus)) return result
    const learnedAt = optionalText(progress.learnedAt)
    result[id] = { status: progress.status as TrickStatus, ...(learnedAt ? { learnedAt } : {}) }
    return result
  }, {})
}

export const migrateBadges = (value: unknown): AchievementBadge[] => Array.isArray(value)
  ? value.filter(isRecord).map((badge) => ({
    id: text(badge.id) || createId(), title: text(badge.title) || 'Traguardo',
    unlockedAt: text(badge.unlockedAt) || new Date().toISOString(),
  }))
  : []

export const migrateQuizResult = (value: unknown): QuizResultRecord | undefined => {
  if (!isRecord(value)) return undefined
  const vector = value.vector
  const rawAnswers = value.answers
  if (!isRecord(vector) || !isRecord(rawAnswers)) return undefined
  const archetypeId = text(value.archetypeId)
  const completedAt = text(value.completedAt)
  const axes = ['E', 'C', 'S', 'F'] as const
  if (!archetypeId || !completedAt || axes.some((axis) => optionalNumber(vector[axis]) === undefined)) {
    return undefined
  }
  const answers = Object.entries(rawAnswers).reduce<Record<string, string>>((result, [questionId, optionId]) => {
    if (typeof optionId === 'string') result[questionId] = optionId
    return result
  }, {})
  return {
    archetypeId,
    vector: {
      E: optionalNumber(vector.E) ?? 0,
      C: optionalNumber(vector.C) ?? 0,
      S: optionalNumber(vector.S) ?? 0,
      F: optionalNumber(vector.F) ?? 0,
    },
    answers,
    completedAt,
  }
}
