import type { User } from '@supabase/supabase-js'
import { getSupabaseClient } from '../lib/supabase'
import type { AppData } from '../types'
import { mapCloudSnapshot } from './cloudSnapshot'
import type { CloudSnapshotRows } from './cloudSnapshot'

const assertNoError = (error: { message: string } | null) => {
  if (error) throw new Error(error.message)
}

const dataRows = (value: unknown) => Array.isArray(value) ? value : []

export const hasCloudPets = async () => {
  const response = await getSupabaseClient().from('pets')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)
  assertNoError(response.error)
  return (response.count ?? 0) > 0
}

const assetUrls = async (paths: string[]) => {
  const client = getSupabaseClient()
  const urls = new Map<string, string>()
  await Promise.all([...new Set(paths.filter(Boolean))].map(async (path) => {
    const response = await client.storage.from('pet-documents').createSignedUrl(path, 60 * 60)
    if (!response.error && response.data?.signedUrl) urls.set(path, response.data.signedUrl)
  }))
  return urls
}

export const loadCloudAppData = async (user: User): Promise<AppData> => {
  const client = getSupabaseClient()
  const [pets, activities, healthEvents, medications, weightLogs, documents, contentProgress] = await Promise.all([
    client.from('pets').select('*').is('deleted_at', null).order('created_at'),
    client.from('activities').select('*').order('happened_at', { ascending: false }),
    client.from('health_events').select('*').order('created_at'),
    client.from('medications').select('*').order('created_at'),
    client.from('weight_logs').select('*').order('weighed_on', { ascending: false }),
    client.from('documents').select('*').is('deleted_at', null).order('created_at'),
    client.from('pet_content_progress').select('*').order('created_at'),
  ])
  ;[pets, activities, healthEvents, medications, weightLogs, documents, contentProgress]
    .forEach((response) => assertNoError(response.error))

  const petRows = dataRows(pets.data)
  const documentRows = dataRows(documents.data)
  const paths = [
    ...petRows.map((value) => {
      const row = value && typeof value === 'object' ? value as Record<string, unknown> : {}
      return typeof row.photo_path === 'string' ? row.photo_path : ''
    }),
    ...documentRows.map((value) => {
      const row = value && typeof value === 'object' ? value as Record<string, unknown> : {}
      return typeof row.storage_path === 'string' ? row.storage_path : ''
    }),
  ]
  const rows: CloudSnapshotRows = {
    pets: petRows,
    activities: dataRows(activities.data),
    healthEvents: dataRows(healthEvents.data),
    medications: dataRows(medications.data),
    weightLogs: dataRows(weightLogs.data),
    documents: documentRows,
    contentProgress: dataRows(contentProgress.data),
    assetUrls: await assetUrls(paths),
  }
  const displayName = typeof user.user_metadata.display_name === 'string'
    ? user.user_metadata.display_name
    : user.email?.split('@')[0] ?? 'Famiglia'
  return mapCloudSnapshot(rows, displayName)
}
