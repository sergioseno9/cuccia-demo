import type { DogCondition, LifePhase, TrackedModule } from '../types'

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
}

export const conditionLabels: Record<DogCondition, string> = {
  problemi_urinari: 'Problemi urinari',
  terapia_in_corso: 'Terapia in corso',
  mobilita_ridotta: 'Mobilità ridotta',
  peso_controllato: 'Peso controllato',
  potty_training: 'Sta imparando a fare i bisogni fuori',
}

export const modulePresets: Record<LifePhase, TrackedModule[]> = {
  cucciolo: ['outings', 'water', 'grooming'],
  adulto: ['outings', 'water', 'grooming'],
  senior: ['outings', 'water', 'weight', 'medications', 'grooming'],
}

export const conditionModules: Record<DogCondition, TrackedModule[]> = {
  problemi_urinari: ['needs'],
  terapia_in_corso: ['medications'],
  mobilita_ridotta: ['outings'],
  peso_controllato: ['weight'],
  potty_training: ['needs'],
}

export const trackedModuleIds: TrackedModule[] = ['outings', 'water', 'weight', 'medications', 'grooming']
export const conditionIds = Object.keys(conditionLabels) as DogCondition[]
export const lifePhaseIds = Object.keys(lifePhaseLabels) as LifePhase[]

export const suggestLifePhase = (birthDate: string): LifePhase => {
  if (!birthDate) return 'adulto'
  const birth = new Date(`${birthDate}T12:00:00`)
  const ageYears = (Date.now() - birth.getTime()) / 31_557_600_000
  if (ageYears < 1) return 'cucciolo'
  if (ageYears >= 8) return 'senior'
  return 'adulto'
}

export const requiredModules = (conditions: DogCondition[]) =>
  conditions.flatMap((condition) => conditionModules[condition])

export const withRequiredModules = (
  modules: TrackedModule[],
  conditions: DogCondition[],
) => [...new Set([...modules, ...requiredModules(conditions)])]

export const phaseTone: Record<LifePhase, string> = {
  cucciolo: 'Guide e routine vicine, senza trasformarle in obblighi.',
  adulto: 'Scadenze e informazioni importanti, sempre a portata di mano.',
  senior: 'Terapie, visite e peso a colpo d’occhio.',
}
