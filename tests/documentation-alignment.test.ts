import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const agents = readFileSync(new URL('../AGENTS.md', import.meta.url), 'utf8')
const brief = readFileSync(new URL('../docs/PROJECT_BRIEF.md', import.meta.url), 'utf8')
const audit = readFileSync(new URL('../docs/AUDIT.md', import.meta.url), 'utf8')
const currentDocs = [agents, brief, audit].join('\n')

test('i documenti non reintroducono feature o vincoli rimossi', () => {
  for (const obsolete of [
    'Fase 0 — prototipo web locale',
    'Consiglio del momento',
    'Clicker e fischietto',
    '/scopri/traucco',
    'outingIntervalHours',
    'Assenti: account reali',
  ]) assert.equal(currentDocs.includes(obsolete), false, `Riferimento obsoleto: ${obsolete}`)
})

test('i documenti descrivono architettura e feature correnti', () => {
  assert.match(agents, /Supabase Fase 1/)
  assert.match(agents, /Quiz, Guide, Giochi & trucchi/)
  assert.match(agents, /trackedModules[\s\S]*non ha più UI e non pilota/)
  assert.match(brief, /cinque[\s\S]*Home, Uscite, Diario, Cura, Scopri/)
  assert.match(audit, /\/scopri\/trucco\/:id/)
  assert.match(currentDocs, /orari uscite/)
  assert.match(currentDocs, /Modifica pet/)
  assert.match(currentDocs, /aggiunta, modifica ed eliminazione/)
  assert.match(currentDocs, /Pet Card ridisegnata/)
})
