import assert from 'node:assert/strict'
import test from 'node:test'
import { createBackupJson, parseBackupJson } from '../src/lib/backup.ts'
import { createDemoData } from '../src/lib/demo.ts'
import { getQuizQuestions, quizArchetypes } from '../src/data/quiz.ts'
import { createEmptyAppData, createEmptyHealth, migrateAppData } from '../src/lib/migrate.ts'
import { createEmptyProfile } from '../src/lib/profile.ts'
import { calculateQuizResult, resolveQuizArchetype } from '../src/lib/quiz.ts'
import { buildReminderCandidates } from '../src/lib/reminders.ts'
import {
  BACKUP_STORAGE_KEY,
  PREVIOUS_STORAGE_KEY,
  STORAGE_KEY,
  loadAppData,
  persistAppData,
} from '../src/lib/storage.ts'
import type { StorageLike } from '../src/lib/storage.ts'

class MemoryStorage implements StorageLike {
  private values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
}

const legacyState = {
  profile: {
    createdAt: '2025-01-02T10:00:00.000Z',
    lifePhase: 'senior',
    trackedModules: ['outings', 'weight', 'medications', 'grooming'],
    conditions: ['terapia_in_corso', 'peso_controllato'],
    conditionNotes: 'Controlli concordati.',
    outingIntervalHours: 4,
    name: 'Milo',
    photo: 'data:image/png;base64,abc',
    birthDate: '2015-04-12',
    sex: 'male',
    breed: 'Meticcio',
    size: 'medium',
    weight: '16.2',
    microchip: '123456789012345',
    vetName: 'Dott.ssa Rossi',
    vetPhone: '+39000000000',
    emergencyContact: 'Clinica 24 ore',
    groomerName: 'Anna',
    groomerPhone: '+39111111111',
    feeding: { food: 'Secco', portion: '200 g', schedule: 'Due volte', notes: 'Con calma' },
    allergies: 'Polline',
    notes: 'Ama la coperta blu.',
    annualCheckDate: '2026-11-01',
    insuranceRenewalDate: '2026-12-10',
    microchipRenewalDate: '2027-01-15',
    documents: [{ id: 'doc-1', name: 'libretto.jpg', kind: 'libretto', dataUrl: 'data:image/jpeg;base64,xyz', addedAt: '2025-02-03T10:00:00.000Z' }],
    caregivers: [
      { id: 'sergio', name: 'Sergio', role: 'Famiglia', color: '#D9694A' },
      { id: 'mamma', name: 'Mamma', role: 'Famiglia', color: '#8FA083' },
    ],
  },
  selectedCaregiverId: 'mamma',
  tutorialDone: true,
  events: [
    { id: 'event-1', type: 'walk', caregiverId: 'mamma', happenedAt: '2026-08-20T09:15:00.000Z', durationMin: 35, note: 'Parco' },
    { id: 'event-2', type: 'grooming', caregiverId: 'sergio', happenedAt: '2026-08-18T10:00:00.000Z', note: 'Spazzolatura' },
  ],
  health: {
    vaccinations: [{ id: 'vax-1', name: 'Polivalente', administeredDate: '2026-01-10', nextDate: '2027-01-10', notes: 'Richiamo annuale' }],
    preventions: [{ id: 'prev-1', kind: 'Pulci e zecche', product: 'Prodotto A', lastDate: '2026-08-01', intervalDays: 30 }],
    medications: [{ id: 'med-1', name: 'Terapia A', dose: '1 unità', times: ['08:00'], startDate: '2026-08-01', endDate: '2026-09-01', active: true }],
    visits: [{ id: 'visit-1', title: 'Controllo', date: '2026-09-05', notes: 'Portare esami' }],
    weights: [{ id: 'weight-1', value: 16.2, date: '2026-08-01' }],
    grooming: [],
  },
  trickProgress: { richiamo: { status: 'imparato', learnedAt: '2026-05-01T10:00:00.000Z' } },
  badges: [{ id: 'trick-richiamo', title: 'Richiamo', unlockedAt: '2026-05-01T10:00:00.000Z' }],
}

test('migra uno stato precedente popolato senza perdere dati', () => {
  const migrated = migrateAppData(legacyState)
  assert.equal(migrated.schemaVersion, 2)
  assert.equal(migrated.pets.length, 1)
  assert.equal(migrated.selectedCaregiverId, 'mamma')
  assert.deepEqual(migrated.household.caregivers.map(({ id, name }) => ({ id, name })), [
    { id: 'sergio', name: 'Sergio' }, { id: 'mamma', name: 'Mamma' },
  ])
  const pet = migrated.pets[0]
  assert.equal(pet.profile.name, legacyState.profile.name)
  assert.equal(pet.profile.microchip, legacyState.profile.microchip)
  assert.equal(pet.profile.documents[0].dataUrl, legacyState.profile.documents[0].dataUrl)
  assert.equal(pet.events.length, legacyState.events.length)
  assert.equal(pet.events[0].durationMin, 35)
  assert.equal(pet.health.vaccinations[0].nextDate, '2027-01-10')
  assert.equal(pet.health.preventions[0].product, 'Prodotto A')
  assert.equal(pet.health.medications[0].dose, '1 unità')
  assert.equal(pet.health.visits[0].notes, 'Portare esami')
  assert.equal(pet.health.weights[0].value, 16.2)
  assert.equal(pet.health.grooming[0].title, 'Spazzolatura')
  assert.equal(pet.trickProgress.richiamo.status, 'imparato')
  assert.equal(pet.badges[0].id, 'trick-richiamo')
})

