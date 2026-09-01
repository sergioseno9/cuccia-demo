import assert from 'node:assert/strict'
import test from 'node:test'
import { createDemoData } from '../src/lib/demo.ts'
import { migrateAppData } from '../src/lib/migrate.ts'
import { buildTodayOutingSchedules, findInAppOutingReminder } from '../src/lib/outingReminders.ts'
import { addOutingSchedule, removeOutingSchedule, toggleOutingSchedule } from '../src/lib/outingSchedules.ts'
import { createEmptyProfile } from '../src/lib/profile.ts'
import type { CareEvent } from '../src/types.ts'

const now = new Date('2026-09-01T08:55:00+02:00')

test('mostra solo un orario con Avvisami attivo per il cane', () => {
  const profile = {
    ...createEmptyProfile('cane', 'milo'),
    name: 'Milo',
    outingSchedules: [
      { id: 'early', time: '08:45', reminderEnabled: true },
      { id: 'later', time: '12:00', reminderEnabled: false },
    ],
  }
  assert.equal(findInAppOutingReminder(profile, [], now)?.id, 'early')
  assert.equal(findInAppOutingReminder({ ...profile, species: 'gatto' }, [], now), null)
})

test('un’uscita registrata vicino all’orario sopprime il promemoria', () => {
  const profile = {
    ...createEmptyProfile('cane', 'milo'),
    outingSchedules: [{ id: 'early', time: '08:45', reminderEnabled: true }],
  }
  const events: CareEvent[] = [{
    id: 'walk-1',
    type: 'walk',
    caregiverId: 'giulia',
    happenedAt: '2026-09-01T08:50:00+02:00',
  }]
  assert.equal(findInAppOutingReminder(profile, events, now), null)
  assert.deepEqual(buildTodayOutingSchedules(profile, events, now).map((item) => ({
    id: item.schedule.id,
    completed: item.completed,
    isNext: item.isNext,
  })), [{ id: 'early', completed: true, isNext: false }])
})

test('il riepilogo Home evidenzia il prossimo orario e resta nascosto per il gatto', () => {
  const profile = {
    ...createEmptyProfile('cane', 'milo'),
    outingSchedules: [
      { id: 'early', time: '08:45', reminderEnabled: true },
      { id: 'lunch', time: '12:00', reminderEnabled: false },
      { id: 'evening', time: '17:00', reminderEnabled: true },
    ],
  }
  const summary = buildTodayOutingSchedules(profile, [], now)
  assert.deepEqual(summary.map((item) => [item.schedule.id, item.isNext, item.isPast]), [
    ['early', false, true], ['lunch', true, false], ['evening', false, false],
  ])
  assert.deepEqual(buildTodayOutingSchedules({ ...profile, species: 'gatto' }, [], now), [])
})

test('migrazione conserva orari validi per pet e rimuove duplicati o valori errati', () => {
  const data = createDemoData()
  const input = {
    ...data,
    pets: [{
      ...data.pets[0],
      profile: {
        ...data.pets[0].profile,
        outingSchedules: [
          { id: 'evening', time: '21:00', reminderEnabled: false },
          { id: 'morning', time: '08:45', reminderEnabled: true },
          { id: 'duplicate', time: '08:45', reminderEnabled: false },
          { id: 'invalid', time: '28:00', reminderEnabled: true },
        ],
      },
    }],
  }
  const schedules = migrateAppData(input).pets[0].profile.outingSchedules
  assert.deepEqual(schedules, [
    { id: 'morning', time: '08:45', reminderEnabled: true },
    { id: 'evening', time: '21:00', reminderEnabled: false },
  ])
})

test('aggiunta, rimozione e Avvisami modificano solo la lista del pet', () => {
  const initial = [{ id: 'morning', time: '08:45', reminderEnabled: false }]
  const added = addOutingSchedule(initial, { id: 'evening', time: '21:00', reminderEnabled: false })
  assert.equal(added.length, 2)
  assert.equal(initial.length, 1)
  assert.equal(toggleOutingSchedule(added, 'evening')[1].reminderEnabled, true)
  assert.deepEqual(removeOutingSchedule(added, 'morning'), [
    { id: 'evening', time: '21:00', reminderEnabled: false },
  ])
})
