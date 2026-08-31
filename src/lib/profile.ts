import type { LifePhase, PetCondition, PetProfile, PetSpecies, TrackedModule } from '../types'

export const lifePhaseIds: LifePhase[] = ['cucciolo', 'adulto', 'senior']

export const lifePhaseLabel = (phase: LifePhase, species: PetSpecies) => {
  if (phase === 'cucciolo') return species === 'gatto' ? 'Gattino' : 'Cucciolo'
  return phase === 'adulto' ? 'Adulto' : 'Senior'
}

export const lifePhaseLabels: Record<LifePhase, string> = {
  cucciolo: 'Cucciolo',
  adulto: 'Adulto',
  senior: 'Senior',
}

export const moduleLabels: Record<TrackedModule, string> = {
  outings: 'Uscite',
  needs: 'Pipì e cacca',
  water: 'Acqua',
  weight: 'Peso',
  medications: 'Farmaci',
  grooming: 'Toelettatura/bagno',
  litterbox: 'Lettiera',
}

export const conditionLabels: Record<PetCondition, string> = {
  problemi_urinari: 'Problemi urinari',
  terapia_in_corso: 'Terapia in corso',
  mobilita_ridotta: 'Mobilità ridotta',
  peso_controllato: 'Peso controllato',
  potty_training: 'Sta imparando dove fare i bisogni',
}

export const conditionIds = Object.keys(conditionLabels) as PetCondition[]

export const modulePresets = (species: PetSpecies, phase: LifePhase): TrackedModule[] => {
  if (species === 'gatto') {
    return phase === 'senior' ? ['weight', 'medications', 'grooming'] : ['weight', 'grooming']
  }
  if (phase === 'senior') return ['outings', 'weight', 'medications', 'grooming']
  return ['outings', 'grooming']
}

export const trackedModuleIds = (species: PetSpecies): TrackedModule[] => species === 'gatto'
  ? ['weight', 'medications', 'grooming', 'litterbox']
  : ['outings', 'weight', 'medications', 'grooming']

const conditionModules = (condition: PetCondition, species: PetSpecies): TrackedModule[] => {
  if (condition === 'problemi_urinari' || condition === 'potty_training') {
    return [species === 'gatto' ? 'litterbox' : 'needs']
  }
  if (condition === 'terapia_in_corso') return ['medications']
  if (condition === 'mobilita_ridotta') return species === 'cane' ? ['outings'] : []
  if (condition === 'peso_controllato') return ['weight']
  return []
}

export const requiredModules = (conditions: PetCondition[], species: PetSpecies) =>
  [...new Set(conditions.flatMap((condition) => conditionModules(condition, species)))]

export const withRequiredModules = (
  modules: TrackedModule[],
  conditions: PetCondition[],
  species: PetSpecies,
) => [...new Set([...modules, ...requiredModules(conditions, species)])]

export const suggestLifePhase = (birthDate: string): LifePhase => {
  if (!birthDate) return 'adulto'
  const birth = new Date(`${birthDate}T12:00:00`)
  const ageYears = (Date.now() - birth.getTime()) / 31_557_600_000
  if (ageYears < 1) return 'cucciolo'
  if (ageYears >= 8) return 'senior'
  return 'adulto'
}

export const createEmptyProfile = (species: PetSpecies, id: string): PetProfile => ({
  id,
  createdAt: new Date().toISOString(),
  species,
  lifePhase: 'adulto',
  trackedModules: modulePresets(species, 'adulto'),
  conditions: [],
  conditionNotes: '',
  medicalNotes: '',
  outingSchedules: [],
  ...(species === 'gatto' ? { indoorOutdoor: 'indoor' as const } : {}),
  name: '',
  photo: '',
  birthDate: '',
  sex: 'unknown',
  breed: '',
  size: 'medium',
  weight: '',
  microchip: '',
  vetName: '',
  vetPhone: '',
  emergencyContact: '',
  groomerName: '',
  groomerPhone: '',
  feeding: { food: '', portion: '', schedule: '', notes: '' },
  allergies: '',
  notes: '',
  annualCheckDate: '',
  insuranceRenewalDate: '',
  microchipRenewalDate: '',
  documents: [],
})
