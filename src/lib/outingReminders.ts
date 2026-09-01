import type { CareEvent, OutingSchedule, PetProfile } from '../types'

const MINUTE = 60_000
const REMINDER_WINDOW_MINUTES = 30
const WALK_PROXIMITY_MINUTES = 60

const scheduledDate = (time: string, now: Date) => {
  const [hours, minutes] = time.split(':').map(Number)
  const result = new Date(now)
  result.setHours(hours, minutes, 0, 0)
  return result
}

const hasNearbyWalk = (events: CareEvent[], scheduleAt: Date) => events.some((event) => (
  !event.deletedAt
  && event.type === 'walk'
  && Math.abs(new Date(event.happenedAt).getTime() - scheduleAt.getTime()) <= WALK_PROXIMITY_MINUTES * MINUTE
))

export interface TodayOutingSchedule {
  schedule: OutingSchedule
  completed: boolean
  isNext: boolean
  isPast: boolean
}

export const buildTodayOutingSchedules = (
  profile: PetProfile,
  events: CareEvent[],
  now = new Date(),
): TodayOutingSchedule[] => {
  if (profile.species !== 'cane') return []
  const schedules = profile.outingSchedules
    .map((schedule) => ({ schedule, at: scheduledDate(schedule.time, now) }))
    .sort((first, second) => first.at.getTime() - second.at.getTime())
  const nextId = schedules.find(({ at }) => at.getTime() >= now.getTime() && !hasNearbyWalk(events, at))?.schedule.id
  return schedules.map(({ schedule, at }) => ({
    schedule,
    completed: hasNearbyWalk(events, at),
    isNext: schedule.id === nextId,
    isPast: at.getTime() < now.getTime(),
  }))
}

export const findInAppOutingReminder = (
  profile: PetProfile,
  events: CareEvent[],
  now = new Date(),
): OutingSchedule | null => {
  if (profile.species !== 'cane') return null
  return profile.outingSchedules
    .filter((schedule) => schedule.reminderEnabled)
    .map((schedule) => ({ schedule, at: scheduledDate(schedule.time, now) }))
    .filter(({ at }) => {
      const minutesAfter = (now.getTime() - at.getTime()) / MINUTE
      return minutesAfter >= 0 && minutesAfter <= REMINDER_WINDOW_MINUTES
    })
    .sort((first, second) => Math.abs(now.getTime() - first.at.getTime()) - Math.abs(now.getTime() - second.at.getTime()))
    .find(({ at }) => !hasNearbyWalk(events, at))?.schedule ?? null
}

export const outingReminderKey = (petId: string, schedule: OutingSchedule, now = new Date()) => {
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
  return `${petId}:${date}:${schedule.id}`
}
