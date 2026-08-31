import assert from 'node:assert/strict'
import test from 'node:test'
import { buildMigrationPlan, migrationIdempotencyKeys } from '../src/cloud/migrationPlan.ts'
import { createVerifiedBackupJson } from '../src/cloud/verifiedBackup.ts'
import { createDemoData } from '../src/lib/demo.ts'
import { parseBackupJson } from '../src/lib/backup.ts'

test('il dry-run conta tutte le righe senza scrivere dati', async () => {
  const plan = await buildMigrationPlan(createDemoData())
  assert.deepEqual(plan.counts, {
    pets: 1,
    activities: 6,
    healthEvents: 6,
    medications: 1,
    medicationLogs: 0,
    weightLogs: 3,
    documents: 0,
    contentProgress: 0,
  })
  assert.match(plan.fingerprint, /^[a-f0-9]{64}$/)
})

test('lo stesso snapshot produce fingerprint e chiavi idempotenti identiche', async () => {
  const data = createDemoData()
  const first = await buildMigrationPlan(data)
  const second = await buildMigrationPlan(data)
  assert.equal(first.fingerprint, second.fingerprint)
  const keys = migrationIdempotencyKeys(first)
  assert.equal(new Set(keys).size, keys.length)
  assert.equal(new Set([...keys, ...migrationIdempotencyKeys(second)]).size, keys.length)
})

test('il backup richiesto prima del cloud è v2 e torna identico', () => {
  const data = createDemoData()
  const json = createVerifiedBackupJson(data)
  assert.deepEqual(parseBackupJson(json), data)
})