test('export, azzeramento e re-import restituiscono dati identici', () => {
  const data = createDemoData()
  const catProfile = {
    ...createEmptyProfile('gatto', 'luna'),
    createdAt: '2026-08-01T10:00:00.000Z',
    name: 'Luna',
    lifePhase: 'senior' as const,
    medicalNotes: 'Controllo renale annotato dalla famiglia.',
    documents: [{ id: 'cat-doc', name: 'esame.pdf', kind: 'esame' as const, dataUrl: 'data:application/pdf;base64,abc', addedAt: '2026-08-20T10:00:00.000Z' }],
  }
  data.pets.push({
    id: 'luna', profile: catProfile, health: createEmptyHealth(), events: [],
    trickProgress: {}, badges: [],
    quizResult: {
      archetypeId: 'signore-distinto',
      vector: { E: -1, C: 0.5, S: -1, F: 1 },
      answers: { q1: 'a', q2: 'd', q3: 'b', q4: 'c', q5: 'c', q6: 'f' },
      completedAt: '2026-08-27T18:00:00.000Z',
    },
  })
  data.selectedPetId = 'luna'
  const exported = createBackupJson(data, '2026-08-27T12:00:00.000Z')
  const afterReset = createEmptyAppData()
  assert.equal(afterReset.pets.length, 0)
  const restored = parseBackupJson(exported)
  assert.deepEqual(restored, data)
})

test('ogni scrittura conserva un backup locale recuperabile', () => {
  const storage = new MemoryStorage()
  const data = createDemoData()
  persistAppData(data, storage)
  assert.ok(storage.getItem(STORAGE_KEY))
  assert.ok(storage.getItem(BACKUP_STORAGE_KEY))
  storage.setItem(STORAGE_KEY, '{non valido')
  assert.deepEqual(loadAppData(storage), data)
  storage.removeItem(STORAGE_KEY)
  assert.deepEqual(loadAppData(storage), data)
})

test('recupera la versione precedente se corrente e backup sono corrotti', () => {
  const storage = new MemoryStorage()
  const first = createDemoData()
  const second = {
    ...first,
    pets: first.pets.map((pet, index) => index === 0
      ? { ...pet, profile: { ...pet.profile, name: 'Nome aggiornato' } }
      : pet),
  }
  persistAppData(first, storage)
  persistAppData(second, storage)
  assert.ok(storage.getItem(PREVIOUS_STORAGE_KEY))
  storage.setItem(STORAGE_KEY, '{corrente non valida')
  storage.setItem(BACKUP_STORAGE_KEY, '{backup non valido')
  assert.deepEqual(loadAppData(storage), first)
})

test('i promemoria hanno identità stabile e specie del pet', () => {
  const pet = createDemoData().pets[0]
  const candidates = buildReminderCandidates(pet)
  assert.ok(candidates.length > 0)
  assert.ok(candidates.every((candidate) => candidate.id.startsWith(`${pet.id}:`)))
  assert.ok(candidates.every((candidate) => candidate.species === 'cane'))
})

test('il quiz usa le due domande specifiche per il gatto', () => {
  const dogQuestions = getQuizQuestions('cane')
  const catQuestions = getQuizQuestions('gatto')
  assert.equal(dogQuestions.length, 6)
  assert.equal(catQuestions.length, 6)
  assert.match(dogQuestions[1].prompt, /citofono/)
  assert.match(catQuestions[1].prompt, /gatto sconosciuto/)
  assert.match(dogQuestions[3].prompt, /parco/)
  assert.match(catQuestions[3].prompt, /ospiti/)
})

test('il calcolo del quiz somma i pesi senza casualità', () => {
  const answers = { q1: 'b', q2: 'b', q3: 'b', q4: 'b', q5: 'b', q6: 'b' }
  const first = calculateQuizResult('cane', answers, '2026-08-28T10:00:00.000Z')
  const second = calculateQuizResult('cane', answers, '2026-08-28T10:00:00.000Z')
  assert.deepEqual(first, second)
  assert.deepEqual(first.vector, { E: 2, C: -1.5, S: -1.5, F: 2 })
  assert.ok(quizArchetypes.some((archetype) => archetype.id === first.archetypeId))
})

test('a pari distanza il tie-break sceglie il Piccolo Criminale', () => {
  const midpoint = { E: 0.5, C: 1.25, S: -0.25, F: 1 }
  assert.equal(resolveQuizArchetype(midpoint).id, 'criminale')
})
