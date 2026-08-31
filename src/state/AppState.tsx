import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { trainingPaths } from '../data/paths'
import { levelLabels, trickLevels, tricks } from '../data/tricks'
import { parseBackupJson } from '../lib/backup'
import { createDemoData } from '../lib/demo'
import { createEmptyHealth } from '../lib/migrate'
import { withRequiredModules } from '../lib/profile'
import { StorageQuotaError } from '../lib/storage'
import { localAppDataRepository } from '../repositories/appDataRepository'
import type { AppDataRepository } from '../repositories/appDataRepository'
import { joinAppData, splitAppData } from './appStateModel'
import { resetLocalData } from './resetLocalData'
import type {
  AppData,
  CareEvent,
  CareEventType,
  Caregiver,
  GroomingRecord,
  HealthData,
  MedicationRecord,
  PetData,
  PetProfile,
  PreventionRecord,
  QuizResultRecord,
  TrickStatus,
  VaccinationRecord,
  VetVisitRecord,
  WeightRecord,
} from '../types'

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

interface EventInput {
  happenedAt?: string
  caregiverId?: string
  note?: string
  durationMin?: number
  medicationId?: string
}

type EventChanges = Pick<CareEvent, 'happenedAt' | 'caregiverId' | 'note' | 'durationMin' | 'medicationId'>

