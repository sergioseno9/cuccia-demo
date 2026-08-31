import type { SupabaseClient, User } from '@supabase/supabase-js'
import { getSupabaseClient } from '../lib/supabase.ts'
import type { PetProfile } from '../types'
import { saveCloudLink } from './cloudLink.ts'
import type { CloudLink } from './cloudLink'
import { dataUrlToBlob, safeStorageName } from './dataUrl.ts'
import type { MigrationCounts, MigrationPlan, PlannedDocument, PlannedPet } from './migrationPlan'

interface BatchRecord {
  id: string
  household_id: string
  status: 'pending' | 'completed' | 'failed'
  imported_counts: MigrationCounts | Record<string, never>
}

export interface CloudImportResult {
  link: CloudLink
  counts: MigrationCounts
  reusedBatch: boolean
}

interface CloudImportOptions {
  client?: SupabaseClient
  saveLink?: (link: CloudLink) => void
}

const assertNoError = (error: { message: string } | null) => {
  if (error) throw new Error(error.message)
}

const asRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object') throw new Error('Risposta cloud non valida.')
  return value as Record<string, unknown>
}

const asId = (value: unknown) => {
  const id = asRecord(value).id
  if (typeof id !== 'string') throw new Error('Identificativo cloud mancante.')
  return id
}

const sanitizeProfile = (profile: PetProfile) => ({
  ...profile,
  photo: '',
  documents: profile.documents.map(({ id, name, kind, addedAt }) => ({ id, name, kind, addedAt })),
})

const getOrCreateHousehold = async (client: SupabaseClient, user: User, petName: string) => {
  const membership = await client.from('household_members')
    .select('household_id').eq('user_id', user.id).eq('role', 'owner').eq('status', 'active').limit(1).maybeSingle()
  assertNoError(membership.error)
  const existing = membership.data && asRecord(membership.data).household_id
  if (typeof existing === 'string') return existing
  const created = await client.rpc('create_household_with_owner', { household_name: `Casa di ${petName || 'Cuccia'}` })
  assertNoError(created.error)
  if (typeof created.data !== 'string') throw new Error('Non riesco a creare la casa cloud.')
  return created.data
}

const upsertMap = async (
  client: SupabaseClient,
  table: string,
  rows: Record<string, unknown>[],
  conflict: string,
) => {
  const ids = new Map<string, string>()
  if (!rows.length) return ids
  const response = await client.from(table).upsert(rows, { onConflict: conflict }).select('id,legacy_source_id')
  assertNoError(response.error)
  for (const item of response.data ?? []) {
    const record = asRecord(item)
    if (typeof record.id === 'string' && typeof record.legacy_source_id === 'string') {
      ids.set(record.legacy_source_id, record.id)
    }
  }
  return ids
}

const uploadDataUrl = async (client: SupabaseClient, path: string, dataUrl: string) => {
  const blob = dataUrlToBlob(dataUrl)
  const uploaded = await client.storage.from('pet-documents').upload(path, blob, {
    contentType: blob.type, upsert: true,
  })
  assertNoError(uploaded.error)
  return { path, blob }
}

const contentRows = (item: PlannedPet, petId: string, householdId: string, batchId: string) => [
  ...Object.entries(item.pet.trickProgress).map(([id, progress]) => ({
    pet_id: petId, household_id: householdId, migration_batch_id: batchId,
    content_type: 'trick', content_id: id, progress,
    completed_at: progress.learnedAt ?? null,
  })),
  ...item.pet.badges.map((badge) => ({
    pet_id: petId, household_id: householdId, migration_batch_id: batchId,
    content_type: 'badge', content_id: badge.id, progress: badge,
    completed_at: badge.unlockedAt,
  })),
  ...(item.pet.quizResult ? [{
    pet_id: petId, household_id: householdId, migration_batch_id: batchId,
    content_type: 'quiz', content_id: 'archetype', progress: item.pet.quizResult,
    completed_at: item.pet.quizResult.completedAt,
  }] : []),
]

