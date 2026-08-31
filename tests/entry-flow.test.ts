import assert from 'node:assert/strict'
import test from 'node:test'
import { authErrorMessage } from '../src/auth/authMessages.ts'
import { mapCloudSnapshot } from '../src/cloud/cloudSnapshot.ts'
import { decideEntryScreen } from '../src/entry/entryFlow.ts'

const entry = (overrides: Partial<Parameters<typeof decideEntryScreen>[0]> = {}) => decideEntryScreen({
  authLoading: false,
  hasSession: false,
  guestMode: false,
  cloudState: 'idle',
  localPetCount: 0,
  ...overrides,
})

test('senza sessione mostra sempre il benvenuto', () => {
  assert.equal(entry(), 'welcome')
  assert.equal(entry({ localPetCount: 2 }), 'welcome')
})

test('la modalità ospite conserva onboarding e app locali', () => {
  assert.equal(entry({ guestMode: true }), 'local-onboarding')
  assert.equal(entry({ guestMode: true, localPetCount: 1 }), 'local-app')
})

test('un account viene deciso dalla presenza di pet cloud', () => {
  assert.equal(entry({ hasSession: true, cloudState: 'checking' }), 'loading')
  assert.equal(entry({ hasSession: true, cloudState: 'empty' }), 'cloud-onboarding')
  assert.equal(entry({ hasSession: true, cloudState: 'empty', localPetCount: 1 }), 'cloud-import')
  assert.equal(entry({ hasSession: true, cloudState: 'ready' }), 'cloud-app')
})

test('logout e problemi cloud hanno destinazioni non ambigue', () => {
  assert.equal(entry({ hasSession: false, cloudState: 'ready' }), 'welcome')
  assert.equal(entry({ hasSession: true, cloudState: 'error' }), 'cloud-error')
})

test('gli errori auth più comuni sono chiari in italiano', () => {
  assert.equal(
    authErrorMessage(new Error('Invalid login credentials')),
    'Email o password non corrette. Controlla i dati e riprova.',
  )
  assert.match(authErrorMessage(new Error('Email not confirmed')), /non è ancora confermata/)
})

test('uno snapshot cloud ricostruisce pet, autore e attività', () => {
  const data = mapCloudSnapshot({
    pets: [{
      id: 'cloud-pet', legacy_source_id: 'local-pet', name: 'Milo', species: 'cane',
      profile_data: { id: 'local-pet', name: 'Milo', species: 'cane', lifePhase: 'adulto' },
      photo_path: null, deleted_at: null,
    }],
    activities: [{
      id: 'cloud-event', legacy_source_id: 'local-event', pet_id: 'cloud-pet',
      author_snapshot: 'Giulia', activity_type: 'meal', happened_at: '2026-08-31T18:00:00.000Z',
    }],
    healthEvents: [], medications: [], weightLogs: [], documents: [], contentProgress: [],
    assetUrls: new Map(),
  }, 'Sergio')

  assert.equal(data.pets.length, 1)
  assert.equal(data.pets[0].profile.name, 'Milo')
  assert.equal(data.pets[0].events[0].id, 'local-event')
  assert.equal(data.household.caregivers.find((item) => item.name === 'Giulia')?.id, data.pets[0].events[0].caregiverId)
})
