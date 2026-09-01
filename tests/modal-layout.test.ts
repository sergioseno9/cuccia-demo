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