const documentRow = (
  planned: PlannedDocument,
  petId: string,
  householdId: string,
  batchId: string,
  userId: string,
  path: string,
  blob: Blob,
  parentIds: Record<string, Map<string, string>>,
) => ({
  pet_id: petId, household_id: householdId, migration_batch_id: batchId,
  uploaded_by: userId, legacy_source_id: planned.sourceId,
  kind: planned.document.kind, file_name: planned.document.name,
  mime_type: blob.type, byte_size: blob.size, storage_path: path,
  health_event_id: planned.parentType === 'health' ? parentIds.health.get(planned.parentSourceId ?? '') : null,
  medication_id: planned.parentType === 'medication' ? parentIds.medication.get(planned.parentSourceId ?? '') : null,
  weight_log_id: planned.parentType === 'weight' ? parentIds.weight.get(planned.parentSourceId ?? '') : null,
})

const importPet = async (
  client: SupabaseClient,
  item: PlannedPet,
  householdId: string,
  batchId: string,
  user: User,
  caregiverNames: Map<string, string>,
  uploadedPaths: string[],
) => {
  const created = await client.rpc('create_pet_with_owner', {
    target_household_id: householdId, pet_payload: sanitizeProfile(item.pet.profile),
    source_id: item.pet.id, batch_id: batchId,
  })
  assertNoError(created.error)
  if (typeof created.data !== 'string') throw new Error('Scheda pet cloud non valida.')
  const petId = created.data

  if (item.pet.profile.photo.startsWith('data:')) {
    const path = `households/${householdId}/pets/${petId}/profile/photo-${item.pet.id}.jpg`
    await uploadDataUrl(client, path, item.pet.profile.photo)
    uploadedPaths.push(path)
    const updated = await client.from('pets').update({ photo_path: path }).eq('id', petId)
    assertNoError(updated.error)
  }

  const medications = await upsertMap(client, 'medications', item.medications.map((record) => ({
    pet_id: petId, household_id: householdId, created_by: user.id,
    migration_batch_id: batchId, legacy_source_id: record.id,
    name: record.name, dose_text: record.dose, times: record.times,
    start_date: record.startDate || null, end_date: record.endDate || null,
    active: record.active, details: { ...record, documents: [] },
  })), 'pet_id,legacy_source_id')

  const health = await upsertMap(client, 'health_events', item.healthEvents.map((record) => ({
    pet_id: petId, household_id: householdId, created_by: user.id,
    migration_batch_id: batchId, legacy_source_id: record.sourceId,
    event_type: record.eventType, title: record.title,
    occurred_on: record.occurredOn, due_on: record.dueOn,
    confirmed_manually: true, details: record.details,
  })), 'pet_id,legacy_source_id')

  const weights = await upsertMap(client, 'weight_logs', item.weights.map((record) => ({
    pet_id: petId, household_id: householdId, recorded_by: user.id,
    migration_batch_id: batchId, legacy_source_id: record.id,
    weighed_on: record.date, value_kg: record.value, source: 'manual',
  })), 'pet_id,legacy_source_id')

  if (item.activities.length) {
    const activities = await client.from('activities').upsert(item.activities.map((event) => ({
      pet_id: petId, household_id: householdId, actor_user_id: null,
      author_snapshot: caregiverNames.get(event.caregiverId) ?? event.caregiverId,
      migration_batch_id: batchId, legacy_source_id: event.id, client_mutation_id: event.id,
      activity_type: event.type, happened_at: event.happenedAt,
      duration_minutes: event.durationMin ?? null, note: event.note ?? '',
      medication_id: event.medicationId ? medications.get(event.medicationId) ?? null : null,
      edited_at: event.editedAt ?? null, deleted_at: event.deletedAt ?? null,
    })), { onConflict: 'pet_id,client_mutation_id' })
    assertNoError(activities.error)
  }

  if (item.medicationEvents.length) {
    const logs = await client.from('medication_logs').upsert(item.medicationEvents.map((event) => ({
      pet_id: petId, household_id: householdId,
      medication_id: medications.get(event.medicationId ?? '') ?? '',
      actor_user_id: null, author_snapshot: caregiverNames.get(event.caregiverId) ?? event.caregiverId,
      migration_batch_id: batchId, legacy_source_id: event.id, client_mutation_id: event.id,
      scheduled_for: event.happenedAt, administered_at: event.happenedAt,
      status: 'administered', note: event.note ?? '', deleted_at: event.deletedAt ?? null,
    })), { onConflict: 'pet_id,client_mutation_id' })
    assertNoError(logs.error)
  }

  const plannedContent = contentRows(item, petId, householdId, batchId)
  if (plannedContent.length) {
    const progress = await client.from('pet_content_progress').upsert(
      plannedContent, { onConflict: 'pet_id,content_type,content_id' },
    )
    assertNoError(progress.error)
  }

  const parentIds = { health, medication: medications, weight: weights }
  for (const planned of item.documents) {
    const fileName = `${safeStorageName(planned.sourceId)}-${safeStorageName(planned.document.name)}`
    const path = `households/${householdId}/pets/${petId}/documents/${fileName}`
    const { blob } = await uploadDataUrl(client, path, planned.document.dataUrl)
    uploadedPaths.push(path)
    const response = await client.from('documents').upsert(
      documentRow(planned, petId, householdId, batchId, user.id, path, blob, parentIds),
      { onConflict: 'pet_id,legacy_source_id' },
    )
    assertNoError(response.error)
  }
}

