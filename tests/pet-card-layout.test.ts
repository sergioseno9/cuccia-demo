import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const styles = readFileSync(new URL('../src/styles/pet-card.css', import.meta.url), 'utf8')

test('i contatti Pet Card sono impilati e i numeri restano su una riga', () => {
  assert.match(styles, /\.pet-card-contact-grid\s*{[^}]*grid-template-columns:\s*1fr/s)
  assert.match(styles, /\.pet-card-contact-grid p\s*{[^}]*white-space:\s*nowrap/s)
})
