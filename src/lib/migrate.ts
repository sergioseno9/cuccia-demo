import { conditionIds, lifePhaseIds, modulePresets, trackedModuleIds, withRequiredModules } from './profile.ts'
import {
  isRecord,
  migrateBadges,
  migrateCaregivers,
  migrateDocuments,
  migrateEvents,
  migrateHealth,
  migrateQuizResult,
  migrateTrickProgress,
  optionalNumber,
  text,
} from './migrateRecords.ts'
import type {
  AppData,
  GroomingRecord,
  HealthData,
  LifePhase,
  PetCondition,
  PetData,
  PetProfile,
  PetSpecies,
  TrackedModule,
} from '../types'

export const createEmptyHealth = (): HealthData => ({
  vaccinations: [], preventions: [], medications: [], visits: [], weights: [], grooming: [],
})

export const createEmptyAppData = (): AppData => ({
  schemaVersion: 2,
  household: { caregivers: [] },
  pets: [],
  selectedPetId: '',
  selectedCaregiverId: '',
  tutorialDone: false,
})

const migrateProfile = (value: unknown, fallbackSpecies: PetSpecies, fallbackId: string): PetProfile | null => {
  if (!isRecord(value)) return null
  const species: PetSpecies = value.species === 'gatto' ? 'gatto' : fallbackSpecies
  const lifePhase: LifePhase = lifePhaseIds.includes(value.lifePhase as LifePhase)
    ? value.lifePhase as LifePhase
    : 'adulto'
  const conditions = Array.isArray(value.conditions)
    ? value.conditions.filter((item): item is PetCondition => conditionIds.includes(item as PetCondition))
    : []
  const availableModules = trackedModuleIds(species)
  const rawModules = Array.isArray(value.trackedModules) ? value.trackedModules : []
  const savedModules = rawModules.length
    ? rawModules.filter((item): item is TrackedModule => availableModules.includes(item as TrackedModule) || item === 'needs')
    : modulePresets(species, lifePhase)
  const outingIntervalHours = optionalNumber(value.outingIntervalHours) ?? optionalNumber(value.needsIntervalHours)
  const feeding = isRecord(value.feeding) ? value.feeding : {}
  const indoorOutdoor = value.indoorOutdoor === 'outdoor' || value.indoorOutdoor === 'both'
    ? value.indoorOutdoor
    : 'indoor'

  return {
    id: text(value.id) || fallbackId,
    createdAt: text(value.createdAt) || new Date().toISOString(),
    species,
    lifePhase,
    trackedModules: withRequiredModules(savedModules, conditions, species),
    conditions,
    conditionNotes: text(value.conditionNotes) || (typeof value.conditions === 'string' ? value.conditions : ''),
    medicalNotes: text(value.medicalNotes),
    ...(outingIntervalHours && outingIntervalHours > 0 ? { outingIntervalHours } : {}),
    ...(species === 'gatto' ? { indoorOutdoor } : {}),
    name: text(value.name),
    photo: text(value.photo),
    birthDate: text(value.birthDate),
    sex: value.sex === 'male' || value.sex === 'female' ? value.sex : 'unknown',
    breed: text(value.breed),
    size: value.size === 'small' || value.size === 'large' ? value.size : 'medium',
    weight: text(value.weight),
    microchip: text(value.microchip),
    vetName: text(value.vetName),
    vetPhone: text(value.vetPhone),
    emergencyContact: text(value.emergencyContact),
    groomerName: text(value.groomerName),
    groomerPhone: text(value.groomerPhone),
    feeding: {
      food: text(feeding.food), portion: text(feeding.portion),
      schedule: text(feeding.schedule), notes: text(feeding.notes),
    },
    allergies: text(value.allergies),
    notes: text(value.notes),
    annualCheckDate: text(value.annualCheckDate),
    insuranceRenewalDate: text(value.insuranceRenewalDate),
    microchipRenewalDate: text(value.microchipRenewalDate),
    documents: migrateDocuments(value.documents),
  }
}

const migratePet = (value: unknown, index: number): PetData | null => {
  if (!isRecord(value)) return null
  const petId = text(value.id) || (isRecord(value.profile) ? text(value.profile.id) : '') || `pet-${index + 1}`
  const fallbackSpecies: PetSpecies = value.species === 'gatto' ? 'gatto' : 'cane'
  const profile = migrateProfile(value.profile ?? value, fallbackSpecies, petId)
  if (!profile) return null
  const quizResult = migrateQuizResult(value.quizResult)
  return {
    id: petId,
    profile: { ...profile, id: petId },
    events: migrateEvents(value.events),
    health: migrateHealth(value.health),
    trickProgress: migrateTrickProgress(value.trickProgress),
    badges: migrateBadges(value.badges),
    ...(quizResult ? { quizResult } : {}),
  }
}

const addLegacyGrooming = (pet: PetData): PetData => {
  if (pet.health.grooming.length) return pet
  const grooming = pet.events
    .filter((event) => event.type === 'grooming' && !event.deletedAt)
    .map((event): GroomingRecord => ({
      id: `migrated-${event.id}`,
      title: event.note || 'Toelettatura / bagno',
      lastDate: event.happenedAt.slice(0, 10),
      intervalWeeks: 0,
      notes: 'Importato dal Diario precedente.',
      documents: [],
    }))
  return { ...pet, health: { ...pet.health, grooming } }
}

export const migrateAppData = (value: unknown): AppData => {
  const source = isRecord(value) ? value : {}
  if (Array.isArray(source.pets)) {
    const pets = source.pets
      .map((pet, index) => migratePet(pet, index))
      .filter((pet): pet is PetData => pet !== null)
      .map(addLegacyGrooming)
    const household = isRecord(source.household) ? source.household : {}
    const caregivers = migrateCaregivers(household.caregivers)
    const selectedPet = text(source.selectedPetId)
    const selectedCaregiver = text(source.selectedCaregiverId)
    return {
      schemaVersion: 2,
      household: { caregivers },
      pets,
      selectedPetId: pets.some((pet) => pet.id === selectedPet) ? selectedPet : pets[0]?.id ?? '',
      selectedCaregiverId: caregivers.some((item) => item.id === selectedCaregiver)
        ? selectedCaregiver
        : caregivers[0]?.id ?? '',
      tutorialDone: typeof source.tutorialDone === 'boolean' ? source.tutorialDone : false,
    }
  }

  const legacyProfile = migrateProfile(source.profile, 'cane', 'legacy-pet-1')
  if (!legacyProfile) return createEmptyAppData()
  const rawProfile = isRecord(source.profile) ? source.profile : {}
  const caregivers = migrateCaregivers(rawProfile.caregivers)
  const selectedCaregiver = text(source.selectedCaregiverId)
  const quizResult = migrateQuizResult(source.quizResult)
  const pet = addLegacyGrooming({
    id: legacyProfile.id,
    profile: legacyProfile,
    events: migrateEvents(source.events),
    health: migrateHealth(source.health),
    trickProgress: migrateTrickProgress(source.trickProgress),
    badges: migrateBadges(source.badges),
    ...(quizResult ? { quizResult } : {}),
  })
  return {
    schemaVersion: 2,
    household: { caregivers },
    pets: [pet],
    selectedPetId: pet.id,
    selectedCaregiverId: caregivers.some((item) => item.id === selectedCaregiver)
      ? selectedCaregiver
      : caregivers[0]?.id ?? '',
    tutorialDone: typeof source.tutorialDone === 'boolean' ? source.tutorialDone : false,
  }
}
