import type { PetDocument, PetProfile } from '../types.ts'
import { dataUrlToBlob, safeStorageName } from './dataUrl.ts'
import { syncCloudDocuments } from './cloudDocumentMutations.ts'
import { resolveCloudPet } from './cloudPetContext.ts'
import type { CloudMutationOptions } from './cloudPetContext.ts'

const documentMetadata = ({ id, name, kind, addedAt }: PetDocument) => ({ id, name, kind, addedAt })

export const saveCloudProfile = async (
  petSourceId: string,
  profile: PetProfile,
  options: CloudMutationOptions = {},
) => {
  const context = await resolveCloudPet(petSourceId, options)
  if (!context) return false
  let photoPath: string | undefined
  if (profile.photo.startsWith('data:')) {
    const blob = dataUrlToBlob(profile.photo)
    photoPath = `households/${context.householdId}/pets/${context.petId}/profile/${safeStorageName(profile.id)}.jpg`
    const upload = await context.client.storage.from('pet-documents')
      .upload(photoPath, blob, { contentType: blob.type, upsert: true })
    if (upload.error) throw new Error(upload.error.message)
  }
  const profileData = {
    ...profile,
    photo: '',
    documents: profile.documents.map(documentMetadata),
  }
  const updated = await context.client.from('pets').update({
    name: profile.name,
    life_phase: profile.lifePhase,
    birth_date: profile.birthDate || null,
    sex: profile.sex,
    breed: profile.breed,
    size: profile.size,
    tracked_modules: profile.trackedModules,
    conditions: profile.conditions,
    feeding: profile.feeding,
    profile_data: profileData,
    ...(photoPath ? { photo_path: photoPath } : {}),
  }).eq('id', context.petId)
  if (updated.error) throw new Error(updated.error.message)
  await syncCloudDocuments(context, { type: 'pet' }, 'pet', profile.documents)
  return true
}