const countImportedRows = async (client: SupabaseClient, batchId: string): Promise<MigrationCounts> => {
  const tables: Array<[keyof MigrationCounts, string]> = [
    ['pets', 'pets'], ['activities', 'activities'], ['healthEvents', 'health_events'],
    ['medications', 'medications'], ['medicationLogs', 'medication_logs'],
    ['weightLogs', 'weight_logs'], ['documents', 'documents'], ['contentProgress', 'pet_content_progress'],
  ]
  const result = {} as MigrationCounts
  for (const [key, table] of tables) {
    const response = await client.from(table).select('*', { count: 'exact', head: true }).eq('migration_batch_id', batchId)
    assertNoError(response.error)
    result[key] = response.count ?? 0
  }
  return result
}

export const importMigrationPlan = async (
  plan: MigrationPlan,
  user: User,
  options: CloudImportOptions = {},
): Promise<CloudImportResult> => {
  const client = options.client ?? getSupabaseClient()
  const householdId = await getOrCreateHousehold(client, user, plan.pets[0]?.pet.profile.name ?? '')
  const started = await client.rpc('begin_migration_batch', {
    target_household_id: householdId, fingerprint: plan.fingerprint, expected: plan.counts,
  })
  assertNoError(started.error)
  const batch = asRecord(started.data) as unknown as BatchRecord
  const batchId = asId(batch)
  const reusedBatch = batch.status === 'completed'
  const uploadedPaths: string[] = []

  try {
    if (!reusedBatch) {
      const caregiverNames = new Map(plan.normalized.household.caregivers.map((item) => [item.id, item.name]))
      for (const item of plan.pets) {
        await importPet(client, item, householdId, batchId, user, caregiverNames, uploadedPaths)
      }
      const counts = await countImportedRows(client, batchId)
      const completed = await client.rpc('complete_migration_batch', { batch_id: batchId, imported: counts })
      assertNoError(completed.error)
    }
    const counts = reusedBatch ? batch.imported_counts as MigrationCounts : await countImportedRows(client, batchId)
    const link: CloudLink = { userId: user.id, householdId, batchId, linkedAt: new Date().toISOString(), source: 'cloud' }
    ;(options.saveLink ?? saveCloudLink)(link)
    return { link, counts, reusedBatch }
  } catch (error) {
    if (uploadedPaths.length) await client.storage.from('pet-documents').remove(uploadedPaths)
    if (!reusedBatch) await client.rpc('rollback_migration_batch', { batch_id: batchId })
    throw error
  }
}

export const createDocumentSignedUrl = async (path: string) => {
  const response = await getSupabaseClient().storage.from('pet-documents').createSignedUrl(path, 60)
  assertNoError(response.error)
  if (!response.data) throw new Error('Link documento non disponibile.')
  return response.data.signedUrl
}
