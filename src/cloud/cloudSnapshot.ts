import { caregiverColors } from '../data.ts'
import { createEmptyHealth, migrateAppData } from '../lib/migrate.ts'
import { createEmptyProfile } from '../lib/profile.ts'
import type {
  AchievementBadge,
  AppData,
  CareEvent,
  CareEventType,
  Caregiver,
  GroomingRecord,
  MedicationRecord,
  PetData,
  PetDocument,
  PetDocumentKind,
  PetProfile,
  PetSpecies,
  PreventionRecord,
  QuizResultRecord,
  TrickProgressRecord,
  VaccinationRecord,
  VetVisitRecord,
  WeightRecord,
} from '../types.ts'

export interface CloudSnapshotRows {
  pets: unknown[]
  activities: unknown[]
  healthEvents: unknown[]
  medications: unknown[]
  weightLogs: unknown[]
  documents: unknown[]
  contentProgress: unknown[]
  assetUrls: Map<string, string>
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? value as Record<string, unknown> : {}

const text = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback
const nullableText = (value: unknown) => typeof value === 'string' ? value : undefined
const numberValue = (value: unknown) => typeof value === 'number' ? value : Number(value)
const validSpecies = (value: unknown): PetSpecies => value === 'gatto' ? 'gatto' : 'cane'
const localId = (row: Record<string, unknown>) => text(row.legacy_source_id, text(row.id))

const documentFromRow = (row: Record<string, unknown>, urls: Map<string, string>): PetDocument => ({
  id: localId(row).split(':').at(-1) || text(row.id),
  name: text(row.file_name, 'Documento'),
  kind: text(row.kind, 'altro') as PetDocumentKind,
  dataUrl: urls.get(text(row.storage_path)) ?? '',
  addedAt: text(row.created_at, new Date(0).toISOString()),
})

const relatedDocuments = (
  rows: Record<string, unknown>[],
  urls: Map<string, string>,
  key: 'health_event_id' | 'medication_id' | 'weight_log_id',
  parentId: string,
) => rows.filter((row) => text(row[key]) === parentId).map((row) => documentFromRow(row, urls))

const profileDocuments = (rows: Record<string, unknown>[], urls: Map<string, string>, petId: string) =>
  rows.filter((row) => text(row.pet_id) === petId
    && !row.health_event_id && !row.medication_id && !row.weight_log_id)
    .map((row) => documentFromRow(row, urls))

const buildCaregivers = (activityRows: Record<string, unknown>[], displayName: string) => {
  const names = [...new Set([
    displayName,
    ...activityRows.map((row) => text(row.author_snapshot)),
  ].filter(Boolean))]
  const caregivers = names.map<Caregiver>((name, index) => ({
    id: `cloud-caregiver-${index + 1}`,
    name,
    role: index === 0 ? 'Account' : 'Famiglia',
    color: caregiverColors[index % caregiverColors.length],
  }))
  return caregivers.length ? caregivers : [{
    id: 'cloud-caregiver-1', name: 'Famiglia', role: 'Account', color: caregiverColors[0],
  }]
}

const healthForPet = (
  cloudPetId: string,
  healthRows: Record<string, unknown>[],
  medicationRows: Record<string, unknown>[],
  weightRows: Record<string, unknown>[],
  documentRows: Record<string, unknown>[],
  urls: Map<string, string>,
) => {
  const health = createEmptyHealth()
  for (const row of healthRows.filter((item) => text(item.pet_id) === cloudPetId && !item.deleted_at)) {
    const details = asRecord(row.details)
    const id = text(details.id, localId(row))
    const documents = relatedDocuments(documentRows, urls, 'health_event_id', text(row.id))
    const record = { ...details, id, documents }
    if (row.event_type === 'vaccination') health.vaccinations.push(record as unknown as VaccinationRecord)
    if (row.event_type === 'prevention' || row.event_type === 'deworming') {
      health.preventions.push(record as unknown as PreventionRecord)
    }
    if (row.event_type === 'visit') health.visits.push(record as unknown as VetVisitRecord)
    if (row.event_type === 'grooming') health.grooming.push(record as unknown as GroomingRecord)
  }
  for (const row of medicationRows.filter((item) => text(item.pet_id) === cloudPetId && !item.deleted_at)) {
    const details = asRecord(row.details)
    health.medications.push({
      ...details,
      id: text(details.id, localId(row)),
      documents: relatedDocuments(documentRows, urls, 'medication_id', text(row.id)),
    } as unknown as MedicationRecord)
  }
  for (const row of weightRows.filter((item) => text(item.pet_id) === cloudPetId && !item.deleted_at)) {
    health.weights.push({
      id: localId(row),
      value: numberValue(row.value_kg),
      date: text(row.weighed_on),
      documents: relatedDocuments(documentRows, urls, 'weight_log_id', text(row.id)),
    } as WeightRecord)
  }
  return health
}

const contentForPet = (cloudPetId: string, rows: Record<string, unknown>[]) => {
  const trickProgress: Record<string, TrickProgressRecord> = {}
  const badges: AchievementBadge[] = []
  let quizResult: QuizResultRecord | undefined
  for (const row of rows.filter((item) => text(item.pet_id) === cloudPetId)) {
    const progress = asRecord(row.progress)
    const contentId = text(row.content_id)
    if (row.content_type === 'trick') trickProgress[contentId] = progress as unknown as TrickProgressRecord
    if (row.content_type === 'badge') badges.push(progress as unknown as AchievementBadge)
    if (row.content_type === 'quiz') quizResult = progress as unknown as QuizResultRecord
  }
  return { trickProgress, badges, ...(quizResult ? { quizResult } : {}) }
}

export const mapCloudSnapshot = (
  rows: CloudSnapshotRows,
  displayName: string,
): AppData => {
  const pets = rows.pets.map(asRecord).filter((row) => !row.deleted_at)
  const activities = rows.activities.map(asRecord)
  const healthEvents = rows.healthEvents.map(asRecord)
  const medications = rows.medications.map(asRecord)
  const weights = rows.weightLogs.map(asRecord)
  const documents = rows.documents.map(asRecord)
  const content = rows.contentProgress.map(asRecord)
  const caregivers = buildCaregivers(activities, displayName)
  const caregiverByName = new Map(caregivers.map((item) => [item.name, item.id]))
  const medicationIds = new Map(medications.map((row) => [text(row.id), localId(row)]))

  const mappedPets = pets.map<PetData>((row) => {
    const cloudPetId = text(row.id)
    const id = localId(row)
    const species = validSpecies(row.species)
    const stored = asRecord(row.profile_data) as Partial<PetProfile>
    const profile: PetProfile = {
      ...createEmptyProfile(species, id),
      ...stored,
      id,
      name: text(row.name, text(stored.name, 'Il tuo pet')),
      species,
      photo: rows.assetUrls.get(text(row.photo_path)) ?? '',
      documents: profileDocuments(documents, rows.assetUrls, cloudPetId),
    }
    const events = activities
      .filter((activity) => text(activity.pet_id) === cloudPetId)
      .map<CareEvent>((activity) => ({
        id: localId(activity),
        type: text(activity.activity_type, 'note') as CareEventType,
        caregiverId: caregiverByName.get(text(activity.author_snapshot)) ?? caregivers[0].id,
        happenedAt: text(activity.happened_at),
        note: nullableText(activity.note),
        durationMin: activity.duration_minutes == null ? undefined : numberValue(activity.duration_minutes),
        medicationId: medicationIds.get(text(activity.medication_id)),
        editedAt: nullableText(activity.edited_at),
        deletedAt: nullableText(activity.deleted_at),
      }))
    return {
      id,
      profile,
      events,
      health: healthForPet(cloudPetId, healthEvents, medications, weights, documents, rows.assetUrls),
      ...contentForPet(cloudPetId, content),
    }
  })

  return migrateAppData({
    schemaVersion: 2,
    household: { caregivers },
    pets: mappedPets,
    selectedPetId: mappedPets[0]?.id ?? '',
    selectedCaregiverId: caregivers[0]?.id ?? '',
    tutorialDone: true,
  })
}
