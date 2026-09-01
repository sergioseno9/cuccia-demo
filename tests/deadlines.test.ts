import assert from 'node:assert/strict'
import test from 'node:test'
import { buildDeadlines, nextMedicationDose } from '../src/lib/deadlines.ts'
import { createEmptyHealth } from '../src/lib/migrate.ts'
import { createEmptyProfile } from '../src/lib/profile.ts'
import type { MedicationRecord, PetData } from '../src/types.ts'

const medication = (overrides: Partial<MedicationRecord> = {}): MedicationRecord => ({
  id: 'medication-1',
  name: 'Terapia manuale',
  dose: 'Dose confermata',
  times: ['08:00', '20:00'],
  startDate: '2026-09-01',
  endDate: '',
  active: true,
  documents: [],
  ...overrides,
})

test('gli orari farmaco non validi non causano una scadenza', () => {
  assert.equal(nextMedicationDose(medication({ times: ['mattina', '25:90'] }), new Date('2026-09-01T07:00:00')), null)
  assert.equal(nextMedicationDose(medication({ times: [] }), new Date('2026-09-01T07:00:00')), null)
})

test('la prossima dose rispetta inizio e fine terapia', () => {
  const future = nextMedicationDose(
    medication({ startDate: '2026-09-03', endDate: '2026-09-05' }),
    new Date('2026-09-01T21:00:00'),
  )
  assert.ok(future)
  const futureDate = new Date(future)
  assert.equal(futureDate.getFullYear(), 2026)
  assert.equal(futureDate.getMonth(), 8)
  assert.equal(futureDate.getDate(), 3)
  assert.equal(futureDate.getHours(), 8)

  assert.equal(nextMedicationDose(
    medication({ endDate: '2026-09-01', times: ['08:00'] }),
    new Date('2026-09-01T21:00:00'),
  ), null)
})

test('buildDeadlines ignora una terapia senza orari confermati', () => {
  const profile = createEmptyProfile('cane', 'pet-1')
  const pet: PetData = {
    id: profile.id,
    profile,
    health: { ...createEmptyHealth(), medications: [medication({ times: ['orario libero'] })] },
    events: [],
    trickProgress: {},
    badges: [],
  }
  assert.equal(buildDeadlines(pet).some((deadline) => deadline.source === 'medication'), false)
})
