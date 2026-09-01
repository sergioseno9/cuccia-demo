import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const styles = readFileSync(new URL('../src/styles/guides.css', import.meta.url), 'utf8')

test('l’header guida usa margini full-bleed coerenti col padding della schermata', () => {
  assert.match(styles, /\.guide-reader-header\s*\{[^}]*margin:\s*-28px -18px 0/s)
  assert.match(styles, /@media \(min-width:\s*620px\)[^{]*\{[^}]*\.guide-reader-header\s*\{[^}]*margin-inline:\s*-24px/s)
  assert.doesNotMatch(styles, /@media \(max-width:\s*380px\)[^{]*\{[\s\S]*?\.guide-reader-header\s*\{[^}]*margin-inline:/)
})
