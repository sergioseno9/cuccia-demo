export type PetSpecies = 'cane' | 'gatto'
export type LifePhase = 'cucciolo' | 'adulto' | 'senior'

export type CareEventType =
  | 'meal'
  | 'water'
  | 'pee'
  | 'poop'
  | 'walk'
  | 'sleep'
  | 'grooming'
  | 'litterbox'
  | 'medication'
  | 'note'

export type TrackedModule =
  | 'outings'
  | 'needs'
  | 'water'
  | 'weight'
  | 'medications'
  | 'grooming'
  | 'litterbox'

export type PetCondition =
  | 'problemi_urinari'
  | 'terapia_in_corso'
  | 'mobilita_ridotta'
  | 'peso_controllato'
  | 'potty_training'

export interface FeedingInfo {
  food: string
  portion: string
  schedule: string
  notes: string
}

export type PetDocumentKind = 'libretto' | 'pedigree' | 'esame' | 'ricevuta' | 'altro'

export interface PetDocument {
  id: string
  name: string
  kind: PetDocumentKind
  dataUrl: string
  addedAt: string
}

export interface Caregiver {
  id: string
  name: string
  role: string
  color: string
}

export interface CareEvent {
  id: string
  type: CareEventType
  caregiverId: string
  happenedAt: string
  note?: string
  durationMin?: number
  medicationId?: string
  editedBy?: string
  editedAt?: string
  deletedBy?: string
  deletedAt?: string
}

export interface PetProfile {
  id: string
  createdAt: string
  species: PetSpecies
  lifePhase: LifePhase
  trackedModules: TrackedModule[]
  conditions: PetCondition[]
  conditionNotes: string
  medicalNotes: string
  outingIntervalHours?: number
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both'
  name: string
  photo: string
  birthDate: string
  sex: 'male' | 'female' | 'unknown'
  breed: string
  size: 'small' | 'medium' | 'large'
  weight: string
  microchip: string
  vetName: string
  vetPhone: string
  emergencyContact: string
  groomerName: string
  groomerPhone: string
  feeding: FeedingInfo
  allergies: string
  notes: string
  annualCheckDate: string
  insuranceRenewalDate: string
  microchipRenewalDate: string
  documents: PetDocument[]
}

interface DocumentedRecord {
  documents: PetDocument[]
}

export interface VaccinationRecord extends DocumentedRecord {
  id: string
  name: string
  administeredDate: string
  nextDate: string
  lotNumber: string
  expiryDate: string
  notes: string
}

export interface PreventionRecord extends DocumentedRecord {
  id: string
  kind: string
  product: string
  lastDate: string
  intervalDays: number
  seasonalPause: boolean
  pauseStartMonth?: number
  pauseEndMonth?: number
}

export interface MedicationRecord extends DocumentedRecord {
  id: string
  name: string
  dose: string
  times: string[]
  startDate: string
  endDate: string
  active: boolean
}

export interface VetVisitRecord extends DocumentedRecord {
  id: string
  title: string
  date: string
  notes: string
}

export interface WeightRecord extends DocumentedRecord {
  id: string
  value: number
  date: string
}

export interface GroomingRecord extends DocumentedRecord {
  id: string
  title: string
  lastDate: string
  intervalWeeks: number
  notes: string
}

export interface HealthData {
  vaccinations: VaccinationRecord[]
  preventions: PreventionRecord[]
  medications: MedicationRecord[]
  visits: VetVisitRecord[]
  weights: WeightRecord[]
  grooming: GroomingRecord[]
}

export type TrickStatus = 'da_imparare' | 'in_corso' | 'imparato'

export interface TrickProgressRecord {
  status: TrickStatus
  learnedAt?: string
}

export interface AchievementBadge {
  id: string
  title: string
  unlockedAt: string
}

export interface QuizAxisVector {
  E: number
  C: number
  S: number
  F: number
}

export interface QuizResultRecord {
  archetypeId: string
  vector: QuizAxisVector
  answers: Record<string, string>
  completedAt: string
}

export interface PetData {
  id: string
  profile: PetProfile
  events: CareEvent[]
  health: HealthData
  trickProgress: Record<string, TrickProgressRecord>
  badges: AchievementBadge[]
  quizResult?: QuizResultRecord
}

export interface Household {
  caregivers: Caregiver[]
}

export interface AppData {
  schemaVersion: 2
  household: Household
  pets: PetData[]
  selectedPetId: string
  selectedCaregiverId: string
  tutorialDone: boolean
}

export type DeadlineStatus = 'overdue' | 'upcoming' | 'ok'

export interface Deadline {
  id: string
  title: string
  detail: string
  dueDate: string
  status: DeadlineStatus
  source: 'vaccination' | 'prevention' | 'deworming' | 'medication' | 'visit' | 'profile'
}
