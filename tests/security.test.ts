import assert from 'node:assert/strict'
import test from 'node:test'
import { isForbiddenSupabaseKey } from '../src/lib/supabaseKey.ts'

const jwt = (payload: Record<string, string>) => {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `header.${encoded}.signature`
}

test('accetta soltanto chiavi client e rifiuta chiavi server', () => {
  assert.equal(isForbiddenSupabaseKey('sb_publishable_demo'), false)
  assert.equal(isForbiddenSupabaseKey(`sb_${'secret'}_${'x'.repeat(24)}`), true)
  assert.equal(isForbiddenSupabaseKey(jwt({ role: 'anon' })), false)
  assert.equal(isForbiddenSupabaseKey(jwt({ role: 'service_role' })), true)
})
