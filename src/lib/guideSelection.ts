import { getGuide } from '../data/guides'
import { dayKey, todayKey } from './date'
import type { AppData } from '../types'

export const selectMomentGuide = (data: AppData) => {
  const profile = data.profile
  if (!profile || profile.lifePhase !== 'cucciolo') return null

  if (new Date().getHours() >= 20) {
    return getGuide('notti-tranquille')!
  }

  const todayEvents = data.events.filter((event) => !event.deletedAt && dayKey(event.happenedAt) === todayKey())
  if (profile.trackedModules.includes('needs') && todayEvents.filter((event) => event.type === 'pee').length >= 3) {
    return getGuide('stop-pipi')!
  }

  const biteNotes = todayEvents.filter((event) =>
    event.type === 'note' && /\bmors(?:o|i|etto|etti)\b/i.test(event.note ?? ''),
  )
  if (biteNotes.length >= 3) return getGuide('morsi')!

  return getGuide('puppy-blues')!
}
