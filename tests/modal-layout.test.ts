import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const modal = readFileSync(new URL('../src/components/Modal.tsx', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf8')

test('il modale base separa intestazione, corpo scrollabile e footer fisso', () => {
  assert.match(modal, /className="modal-body"/)
  assert.match(modal, /className="modal-footer"/)
  assert.match(styles, /\.modal-sheet[^}]*display:\s*flex[^}]*flex-direction:\s*column/s)
  assert.match(styles, /\.modal-body[^}]*flex:\s*1 1 auto[^}]*min-height:\s*0[^}]*overflow-y:\s*auto/s)
  assert.match(styles, /\.modal-footer[^}]*flex:\s*0 0 auto/s)
})

test('il modale blocca lo sfondo e lascia scorrere solo il corpo', () => {
  assert.match(modal, /body\.style\.overflow\s*=\s*'hidden'/)
  assert.match(modal, /body\.style\.position\s*=\s*'fixed'/)
  assert.match(modal, /addEventListener\('touchmove',[\s\S]*passive:\s*false/)
  assert.match(modal, /removeEventListener\('touchmove'/)
  assert.match(styles, /\.modal-backdrop[^}]*touch-action:\s*none/s)
  assert.match(styles, /\.modal-body[^}]*overflow-y:\s*auto/s)
})
