import type {
  AppData,
  CareEvent,
  CareEventType,
  Caregiver,
  GroomingRecord,
  HealthData,
  MedicationRecord,
  PetData,
  PetDocument,
  PetProfile,
  PreventionRecord,
  QuizResultRecord,
  TrickStatus,
  VaccinationRecord,
  VetVisitRecord,
  WeightRecord,
} from '../types'

export interface EventInput {
  happenedAt?: string
  caregiverId?: string
  note?: string
  durationMin?: number
  medicationId?: string
}

type EventChanges = Pick<CareEvent, 'happenedAt' | 'caregiverId' | 'note' | 'durationMin' | 'medicationId'>

export interface AppStateValue {
  data: AppData
  activePet: PetData | null
  profile: PetProfile | null
  caregivers: Caregiver[]
  toast: string
  addEvent: (type: CareEventType, input?: EventInput) => void
  addMedication: (record: Omit<MedicationRecord, 'id'>) => void
  updateMedication: (record: MedicationRecord) => void
  deleteMedication: (id: string) => void
  addPrevention: (record: Omit<PreventionRecord, 'id'>) => void
  updatePrevention: (record: PreventionRecord) => void
  deletePrevention: (id: string) => void
  addVaccination: (record: Omit<VaccinationRecord, 'id'>) => void
  updateVaccination: (record: VaccinationRecord) => void
  deleteVaccination: (id: string) => void
  addVisit: (record: Omit<VetVisitRecord, 'id'>) => void
  updateVisit: (record: VetVisitRecord) => void
  deleteVisit: (id: string) => void
  addWeight: (record: Omit<WeightRecord, 'id'>) => void
  updateWeight: (record: WeightRecord) => void
  deleteWeight: (id: string) => void
  addGrooming: (record: Omit<GroomingRecord, 'id'>) => void
  updateGrooming: (record: GroomingRecord) => void
  deleteGrooming: (id: string) => void
  addDocument: (document: PetDocument) => void
  updateDocument: (document: PetDocument) => void
  deleteDocument: (id: string) => void
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