interface AppStateValue {
  data: AppData
  activePet: PetData | null
  profile: PetProfile | null
  caregivers: Caregiver[]
  toast: string
  addEvent: (type: CareEventType, input?: EventInput) => void
  addMedication: (record: Omit<MedicationRecord, 'id'>) => void
  addPrevention: (record: Omit<PreventionRecord, 'id'>) => void
  addVaccination: (record: Omit<VaccinationRecord, 'id'>) => void
  addVisit: (record: Omit<VetVisitRecord, 'id'>) => void
  addWeight: (record: Omit<WeightRecord, 'id'>) => void
  addGrooming: (record: Omit<GroomingRecord, 'id'>) => void
  addPet: (profile: PetProfile, health?: HealthData) => void
  completeOnboarding: (profile: PetProfile, health: HealthData, caregivers: Caregiver[]) => void
  deleteEvent: (id: string) => void
  importBackup: (json: string) => void
  replaceData: (data: AppData) => void
  loadDemo: () => void
  removePet: (id: string) => void
  resetAll: () => void
  selectCaregiver: (id: string) => void
  selectPet: (id: string) => void
  updateCaregivers: (caregivers: Caregiver[]) => void
  updateEvent: (id: string, changes: EventChanges) => void
  updateProfile: (profile: PetProfile) => void
  completeTutorial: () => void
  restartTutorial: () => void
  saveQuizResult: (result: QuizResultRecord) => void
  setTrickStatus: (id: string, title: string, status: TrickStatus) => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

const updateSelectedPet = (current: AppData, update: (pet: PetData) => PetData): AppData => ({
  ...current,
  pets: current.pets.map((pet) => pet.id === current.selectedPetId ? update(pet) : pet),
})

export function AppStateProvider({ children, repository = localAppDataRepository }: { children: ReactNode; repository?: AppDataRepository }) {
  const [state, setState] = useState(() => splitAppData(repository.load()))
  const [toast, setToast] = useState('')
  const data = useMemo(() => joinAppData(state), [state])
  const setData = useCallback((update: AppData | ((current: AppData) => AppData)) => {
    setState((current) => {
      const currentData = joinAppData(current)
      const nextData = typeof update === 'function' ? update(currentData) : update
      return splitAppData(nextData)
    })
  }, [])
  const replaceData = useCallback((nextData: AppData) => setData(nextData), [setData])
  const activePet = data.pets.find((pet) => pet.id === data.selectedPetId) ?? data.pets[0] ?? null
  const profile = activePet?.profile ?? null
  const caregivers = data.household.caregivers

  useEffect(() => {
    try {
      repository.save(data)
    } catch (error) {
      setToast(error instanceof StorageQuotaError
        ? 'Spazio quasi esaurito, esporta un backup. L’ultima modifica resta aperta.'
        : 'Salvataggio locale non riuscito. Esporta un backup prima di chiudere.')
    }
  }, [data, repository])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const addEvent = (type: CareEventType, input: EventInput = {}) => {
    setData((current) => {
      if (!current.selectedCaregiverId || !current.selectedPetId) return current
      const event: CareEvent = {
        id: createId(),
        type,
        caregiverId: input.caregiverId ?? current.selectedCaregiverId,
        happenedAt: input.happenedAt ?? new Date().toISOString(),
        ...input,
      }
      return updateSelectedPet(current, (pet) => ({ ...pet, events: [event, ...pet.events] }))
    })
    setToast('Fatto — salvato sul dispositivo')
  }

  const addHealthRecord = <Key extends keyof HealthData>(key: Key, record: HealthData[Key][number]) => {
    setData((current) => updateSelectedPet(current, (pet) => ({
      ...pet,
      health: { ...pet.health, [key]: [record, ...pet.health[key]] },
    })))
  }

  const value = useMemo<AppStateValue>(() => ({
    data,
    activePet,
    profile,
    caregivers,
    toast,
    addEvent,
    addMedication: (record) => addHealthRecord('medications', { ...record, id: createId() }),
    addPrevention: (record) => addHealthRecord('preventions', { ...record, id: createId() }),
    addVaccination: (record) => addHealthRecord('vaccinations', { ...record, id: createId() }),
    addVisit: (record) => addHealthRecord('visits', { ...record, id: createId() }),
    addWeight: (record) => addHealthRecord('weights', { ...record, id: createId() }),
    addGrooming: (record) => addHealthRecord('grooming', { ...record, id: createId() }),
    addPet: (newProfile, health = createEmptyHealth()) => setData((current) => {
      const normalized = {
        ...newProfile,
        trackedModules: withRequiredModules(newProfile.trackedModules, newProfile.conditions, newProfile.species),
      }
      const pet: PetData = { id: normalized.id, profile: normalized, health, events: [], trickProgress: {}, badges: [] }
      return { ...current, pets: [...current.pets, pet], selectedPetId: pet.id }
    }),
    completeOnboarding: (newProfile, health, newCaregivers) => {
      const normalized = {
        ...newProfile,
        trackedModules: withRequiredModules(newProfile.trackedModules, newProfile.conditions, newProfile.species),
      }
      setData({
        schemaVersion: 2,
        household: { caregivers: newCaregivers },
        pets: [{ id: normalized.id, profile: normalized, health, events: [], trickProgress: {}, badges: [] }],
        selectedPetId: normalized.id,
        selectedCaregiverId: newCaregivers[0]?.id ?? '',
        tutorialDone: false,
      })
    },
    deleteEvent: (id) => {
      setData((current) => updateSelectedPet(current, (pet) => ({
        ...pet,
        events: pet.events.map((event) => event.id === id ? {
          ...event,
          deletedBy: current.selectedCaregiverId,
          deletedAt: new Date().toISOString(),
        } : event),
      })))
      setToast('Evento eliminato dal Diario')
    },
    importBackup: (json) => {
      const restored = parseBackupJson(json)
      setData(restored)
      setToast('Backup importato — dati ripristinati')
    },
    replaceData,
    loadDemo: () => setData(createDemoData()),
    removePet: (id) => setData((current) => {
      const pets = current.pets.filter((pet) => pet.id !== id)
      return { ...current, pets, selectedPetId: pets[0]?.id ?? '' }
    }),
    resetAll: () => {
      const reset = resetLocalData(repository)
      setData(reset.data)
      if (!reset.storageCleared) setToast('Non sono riuscito a pulire tutto il browser. Riprova tra poco.')
    },
    selectCaregiver: (id) => setData((current) => ({ ...current, selectedCaregiverId: id })),
    selectPet: (id) => setData((current) => ({ ...current, selectedPetId: id })),
    updateCaregivers: (nextCaregivers) => setData((current) => ({
      ...current,
      household: { caregivers: nextCaregivers },
      selectedCaregiverId: nextCaregivers.some((item) => item.id === current.selectedCaregiverId)
        ? current.selectedCaregiverId
        : nextCaregivers[0]?.id ?? '',
    })),
    updateEvent: (id, changes) => {
      setData((current) => updateSelectedPet(current, (pet) => ({
        ...pet,
        events: pet.events.map((event) => event.id === id ? {
          ...event,
          ...changes,
          editedBy: current.selectedCaregiverId,
          editedAt: new Date().toISOString(),
        } : event),
      })))
      setToast('Modifiche salvate')
    },
    updateProfile: (nextProfile) => setData((current) => updateSelectedPet(current, (pet) => ({
      ...pet,
      profile: {
        ...nextProfile,
        trackedModules: withRequiredModules(nextProfile.trackedModules, nextProfile.conditions, nextProfile.species),
      },
    }))),
    completeTutorial: () => setData((current) => ({ ...current, tutorialDone: true })),
    restartTutorial: () => setData((current) => ({ ...current, tutorialDone: false })),
    saveQuizResult: (result) => {
      setData((current) => updateSelectedPet(current, (pet) => ({ ...pet, quizResult: result })))
      setToast(`Risultato salvato per ${profile?.name ?? 'il pet'}`)
    },
    setTrickStatus: (id, title, status) => setData((current) => updateSelectedPet(current, (pet) => {
      const learnedAt = status === 'imparato'
        ? pet.trickProgress[id]?.learnedAt ?? new Date().toISOString()
        : undefined
      const progress = { ...pet.trickProgress, [id]: { status, ...(learnedAt ? { learnedAt } : {}) } }
      const earned = (badgeId: string) => pet.badges.some((badge) => badge.id === badgeId)
      const badges = [
        ...(status === 'imparato' && !earned(`trick-${id}`)
          ? [{ id: `trick-${id}`, title, unlockedAt: learnedAt ?? new Date().toISOString() }]
          : []),
        ...trickLevels.flatMap((level) => {
          const badgeId = `level-${level}`
          const complete = tricks.filter((trick) => trick.level === level)
            .every((trick) => progress[trick.id]?.status === 'imparato')
          return complete && !earned(badgeId)
            ? [{ id: badgeId, title: `Livello ${levelLabels[level]} completato`, unlockedAt: new Date().toISOString() }]
            : []
        }),
        ...trainingPaths.flatMap((path) => {
          const badgeId = `path-${path.id}`
          const complete = path.trickIds.every((trickId) => progress[trickId]?.status === 'imparato')
          return complete && !earned(badgeId)
            ? [{ id: badgeId, title: `Percorso ${path.title}`, unlockedAt: new Date().toISOString() }]
            : []
        }),
      ]
      return { ...pet, trickProgress: progress, badges: [...pet.badges, ...badges] }
    })),
  }), [activePet, caregivers, data, profile, replaceData, toast])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export const useAppState = () => {
  const context = useContext(AppStateContext)
  if (!context) throw new Error('useAppState deve essere usato dentro AppStateProvider')
  return context
}
