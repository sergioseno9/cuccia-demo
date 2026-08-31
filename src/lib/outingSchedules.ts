import type { OutingSchedule } from '../types'

const sorted = (schedules: OutingSchedule[]) => [...schedules]
  .sort((first, second) => first.time.localeCompare(second.time))

export const addOutingSchedule = (
  schedules: OutingSchedule[],
  schedule: OutingSchedule,
) => schedules.some((item) => item.time === schedule.time)
  ? sorted(schedules)
  : sorted([...schedules, schedule])

export const toggleOutingSchedule = (schedules: OutingSchedule[], id: string) => sorted(
  schedules.map((schedule) => schedule.id === id
    ? { ...schedule, reminderEnabled: !schedule.reminderEnabled }
    : schedule),
)

export const removeOutingSchedule = (schedules: OutingSchedule[], id: string) => sorted(
  schedules.filter((schedule) => schedule.id !== id),
)
