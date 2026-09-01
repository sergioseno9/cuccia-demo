import type { PetData, PetProfile, WeightRecord } from '../types.ts'

export const latestWeight = (weights: WeightRecord[]) => [...weights]
  .sort((first, second) => second.date.localeCompare(first.date))[0]

export const currentWeight = (pet: PetData) => latestWeight(pet.health.weights)?.value

export const withWeightMirror = (pet: PetData, weights: WeightRecord[]): PetData => ({
  ...pet,
  profile: { ...pet.profile, weight: latestWeight(weights)?.value.toString() ?? '' },
  health: { ...pet.health, weights },
})

export const normalizePetWeight = (pet: PetData): PetData => {
  if (pet.health.weights.length) return withWeightMirror(pet, pet.health.weights)
  const value = Number(pet.profile.weight)
  if (!Number.isFinite(value) || value <= 0) return { ...pet, profile: { ...pet.profile, weight: '' } }
  const date = /^\d{4}-\d{2}-\d{2}/.test(pet.profile.createdAt)
    ? pet.profile.createdAt.slice(0, 10)
    : new Date().toISOString().slice(0, 10)
  return withWeightMirror(pet, [{ id: `profile-weight-${pet.id}`, value, date, documents: [] }])
}

export const profileWithWeight = (profile: PetProfile, weights: WeightRecord[]) => ({
  ...profile,
  weight: latestWeight(weights)?.value.toString() ?? '',
})
