import { getGuide } from '../data/guides'
import { dayKey, todayKey } from './date'
import type { PetData } from '../types'

export const selectMomentGuide = (pet: PetData) => {
  const profile = pet.profile
  if (profile.species !== 'cane' || profile.lifePhase !== 'cucciolo') return null

  if (new Date().getHours() >= 20) {
    return getGuide('notti-tranquille')!
  }

  const todayEvents = pet.events.filter((event) => !event.deletedAt && dayKey(event.happenedAt) === todayKey())
  if (profile.trackedModules.includes('needs') && todayEvents.filter((event) => event.type === 'pee').length >= 3) {
    return getGuide('stop-pipi')!
  }

  const biteNotes = todayEvents.filter((event) =>
    event.type === 'note' && /\bmors(?:o|i|etto|etti)\b/i.test(event.note ?? ''),
  )
  if (biteNotes.length >= 3) return getGuide('morsi')!

  return getGuide('puppy-blues')!
}
