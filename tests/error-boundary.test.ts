import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppErrorBoundary } from '../src/components/AppErrorBoundary.ts'

test('l’error boundary sostituisce il contenuto con un fallback ricaricabile', () => {
  const boundary = new AppErrorBoundary({ children: 'contenuto app' })
  assert.equal(boundary.render(), 'contenuto app')

  boundary.state = AppErrorBoundary.getDerivedStateFromError()
  const html = renderToStaticMarkup(boundary.render())

  assert.match(html, /Qualcosa è andato storto/)
  assert.match(html, /I tuoi dati non sono stati cancellati/)
  assert.match(html, />Ricarica</)
})
