import assert from 'node:assert/strict'
import test from 'node:test'
import { resetLocalData } from '../src/state/resetLocalData.ts'
import type { AppDataRepository } from '../src/repositories/appDataRepository.ts'

test('il reset svuota solo repository e dati browser, restituendo uno stato senza pet', () => {
  let repositoryClears = 0
  const repository: AppDataRepository = {
    load: () => { throw new Error('non usato') },
    save: () => { throw new Error('non usato') },
    clear: () => { repositoryClears += 1 },
  }
  const values = new Map([
    ['cuccia:guide-checklist:notti', 'true'],
    ['cuccia:entry:import-handled:user', 'true'],
  ])
  const storage = {
    get length() { return values.size },
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => { values.delete(key) },
  }

  const reset = resetLocalData(repository, storage)

  assert.equal(repositoryClears, 1)
  assert.equal(reset.storageCleared, true)
  assert.equal(reset.data.pets.length, 0)
  assert.equal(reset.data.selectedPetId, '')
  assert.equal(values.has('cuccia:guide-checklist:notti'), false)
  assert.equal(values.has('cuccia:entry:import-handled:user'), true)
})
