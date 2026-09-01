import assert from 'node:assert/strict'
import test from 'node:test'
import { microchipStorageCopy } from '../src/onboarding/copy.ts'

test('il microchip descrive correttamente salvataggio cloud e locale', () => {
  assert.equal(
    microchipStorageCopy(true),
    'Viene salvato nel tuo account e compare nella Pet Card.',
  )
  assert.equal(
    microchipStorageCopy(false),
    'Viene salvato solo su questo dispositivo e compare nella Pet Card.',
  )
})
