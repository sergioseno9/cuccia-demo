import assert from 'node:assert/strict'
import test from 'node:test'
import { buildTutorialSteps } from '../src/lib/tutorialSteps.ts'

test('il tutorial del cane include Uscite e resta entro cinque passaggi', () => {
  const steps = buildTutorialSteps('Milo', 'cane')
  assert.equal(steps.length, 5)
  assert.equal(steps[1].target, 'tutorial-outings')
  assert.match(steps[1].body, /Milo/)
  assert.match(steps[1].body, /mentre Cuccia è aperta/)
  assert.equal(steps.at(-1)?.eyebrow, '5 di 5 · Scopri')
})

test('il tutorial del gatto non cerca il blocco Uscite', () => {
  const steps = buildTutorialSteps('Luna', 'gatto')
  assert.equal(steps.length, 4)
  assert.equal(steps.some((step) => step.target === 'tutorial-outings'), false)
})
