import { nextPreventionDate } from '../lib/deadlines.ts'
import type {
  GroomingRecord,
  HealthData,
  HealthRecordKey,
  MedicationRecord,
  PreventionRecord,
  VaccinationRecord,
  VetVisitRecord,
  WeightRecord,
} from '../types.ts'
import { syncCloudDocuments } from './cloudDocumentMutations.ts'
import { resolveCloudPet } from './cloudPetContext.ts'
import type { CloudMutationOptions, CloudPetContext } from './cloudPetContext.ts'

const documentMetadata = (documents: HealthData[HealthRecordKey][number]['documents']) => documents
  .map(({ id, name, kind, addedAt }) => ({ id, name, kind, addedAt }))

const details = <RecordType extends { documents: HealthData[HealthRecordKey][number]['documents'] }>(record: RecordType) => ({
  ...record,
  documents: documentMetadata(record.documents),
})

const sourceIds = (key: HealthRecordKey, id: string) => {
  if (key === 'preventions') return [`prevention:${id}`, `deworming:${id}`]
  if (key === 'vaccinations') return [`vaccination:${id}`]
  if (key === 'visits') return [`visit:${id}`]
  if (key === 'grooming') return [`grooming:${id}`]
  return [id]
}

const saveMedication = async (context: CloudPetContext, record: MedicationRecord) => {
  const response = await context.client.from('medications').upsert({
    pet_id: context.petId,
    household_id: context.householdId,
    created_by: context.user.id,
    legacy_source_id: record.id,
    name: record.name,
    dose_text: record.dose,
    times: record.times,
    start_date: record.startDate || null,
    end_date: record.endDate || null,
    active: record.active,
    details: details(record),
  }, { onConflict: 'pet_id,legacy_source_id' }).select('id').single()
  if (response.error) throw new Error(response.error.message)
  await syncCloudDocuments(context, { type: 'medication', id: response.data.id }, `medication:${record.id}`, record.documents)
}

const saveWeight = async (context: CloudPetContext, record: WeightRecord) => {
  const response = await context.client.from('weight_logs').upsert({
    pet_id: context.petId,
    household_id: context.householdId,
    recorded_by: context.user.id,
    legacy_source_id: record.id,
    weighed_on: record.date,
    value_kg: record.value,
    source: 'manual',
  }, { onConflict: 'pet_id,legacy_source_id' }).select('id').single()
  if (response.error) throw new Error(response.error.message)
  await syncCloudDocuments(context, { type: 'weight', id: response.data.id }, `weight:${record.id}`, record.documents)
}

const healthEventRow = (
  key: Exclude<HealthRecordKey, 'medications' | 'weights'>,
  record: VaccinationRecord | PreventionRecord | VetVisitRecord | GroomingRecord,
) => {
  if (key === 'vaccinations') {
    const vaccination = record as VaccinationRecord
    return { eventType: 'vaccination', sourceId: `vaccination:${record.id}`, title: vaccination.name, occurredOn: vaccination.administeredDate, dueOn: vaccination.nextDate }
  }
  if (key === 'preventions') {
    const prevention = record as PreventionRecord
    const eventType = /svermin/i.test(prevention.kind) ? 'deworming' : 'prevention'
    return { eventType, sourceId: `${eventType}:${record.id}`, title: prevention.kind || prevention.product, occurredOn: prevention.lastDate, dueOn: nextPreventionDate(prevention) }
  }
  if (key === 'visits') {
    const visit = record as VetVisitRecord
    return { eventType: 'visit', sourceId: `visit:${record.id}`, title: visit.title, occurredOn: visit.date, dueOn: visit.date }
  }
  const grooming = record as GroomingRecord
  const due = grooming.intervalWeeks > 0
    ? new Date(new Date(`${grooming.lastDate}T12:00:00`).getTime() + grooming.intervalWeeks * 7 * 86_400_000).toISOString().slice(0, 10)
    : null
  return { eventType: 'grooming', sourceId: `grooming:${record.id}`, title: grooming.title, occurredOn: grooming.lastDate, dueOn: due }
}

const saveHealthEvent = async (
  context: CloudPetContext,
  key: Exclude<HealthRecordKey, 'medications' | 'weights'>,
  record: VaccinationRecord | PreventionRecord | VetVisitRecord | GroomingRecord,
) => {
  const row = healthEventRow(key, record)
  const response = await context.client.from('health_events').upsert({
    pet_id: context.petId,
    household_id: context.householdId,
    created_by: context.user.id,
    legacy_source_id: row.sourceId,
    event_type: row.eventType,
    title: row.title,
    occurred_on: row.occurredOn || null,
    due_on: row.dueOn || null,
    confirmed_manually: true,
    details: details(record),
  }, { onConflict: 'pet_id,legacy_source_id' }).select('id').single()
  if (response.error) throw new Error(response.error.message)
  await syncCloudDocuments(context, { type: 'health', id: response.data.id }, row.sourceId, record.documents)
}

export const saveCloudHealthRecord = async <Key extends HealthRecordKey>(
  petSourceId: string,
  key: Key,
  record: HealthData[Key][number],
  options: CloudMutationOptions = {},
) => {
  const context = await resolveCloudPet(petSourceId, options)
  if (!context) return false
  if (key === 'medications') await saveMedication(context, record as MedicationRecord)
  else if (key === 'weights') await saveWeight(context, record as WeightRecord)
  else await saveHealthEvent(
    context,
    key as Exclude<HealthRecordKey, 'medications' | 'weights'>,
    record as VaccinationRecord | PreventionRecord | VetVisitRecord | GroomingRecord,
  )
  return true
}

export const deleteCloudHealthRecord = async (
  petSourceId: string,
  key: HealthRecordKey,
  id: string,
  options: CloudMutationOptions = {},
) => {
  const context = await resolveCloudPet(petSourceId, options)
  if (!context) return false
  const table = key === 'medications' ? 'medications' : key === 'weights' ? 'weight_logs' : 'health_events'
  const found = await context.client.from(table)
    .select('id')
    .eq('pet_id', context.petId)
    .in('legacy_source_id', sourceIds(key, id))
    .is('deleted_at', null)
  if (found.error) throw new Error(found.error.message)
  const ids = (found.data ?? []).map((row) => row.id)
  if (!ids.length) return true
  const deletedAt = new Date().toISOString()
  const deleted = await context.client.from(table)
    .update(table === 'health_events' ? { deleted_at: deletedAt, deleted_by: context.user.id } : { deleted_at: deletedAt })
    .in('id', ids)
  if (deleted.error) throw new Error(deleted.error.message)
  const parentColumn = key === 'medications' ? 'medication_id' : key === 'weights' ? 'weight_log_id' : 'health_event_id'
  const documents = await context.client.from('documents')
    .update({ deleted_at: deletedAt, deleted_by: context.user.id })
    .in(parentColumn, ids)
    .is('deleted_at', null)
  if (documents.error) throw new Error(documents.error.message)
  return true
}
