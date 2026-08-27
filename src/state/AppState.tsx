import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  AppData,
  CareEvent,
  CareEventType,
  DogProfile,
  HealthData,
  MedicationRecord,
  PreventionRecord,
  VaccinationRecord,
  VetVisitRecord,
  WeightRecord,
} from '../types'
import { createDemoData } from '../lib/demo'
import { migrateAppData } from '../lib/migrate'
import { withRequiredModules } from '../lib/profile'

const STORAGE_KEY = 'cuccia:complete-dog-care:v1'

const emptyHealth: HealthData = {
  vaccinations: [],
  preventions: [],
  medications: [],
  visits: [],
  weights: [],
}

const emptyData: AppData = {
  profile: null,
  selectedCaregiverId: '',
  events: [],
  health: emptyHealth,
}

const loadData = (): AppData => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return emptyData
  try {
    return migrateAppData(JSON.parse(saved) as unknown)
  } catch {
    return emptyData
  }
}

const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

interface EventInput {
  happenedAt?: string
  caregiverId?: string
  note?: string
  durationMin?: number
  medicationId?: string
}

type EventChanges = Pick<CareEvent, 'happenedAt' | 'caregiverId' | 'note' | 'durationMin'>

interface AppStateValue {
  data: AppData
  toast: string
  addEvent: (type: CareEventType, input?: EventInput) => void
  addMedication: (record: Omit<MedicationRecord, 'id'>) => void
  addPrevention: (record: Omit<PreventionRecord, 'id'>) => void
  addVaccination: (record: Omit<VaccinationRecord, 'id'>) => void
  addVisit: (record: Omit<VetVisitRecord, 'id'>) => void
  addWeight: (record: Omit<WeightRecord, 'id'>) => void
  completeOnboarding: (profile: DogProfile, health: HealthData) => void
  deleteEvent: (id: string) => void
  loadDemo: () => void
  resetAll: () => void
  selectCaregiver: (id: string) => void
  updateEvent: (id: string, changes: EventChanges) => void
  updateProfile: (profile: DogProfile) => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData)
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const addEvent = (type: CareEventType, input: EventInput = {}) => {
    if (!data.selectedCaregiverId) return
    const event: CareEvent = {
      id: createId(),
      type,
      caregiverId: input.caregiverId ?? data.selectedCaregiverId,
      happenedAt: input.happenedAt ?? new Date().toISOString(),
      ...input,
    }
    setData((current) => ({ ...current, events: [event, ...current.events] }))
    setToast('Fatto — tutti in casa lo vedono ora')
  }

  const addHealthRecord = <Key extends keyof HealthData>(key: Key, record: HealthData[Key][number]) => {
    setData((current) => ({
      ...current,
      health: { ...current.health, [key]: [record, ...current.health[key]] },
    }))
  }

  const value = useMemo<AppStateValue>(() => ({
    data,
    toast,
    addEvent,
    addMedication: (record) => addHealthRecord('medications', { ...record, id: createId() }),
    addPrevention: (record) => addHealthRecord('preventions', { ...record, id: createId() }),
    addVaccination: (record) => addHealthRecord('vaccinations', { ...record, id: createId() }),
    addVisit: (record) => addHealthRecord('visits', { ...record, id: createId() }),
    addWeight: (record) => addHealthRecord('weights', { ...record, id: createId() }),
    completeOnboarding: (profile, health) => setData({
      profile: { ...profile, trackedModules: withRequiredModules(profile.trackedModules.filter((module) => module !== 'needs'), profile.conditions) },
      health,
      events: [],
      selectedCaregiverId: profile.caregivers[0]?.id ?? '',
    }),
    deleteEvent: (id) => {
      setData((current) => ({
        ...current,
        events: current.events.map((event) => event.id === id ? {
          ...event,
          deletedBy: current.selectedCaregiverId,
          deletedAt: new Date().toISOString(),
        } : event),
      }))
      setToast('Evento eliminato dal diario')
    },
    loadDemo: () => setData(createDemoData()),
    resetAll: () => {
      localStorage.removeItem(STORAGE_KEY)
      Object.keys(localStorage)
        .filter((key) => key.startsWith('cuccia:guide-checklist:'))
        .forEach((key) => localStorage.removeItem(key))
      setData(emptyData)
    },
    selectCaregiver: (id) => setData((current) => ({ ...current, selectedCaregiverId: id })),
    updateEvent: (id, changes) => {
      setData((current) => ({
        ...current,
        events: current.events.map((event) => event.id === id ? {
          ...event,
          ...changes,
          editedBy: current.selectedCaregiverId,
          editedAt: new Date().toISOString(),
        } : event),
      }))
      setToast('Modifiche salvate — la famiglia vede l’orario corretto')
    },
    updateProfile: (profile) => setData((current) => ({
      ...current,
      profile: { ...profile, trackedModules: withRequiredModules(profile.trackedModules.filter((module) => module !== 'needs'), profile.conditions) },
    })),
  }), [data, toast])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export const useAppState = () => {
  const context = useContext(AppStateContext)
  if (!context) throw new Error('useAppState must be used inside AppStateProvider')
  return context
}
