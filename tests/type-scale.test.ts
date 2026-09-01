import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const main = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/styles/type-scale.css', import.meta.url), 'utf8')

test('il guardrail tipografico viene caricato dopo gli stili delle feature', () => {
  assert.ok(main.indexOf("./styles/type-scale.css") > main.indexOf("./styles/auth.css"))
})

test('corpo, controlli ed empty state rispettano le soglie mobile', () => {
  assert.match(styles, /p:not\(\.eyebrow\), li, button, a, input, select, textarea, label\)[^{]*\{\s*font-size:\s*16px/s)
  assert.match(styles, /button, select, textarea, input:not\(\[type='checkbox'\]\):not\(\[type='radio'\]\):not\(\[type='file'\]\)\)[^{]*\{\s*min-height:\s*44px/s)
  assert.match(styles, /\.empty-inline,[\s\S]*\.toast,[\s\S]*font-size:\s*16px/s)
})
