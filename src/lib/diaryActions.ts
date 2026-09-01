import type { CareEventType, PetProfile } from '../types'

export const hasNeedsCondition = (profile: PetProfile) =>
  profile.conditions.includes('problemi_urinari') || profile.conditions.includes('potty_training')

export const buildDiaryActions = (profile: PetProfile, hasActiveMedication: boolean): CareEventType[] => [
  ...(profile.species === 'cane' ? ['walk' as const] : []),
  'meal',
  'note',
  ...(hasActiveMedication ? ['medication' as const] : []),
  ...(hasNeedsCondition(profile) ? ['pee' as const, 'poop' as const] : []),
  ...(profile.species === 'gatto' ? ['litterbox' as const] : []),
]
