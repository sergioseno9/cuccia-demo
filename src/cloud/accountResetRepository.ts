import { getSupabaseClient } from '../lib/supabase'

export interface CloudResetResult {
  householdsDeleted: number
  petsDeleted: number
  storageObjectsDeleted: number
}

const numberValue = (value: unknown) => typeof value === 'number' ? value : 0

export const resetCloudAccountData = async (): Promise<CloudResetResult> => {
  const client = getSupabaseClient()
  const assets = await client.rpc('my_cloud_reset_storage_paths')
  if (assets.error) throw new Error(assets.error.message)
  const storagePaths = Array.isArray(assets.data)
    ? assets.data.filter((path): path is string => typeof path === 'string' && path.length > 0)
    : []
  if (storagePaths.length > 0) {
    const storage = await client.storage.from('pet-documents').remove(storagePaths)
    if (storage.error) throw new Error(storage.error.message)
  }

  const response = await client.rpc('reset_my_cloud_data')
  if (response.error) throw new Error(response.error.message)
  const value = response.data && typeof response.data === 'object'
    ? response.data as Record<string, unknown>
    : {}
  return {
    householdsDeleted: numberValue(value.householdsDeleted),
    petsDeleted: numberValue(value.petsDeleted),
    storageObjectsDeleted: storagePaths.length,
  }
}
