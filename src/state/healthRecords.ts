import type { HealthData, HealthRecordKey, PetData, PetProfile, WeightRecord } from '../types'

export const latestWeight = (weights: WeightRecord[]) => [...weights]
  .sort((first, second) => second.date.localeCompare(first.date))[0]

export const currentWeight = (pet: PetData) => latestWeight(pet.health.weights)?.value

const withWeightMirror = (pet: PetData, weights: WeightRecord[]): PetData => ({
  ...pet,
  profile: { ...pet.profile, weight: latestWeight(weights)?.value.toString() ?? '' },
  health: { ...pet.health, weights },
})

export const upsertHealthRecord = <Key extends HealthRecordKey>(
  pet: PetData,
  key: Key,
  record: HealthData[Key][number],
): PetData => {
  const records = pet.health[key]
  const nextRecords = records.some((item) => item.id === record.id)
    ? records.map((item) => item.id === record.id ? record : item)
    : [record, ...records]
  if (key === 'weights') return withWeightMirror(pet, nextRecords as WeightRecord[])
  return { ...pet, health: { ...pet.health, [key]: nextRecords } }
}

export const removeHealthRecord = <Key extends HealthRecordKey>(
  pet: PetData,
  key: Key,
  id: string,
): PetData => {
  const records = pet.health[key].filter((record) => record.id !== id)
  if (key === 'weights') return withWeightMirror(pet, records as WeightRecord[])
  return { ...pet, health: { ...pet.health, [key]: records } }
}

export const updateProfileAndTodayWeight = (
  pet: PetData,
  profile: PetProfile,
  today: string,
  createId: () => string,
): { pet: PetData; weight?: WeightRecord } => {
  const value = Number(profile.weight)
  const previousValue = currentWeight(pet)
  if (!profile.weight || !Number.isFinite(value) || value <= 0 || value === previousValue) {
    return { pet: { ...pet, profile: { ...profile, weight: previousValue?.toString() ?? '' } } }
  }
  const existing = pet.health.weights.find((record) => record.date === today)
  const weight: WeightRecord = existing
    ? { ...existing, value }
    : { id: createId(), value, date: today, documents: [] }
  return { pet: upsertHealthRecord({ ...pet, profile }, 'weights', weight), weight }
}
