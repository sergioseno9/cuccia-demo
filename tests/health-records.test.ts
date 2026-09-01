import assert from 'node:assert/strict'
import test from 'node:test'
import { createDemoData } from '../src/lib/demo.ts'
import { removeHealthRecord, updateProfileAndTodayWeight, upsertHealthRecord } from '../src/state/healthRecords.ts'

test('update e delete conservano le altre voci salute', () => {
  const pet = createDemoData().pets[0]
  const vaccination = pet.health.vaccinations[0]
  const updated = upsertHealthRecord(pet, 'vaccinations', { ...vaccination, notes: 'Controllata' })
  assert.equal(updated.health.vaccinations[0].notes, 'Controllata')
  assert.equal(updated.health.preventions.length, pet.health.preventions.length)

  const removed = removeHealthRecord(updated, 'vaccinations', vaccination.id)
  assert.equal(removed.health.vaccinations.some((record) => record.id === vaccination.id), false)
  assert.equal(removed.health.preventions.length, pet.health.preventions.length)
})

test('un nuovo record viene aggiunto una sola volta e poi aggiornato', () => {
  const pet = createDemoData().pets[0]
  const visit = { id: 'visit-test', title: 'Controllo', date: '2026-09-10', notes: '', documents: [] }
  const added = upsertHealthRecord(pet, 'visits', visit)
  const updated = upsertHealthRecord(added, 'visits', { ...visit, notes: 'Tutto bene' })
  assert.equal(updated.health.visits.filter((record) => record.id === visit.id).length, 1)
  assert.equal(updated.health.visits.find((record) => record.id === visit.id)?.notes, 'Tutto bene')
})

test('eliminare il peso attuale aggiorna il mirror compatibile del profilo', () => {
  const pet = createDemoData().pets[0]
  const sorted = [...pet.health.weights].sort((first, second) => second.date.localeCompare(first.date))
  const removed = removeHealthRecord(pet, 'weights', sorted[0].id)
  assert.equal(removed.profile.weight, sorted[1].value.toString())
})

test('il peso modificato dal Profilo crea o aggiorna una sola voce odierna', () => {
  const pet = createDemoData().pets[0]
  const today = '2030-09-01'
  const created = updateProfileAndTodayWeight(pet, { ...pet.profile, weight: '14.2' }, today, () => 'today-weight')
  assert.equal(created.weight?.id, 'today-weight')
  assert.equal(created.pet.profile.weight, '14.2')
  assert.equal(created.pet.health.weights.filter((record) => record.date === today).length, 1)

  const updated = updateProfileAndTodayWeight(created.pet, { ...created.pet.profile, weight: '14.5' }, today, () => 'unused')
  assert.equal(updated.weight?.id, 'today-weight')
  assert.equal(updated.pet.health.weights.filter((record) => record.date === today).length, 1)
  assert.equal(updated.pet.health.weights.find((record) => record.date === today)?.value, 14.5)
})
