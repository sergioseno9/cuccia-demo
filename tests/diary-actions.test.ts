import assert from 'node:assert/strict'
import test from 'node:test'
import { buildDiaryActions } from '../src/lib/diaryActions.ts'
import { createEmptyProfile } from '../src/lib/profile.ts'

test('il cane mostra le uscite anche senza il vecchio modulo tracciato', () => {
  const profile = { ...createEmptyProfile('cane', 'milo'), trackedModules: [] }
  assert.deepEqual(buildDiaryActions(profile, false), ['walk', 'meal', 'note'])
})

test('il gatto mostra la lettiera e non le uscite', () => {
  const profile = { ...createEmptyProfile('gatto', 'luna'), trackedModules: ['outings'] as const }
  assert.deepEqual(buildDiaryActions(profile, false), ['meal', 'note', 'litterbox'])
})

test('pipì e cacca dipendono solo dalle condizioni utili', () => {
  const base = createEmptyProfile('cane', 'milo')
  const withCondition = { ...base, trackedModules: [], conditions: ['potty_training'] as const }
  assert.deepEqual(buildDiaryActions(withCondition, true), ['walk', 'meal', 'note', 'medication', 'pee', 'poop'])
  assert.equal(buildDiaryActions({ ...base, trackedModules: ['needs'] }, false).includes('pee'), false)
})
