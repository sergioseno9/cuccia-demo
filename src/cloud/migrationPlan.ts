import { migrateAppData } from '../lib/migrate.ts'
import type {
  AppData, CareEvent, GroomingRecord, MedicationRecord, PetData, PetDocument,
  PreventionRecord, VaccinationRecord, VetVisitRecord, WeightRecord,
} from '../types'

export interface MigrationCounts {
  pets: number
  activities: number
  healthEvents: number
  medications: number
  medicationLogs: number
  weightLogs: number
  documents: number
  contentProgress: number
}

export interface PlannedDocument {
  sourceId: string
  document: PetDocument
  parentType: 'pet' | 'health' | 'medication' | 'weight'
  parentSourceId?: string
}

export interface PlannedHealthEvent {
  sourceId: string
  eventType: string
  title: string
  occurredOn: string | null
  dueOn: string | null
  details: unknown
  documents: PetDocument[]
}

export interface PlannedPet {
  pet: PetData
  healthEvents: PlannedHealthEvent[]
  medications: MedicationRecord[]
  weights: WeightRecord[]
  activities: CareEvent[]
  medicationEvents: CareEvent[]
  documents: PlannedDocument[]
}

export interface MigrationPlan {
  normalized: AppData
  fingerprint: string
  counts: MigrationCounts
  pets: PlannedPet[]
}

const documentMetadata = ({ id, name, kind, addedAt }: PetDocument) => ({ id, name, kind, addedAt })

const withoutDocuments = <RecordType extends { documents: PetDocument[] }>(record: RecordType) => ({
  ...record,
  documents: record.documents.map(documentMetadata),
})

const addDays = (date: string, days: number) => {
  if (!date || !days) return null
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

const vaccinationEvent = (record: VaccinationRecord): PlannedHealthEvent => ({
  sourceId: `vaccination:${record.id}`,
  eventType: 'vaccination', title: record.name,
  occurredOn: record.administeredDate || null, dueOn: record.nextDate || null,
  details: withoutDocuments(record), documents: record.documents,
})

const preventionEvent = (record: PreventionRecord): PlannedHealthEvent => ({
  sourceId: `prevention:${record.id}`,
  eventType: record.kind.toLowerCase().includes('svermin') ? 'deworming' : 'prevention',
  title: record.kind || record.product,
  occurredOn: record.lastDate || null, dueOn: addDays(record.lastDate, record.intervalDays),
  details: withoutDocuments(record), documents: record.documents,
})

const visitEvent = (record: VetVisitRecord): PlannedHealthEvent => ({
  sourceId: `visit:${record.id}`, eventType: 'visit', title: record.title,
  occurredOn: record.date || null, dueOn: record.date || null,
  details: withoutDocuments(record), documents: record.documents,
})

const groomingEvent = (record: GroomingRecord): PlannedHealthEvent => ({
  sourceId: `grooming:${record.id}`, eventType: 'grooming', title: record.title,
  occurredOn: record.lastDate || null, dueOn: addDays(record.lastDate, record.intervalWeeks * 7),
  details: withoutDocuments(record), documents: record.documents,
})

const planDocuments = (pet: PetData, healthEvents: PlannedHealthEvent[]): PlannedDocument[] => [
  ...pet.profile.documents.map((document) => ({ sourceId: `pet:${document.id}`, document, parentType: 'pet' as const })),
  ...healthEvents.flatMap((event) => event.documents.map((document) => ({
    sourceId: `${event.sourceId}:${document.id}`, document,
    parentType: 'health' as const, parentSourceId: event.sourceId,
  }))),
  ...pet.health.medications.flatMap((record) => record.documents.map((document) => ({
    sourceId: `medication:${record.id}:${document.id}`, document,
    parentType: 'medication' as const, parentSourceId: record.id,
  }))),
  ...pet.health.weights.flatMap((record) => record.documents.map((document) => ({
    sourceId: `weight:${record.id}:${document.id}`, document,
    parentType: 'weight' as const, parentSourceId: record.id,
  }))),
]

const planPet = (pet: PetData): PlannedPet => {
  const medicationIds = new Set(pet.health.medications.map((record) => record.id))
  const healthEvents = [
    ...pet.health.vaccinations.map(vaccinationEvent),
    ...pet.health.preventions.map(preventionEvent),
    ...pet.health.visits.map(visitEvent),
    ...pet.health.grooming.map(groomingEvent),
  ]
  return {
    pet, healthEvents,
    medications: pet.health.medications,
    weights: pet.health.weights,
    activities: pet.events,
    medicationEvents: pet.events.filter((event) =>
      event.type === 'medication' && event.medicationId && medicationIds.has(event.medicationId)),
    documents: planDocuments(pet, healthEvents),
  }
}

const contentCount = (pet: PetData) =>
  Object.keys(pet.trickProgress).length + pet.badges.length + (pet.quizResult ? 1 : 0)

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const buildMigrationPlan = async (input: unknown): Promise<MigrationPlan> => {
  const normalized = migrateAppData(input)
  const pets = normalized.pets.map(planPet)
  const counts: MigrationCounts = {
    pets: pets.length,
    activities: pets.reduce((count, item) => count + item.activities.length, 0),
    healthEvents: pets.reduce((count, item) => count + item.healthEvents.length, 0),
    medications: pets.reduce((count, item) => count + item.medications.length, 0),
    medicationLogs: pets.reduce((count, item) => count + item.medicationEvents.length, 0),
    weightLogs: pets.reduce((count, item) => count + item.weights.length, 0),
    documents: pets.reduce((count, item) => count + item.documents.length, 0),
    contentProgress: pets.reduce((count, item) => count + contentCount(item.pet), 0),
  }
  return { normalized, pets, counts, fingerprint: await sha256(JSON.stringify(normalized)) }
}

export const migrationIdempotencyKeys = (plan: MigrationPlan) => plan.pets.flatMap((item) => [
  `pets:${item.pet.id}`,
  ...item.activities.map((record) => `activities:${item.pet.id}:${record.id}`),
  ...item.healthEvents.map((record) => `health:${item.pet.id}:${record.sourceId}`),
  ...item.medications.map((record) => `medications:${item.pet.id}:${record.id}`),
  ...item.medicationEvents.map((record) => `doses:${item.pet.id}:${record.id}`),
  ...item.weights.map((record) => `weights:${item.pet.id}:${record.id}`),
  ...item.documents.map((record) => `documents:${item.pet.id}:${record.sourceId}`),
  ...Object.keys(item.pet.trickProgress).map((id) => `content:${item.pet.id}:trick:${id}`),
  ...item.pet.badges.map((badge) => `content:${item.pet.id}:badge:${badge.id}`),
  ...(item.pet.quizResult ? [`content:${item.pet.id}:quiz:archetype`] : []),
])
