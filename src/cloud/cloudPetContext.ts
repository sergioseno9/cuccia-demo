import type { SupabaseClient, User } from '@supabase/supabase-js'
import { loadActiveScope } from '../entry/entryCache.ts'
import { getSupabaseClient } from '../lib/supabase.ts'

export interface CloudMutationOptions {
  client?: SupabaseClient
  user?: User
}

export interface CloudPetContext {
  client: SupabaseClient
  user: User
  petId: string
  householdId: string
}

const asRows = (value: unknown) => Array.isArray(value)
  ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
  : []

export const resolveCloudPet = async (
  sourcePetId: string,
  options: CloudMutationOptions = {},
): Promise<CloudPetContext | null> => {
  const client = options.client ?? getSupabaseClient()
  const userResponse = options.user
    ? { data: { user: options.user }, error: null }
    : await client.auth.getUser()
  if (userResponse.error) throw new Error(userResponse.error.message)
  const user = userResponse.data.user
  if (!user) return null
  if (!options.user && loadActiveScope() !== `account:${user.id}`) return null

  const response = await client.from('pets')
    .select('id,household_id,legacy_source_id')
    .is('deleted_at', null)
  if (response.error) throw new Error(response.error.message)
  const pet = asRows(response.data).find((row) => row.id === sourcePetId || row.legacy_source_id === sourcePetId)
  if (typeof pet?.id !== 'string' || typeof pet.household_id !== 'string') {
    throw new Error('La scheda cloud del pet non è disponibile.')
  }
  return { client, user, petId: pet.id, householdId: pet.household_id }
}
