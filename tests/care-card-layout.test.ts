import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const dialog = readFileSync(new URL('../src/components/CareDetailDialog.tsx', import.meta.url), 'utf8')
const documents = readFileSync(new URL('../src/components/DocumentManager.tsx', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/styles/care-record-actions.css', import.meta.url), 'utf8')

test('tutte le sezioni Cura usano etichetta compatta e card condivise', () => {
  for (const label of ['Storico e richiami', 'Pulci e zecche', 'Sverminazione', 'Farmaci e terapie', 'Appuntamenti e storico', 'Peso', 'Igiene e abitudini']) {
    assert.ok(dialog.includes(label))
  }
  assert.ok((dialog.match(/<CareRecordCard/g) ?? []).length >= 6)
  assert.match(documents, /care-record-card document-record-card/)
})

test('azioni e controlli Cura restano leggibili e toccabili', () => {
  assert.match(styles, /\.care-add-button\s*\{[^}]*min-height:\s*44px[^}]*font-size:\s*16px/s)
  assert.match(styles, /\.care-record-details p\s*\{[^}]*font-size:\s*16px/s)
  assert.match(styles, /\.care-record-actions button\s*\{[^}]*min-height:\s*44px[^}]*font-size:\s*16px/s)
  assert.match(styles, /\.care-detail-modal \.modal-heading h2\s*\{[^}]*font-family:\s*'Fraunces'/s)
})
