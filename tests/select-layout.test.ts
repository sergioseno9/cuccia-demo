import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const baseCss = readFileSync(new URL('../src/styles/base.css', import.meta.url), 'utf8')
const screensCss = readFileSync(new URL('../src/styles/screens.css', import.meta.url), 'utf8')

test('field selects share input spacing and readable line height', () => {
  assert.match(baseCss, /\.field input,\s*\.field select\s*\{[^}]*padding-block:\s*12px;[^}]*line-height:\s*1\.4;/s)
  assert.match(baseCss, /\.field select\s*\{[^}]*padding-right:\s*42px;/s)
})

test('document selects use the same minimum height and typography', () => {
  assert.match(screensCss, /\.document-add select\s*\{[^}]*min-height:\s*52px;[^}]*padding:\s*12px 42px 12px 15px;[^}]*font-size:\s*16px;[^}]*line-height:\s*1\.4;/s)
})
