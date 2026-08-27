export type CareEventType =
  | 'meal'
  | 'water'
  | 'pee'
  | 'poop'
  | 'walk'
  | 'sleep'
  | 'grooming'
  | 'medication'
  | 'note'

export type LifePhase = 'cucciolo' | 'adulto' | 'senior'

export type TrackedModule =
  | 'outings'
  | 'needs'
  | 'water'
  | 'weight'
  | 'medications'
  | 'grooming'

export type DogCondition =
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

export type DogDocumentKind = 'libretto' | 'pedigree' | 'ricevuta' | 'altro'

export interface DogDocument {
  id: string
  name: string
  kind: DogDocumentKind
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

export interface DogProfile {
  createdAt: string
  lifePhase: LifePhase
  trackedModules: TrackedModule[]
  conditions: DogCondition[]
  conditionNotes: string
  outingIntervalHours?: number
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
  documents: DogDocument[]
  caregivers: Caregiver[]
}

export interface VaccinationRecord {
  id: string
  name: string
  administeredDate: string
  nextDate: string
  notes: string
}

export interface PreventionRecord {
  id: string
  kind: string
  product: string
  lastDate: string
  intervalDays: number
}

export interface MedicationRecord {
  id: string
  name: string
  dose: string
  times: string[]
  startDate: string
  endDate: string
  active: boolean
}

export interface VetVisitRecord {
  id: string
  title: string
  date: string
  notes: string
}

export interface WeightRecord {
  id: string
  value: number
  date: string
}

export interface GroomingRecord {
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

export interface AppData {
  profile: DogProfile | null
  selectedCaregiverId: string
  events: CareEvent[]
  health: HealthData
  tutorialDone: boolean
  trickProgress: Record<string, TrickProgressRecord>
  badges: AchievementBadge[]
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
