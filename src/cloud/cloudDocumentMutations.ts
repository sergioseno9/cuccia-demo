import type { CloudPetContext } from './cloudPetContext.ts'
import { dataUrlToBlob, safeStorageName } from './dataUrl.ts'
import type { PetDocument } from '../types.ts'

export type DocumentParent =
  | { type: 'pet' }
  | { type: 'health'; id: string }
  | { type: 'medication'; id: string }
  | { type: 'weight'; id: string }

const parentColumn = (parent: DocumentParent) => parent.type === 'health'
  ? 'health_event_id'
  : parent.type === 'medication'
    ? 'medication_id'
    : parent.type === 'weight' ? 'weight_log_id' : null

const documentSourceId = (parentSourceId: string, documentId: string) => `${parentSourceId}:${documentId}`

export const syncCloudDocuments = async (
  context: CloudPetContext,
  parent: DocumentParent,
  parentSourceId: string,
  documents: PetDocument[],
) => {
  const column = parentColumn(parent)
  let query = context.client.from('documents')
    .select('id,legacy_source_id,storage_path')
    .eq('pet_id', context.petId)
    .is('deleted_at', null)
  query = column
    ? query.eq(column, parent.type === 'pet' ? '' : parent.id)
    : query.is('health_event_id', null).is('medication_id', null).is('weight_log_id', null)
  const existingResponse = await query
  if (existingResponse.error) throw new Error(existingResponse.error.message)
  const existing = new Map((existingResponse.data ?? []).map((row) => [row.legacy_source_id, row]))
  const desiredIds = new Set(documents.map((document) => documentSourceId(parentSourceId, document.id)))

  for (const document of documents) {
    const sourceId = documentSourceId(parentSourceId, document.id)
    const stored = existing.get(sourceId)
    if (!document.dataUrl.startsWith('data:') && stored) {
      const updated = await context.client.from('documents')
        .update({ kind: document.kind, file_name: document.name })
        .eq('id', stored.id)
      if (updated.error) throw new Error(updated.error.message)
      continue
    }
    if (!document.dataUrl.startsWith('data:')) continue
    const blob = dataUrlToBlob(document.dataUrl)
    const fileName = `${safeStorageName(sourceId)}-${safeStorageName(document.name)}`
    const path = typeof stored?.storage_path === 'string'
      ? stored.storage_path
      : `households/${context.householdId}/pets/${context.petId}/documents/${fileName}`
    const uploaded = await context.client.storage.from('pet-documents')
      .upload(path, blob, { contentType: blob.type, upsert: true })
    if (uploaded.error) throw new Error(uploaded.error.message)
    const row = {
      pet_id: context.petId,
      household_id: context.householdId,
      uploaded_by: context.user.id,
      legacy_source_id: sourceId,
      kind: document.kind,
      file_name: document.name,
      mime_type: blob.type,
      byte_size: blob.size,
      storage_path: path,
      health_event_id: parent.type === 'health' ? parent.id : null,
      medication_id: parent.type === 'medication' ? parent.id : null,
      weight_log_id: parent.type === 'weight' ? parent.id : null,
      deleted_at: null,
      deleted_by: null,
    }
    const upserted = await context.client.from('documents')
      .upsert(row, { onConflict: 'pet_id,legacy_source_id' })
    if (upserted.error) throw new Error(upserted.error.message)
  }

  const removed = [...existing.entries()].filter(([sourceId]) => !desiredIds.has(sourceId)).map(([, row]) => row.id)
  if (removed.length) {
    const deleted = await context.client.from('documents')
      .update({ deleted_at: new Date().toISOString(), deleted_by: context.user.id })
      .in('id', removed)
    if (deleted.error) throw new Error(deleted.error.message)
  }
}
