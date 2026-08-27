import { conditionIds, lifePhaseIds, modulePresets, trackedModuleIds, withRequiredModules } from './profile'
import type { AchievementBadge, AppData, CareEvent, CareEventType, Caregiver, DogCondition, DogDocument, DogProfile, GroomingRecord, HealthData, LifePhase, TrackedModule, TrickProgressRecord, TrickStatus } from '../types'

const eventTypes: CareEventType[] = ['meal', 'water', 'pee', 'poop', 'walk', 'sleep', 'grooming', 'medication', 'note']
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const text = (value: unknown) => typeof value === 'string' ? value : ''
const optionalText = (value: unknown) => typeof value === 'string' && value ? value : undefined
const optionalNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : undefined
const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

const migrateCaregivers = (value: unknown): Caregiver[] => {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord).map((caregiver, index) => ({
    id: text(caregiver.id) || createId(),
    name: text(caregiver.name) || `Caregiver ${index + 1}`,
    role: text(caregiver.role) || 'Caregiver',
    color: text(caregiver.color) || '#D9694A',
  }))
}

const migrateProfile = (value: unknown): DogProfile | null => {
  if (!isRecord(value)) return null
  const lifePhase: LifePhase = lifePhaseIds.includes(value.lifePhase as LifePhase)
    ? value.lifePhase as LifePhase
    : 'adulto'
  const conditions = Array.isArray(value.conditions)
    ? value.conditions.filter((item): item is DogCondition => conditionIds.includes(item as DogCondition))
    : []
  const rawModules = Array.isArray(value.trackedModules) ? value.trackedModules : []
  const savedModules = rawModules.length
    ? rawModules.filter((item): item is TrackedModule => trackedModuleIds.includes(item as TrackedModule))
    : modulePresets[lifePhase]
  const migratedModules = rawModules.includes('outings')
    ? savedModules
    : [...savedModules, 'outings' as const]
  const legacyConditionNotes = typeof value.conditions === 'string' ? value.conditions : ''
  const outingIntervalHours = optionalNumber(value.outingIntervalHours) ?? optionalNumber(value.needsIntervalHours)
  const feeding = isRecord(value.feeding) ? value.feeding : {}
  const documents: DogDocument[] = Array.isArray(value.documents)
    ? value.documents.filter(isRecord).map((document) => ({
      id: text(document.id) || createId(),
      name: text(document.name) || 'Documento',
      kind: document.kind === 'libretto' || document.kind === 'pedigree' || document.kind === 'ricevuta' ? document.kind : 'altro',
      dataUrl: text(document.dataUrl),
      addedAt: text(document.addedAt) || new Date().toISOString(),
    }))
    : []

  return {
    createdAt: text(value.createdAt) || new Date().toISOString(),
    lifePhase,
    trackedModules: withRequiredModules(migratedModules, conditions),
    conditions,
    conditionNotes: text(value.conditionNotes) || legacyConditionNotes,
    ...(outingIntervalHours && outingIntervalHours > 0 ? { outingIntervalHours } : {}),
    name: text(value.name),
    photo: text(value.photo),
    birthDate: text(value.birthDate),
    sex: value.sex === 'male' || value.sex === 'female' ? value.sex : 'unknown',
    breed: text(value.breed),
    size: value.size === 'small' || value.size === 'large' ? value.size : 'medium',
    weight: text(value.weight),
    microchip: text(value.microchip),
    vetName: text(value.vetName),
    vetPhone: text(value.vetPhone),
    emergencyContact: text(value.emergencyContact),
    groomerName: text(value.groomerName),
    groomerPhone: text(value.groomerPhone),
    feeding: {
      food: text(feeding.food),
      portion: text(feeding.portion),
      schedule: text(feeding.schedule),
      notes: text(feeding.notes),
    },
    allergies: text(value.allergies),
    notes: text(value.notes),
    annualCheckDate: text(value.annualCheckDate),
    insuranceRenewalDate: text(value.insuranceRenewalDate),
    microchipRenewalDate: text(value.microchipRenewalDate),
    documents,
    caregivers: migrateCaregivers(value.caregivers),
  }
}

const migrateEvents = (value: unknown): CareEvent[] => {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord).map((event) => ({
    id: text(event.id) || createId(),
    type: eventTypes.includes(event.type as CareEventType) ? event.type as CareEventType : 'note',
    caregiverId: text(event.caregiverId) || text(event.authorId),
    happenedAt: text(event.happenedAt) || new Date().toISOString(),
    note: optionalText(event.note) ?? optionalText(event.detail),
    durationMin: optionalNumber(event.durationMin) ?? optionalNumber(event.durationMinutes),
    medicationId: optionalText(event.medicationId),
    editedBy: optionalText(event.editedBy),
    editedAt: optionalText(event.editedAt),
    deletedBy: optionalText(event.deletedBy),
    deletedAt: optionalText(event.deletedAt),
  }))
}

const records = <Type>(value: unknown) => Array.isArray(value) ? value as Type[] : []

const migrateHealth = (value: unknown): HealthData => {
  const health = isRecord(value) ? value : {}
  return {
    vaccinations: records(health.vaccinations),
    preventions: records(health.preventions),
    medications: records(health.medications),
    visits: records(health.visits),
    weights: records(health.weights),
    grooming: records(health.grooming),
  }
}

const trickStatuses: TrickStatus[] = ['da_imparare', 'in_corso', 'imparato']

const migrateTrickProgress = (value: unknown) => {
  if (!isRecord(value)) return {}
  return Object.entries(value).reduce<Record<string, TrickProgressRecord>>((result, [id, progress]) => {
    if (!isRecord(progress) || !trickStatuses.includes(progress.status as TrickStatus)) return result
    result[id] = {
      status: progress.status as TrickStatus,
      ...(optionalText(progress.learnedAt) ? { learnedAt: optionalText(progress.learnedAt) } : {}),
    }
    return result
  }, {})
}

const migrateBadges = (value: unknown): AchievementBadge[] => Array.isArray(value)
  ? value.filter(isRecord).map((badge) => ({
    id: text(badge.id) || createId(),
    title: text(badge.title) || 'Traguardo',
    unlockedAt: text(badge.unlockedAt) || new Date().toISOString(),
  }))
  : []

export const migrateAppData = (value: unknown): AppData => {
  const source = isRecord(value) ? value : {}
  const profile = migrateProfile(source.profile)
  const selected = text(source.selectedCaregiverId)
  const events = migrateEvents(source.events)
  const health = migrateHealth(source.health)
  const legacyGrooming: GroomingRecord[] = health.grooming.length ? [] : events
    .filter((event) => event.type === 'grooming' && !event.deletedAt)
    .map((event) => ({
      id: `migrated-${event.id}`,
      title: event.note || 'Toelettatura / bagno',
      lastDate: event.happenedAt.slice(0, 10),
      intervalWeeks: 0,
      notes: 'Importato dal Diario precedente.',
    }))
  return {
    profile,
    events,
    health: { ...health, grooming: [...health.grooming, ...legacyGrooming] },
    tutorialDone: typeof source.tutorialDone === 'boolean' ? source.tutorialDone : false,
    trickProgress: migrateTrickProgress(source.trickProgress),
    badges: migrateBadges(source.badges),
    selectedCaregiverId: profile?.caregivers.some((caregiver) => caregiver.id === selected)
      ? selected
      : profile?.caregivers[0]?.id ?? '',
  }
}
