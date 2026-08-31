import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { buildMigrationPlan } from '../src/cloud/migrationPlan.ts'
import { importMigrationPlan } from '../src/cloud/migrationRepository.ts'
import { createDemoData } from '../src/lib/demo.ts'
import { createEmptyHealth } from '../src/lib/migrate.ts'
import { createEmptyProfile } from '../src/lib/profile.ts'

const parseStatusEnv = () => {
  const output = execFileSync('./node_modules/.bin/supabase', ['status', '-o', 'env'], { encoding: 'utf8' })
  return Object.fromEntries(output.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^([A-Z_]+)="?(.*?)"?$/)
    return match ? [[match[1], match[2]]] : []
  }))
}

const remoteStatus = {
  API_URL: process.env.SUPABASE_TEST_URL,
  PUBLISHABLE_KEY: process.env.SUPABASE_TEST_ANON_KEY,
  SERVICE_ROLE_KEY: process.env.SUPABASE_TEST_SERVICE_ROLE_KEY,
}
const status = Object.values(remoteStatus).every(Boolean) ? remoteStatus : parseStatusEnv()
const apiUrl = status.API_URL ?? status.SUPABASE_URL
const anonKey = status.ANON_KEY ?? status.PUBLISHABLE_KEY
const serviceKey = status.SERVICE_ROLE_KEY
if (!apiUrl || !anonKey || !serviceKey) throw new Error('Credenziali dello stack locale non disponibili.')

const admin = createClient(apiUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
const client = createClient(apiUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
const suffix = crypto.randomUUID()
const isRemote = Boolean(process.env.SUPABASE_TEST_URL)
const email = isRemote
  ? `cuccia.phase1.${suffix}@gmail.com`
  : `phase1-${suffix}@example.test`
const firstPassword = `Cuccia-${suffix}-A1!`
const secondPassword = `Cuccia-${suffix}-B2!`
let userId = ''
let householdId = ''

try {
  if (isRemote) {
    const createdUser = await admin.auth.admin.createUser({
      email, password: firstPassword, email_confirm: true,
    })
    assert.equal(createdUser.error, null)
    assert.ok(createdUser.data.user)
    userId = createdUser.data.user.id
  } else {
    const signUp = await client.auth.signUp({ email, password: firstPassword })
    assert.equal(signUp.error, null)
    assert.ok(signUp.data.user)
    assert.equal(signUp.data.session, null, 'la conferma email deve essere richiesta')
    userId = signUp.data.user.id
  }

  const automaticProfile = await admin.from('profiles')
    .select('id,display_name').eq('id', userId).single()
  assert.equal(automaticProfile.error, null)
  assert.equal(automaticProfile.data.id, userId)

  const removeProfile = await admin.from('profiles').delete().eq('id', userId)
  assert.equal(removeProfile.error, null)

  if (!isRemote) {
    const confirmation = await admin.auth.admin.updateUserById(userId, { email_confirm: true })
    assert.equal(confirmation.error, null)
  }

  const login = await client.auth.signInWithPassword({ email, password: firstPassword })
  assert.equal(login.error, null)
  assert.ok(login.data.session)

  if (isRemote) {
    const passwordUpdate = await admin.auth.admin.updateUserById(userId, { password: secondPassword })
    assert.equal(passwordUpdate.error, null)
  } else {
    const resetRequest = await client.auth.resetPasswordForEmail(email)
    assert.equal(resetRequest.error, null)
    const recovery = await admin.auth.admin.generateLink({ type: 'recovery', email })
    assert.equal(recovery.error, null)
    const tokenHash = recovery.data.properties.hashed_token
    assert.ok(tokenHash)
    const recoverySession = await client.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash })
    assert.equal(recoverySession.error, null)
    const passwordUpdate = await client.auth.updateUser({ password: secondPassword })
    assert.equal(passwordUpdate.error, null)
  }
  assert.equal((await client.auth.signOut()).error, null)

  const secondLogin = await client.auth.signInWithPassword({ email, password: secondPassword })
  assert.equal(secondLogin.error, null)
  assert.ok(secondLogin.data.user)

  const plan = await buildMigrationPlan(createDemoData())
  const firstImport = await importMigrationPlan(plan, secondLogin.data.user, { client, saveLink: () => undefined })
  householdId = firstImport.link.householdId
  assert.deepEqual(firstImport.counts, plan.counts)
  assert.equal(firstImport.reusedBatch, false)

  const repairedProfile = await admin.from('profiles')
    .select('id').eq('id', userId).single()
  assert.equal(repairedProfile.error, null)
  const household = await client.from('households')
    .select('id,created_by').eq('id', householdId).single()
  assert.equal(household.error, null)
  assert.equal(household.data.created_by, userId)
  const householdMembership = await client.from('household_members')
    .select('id,role,status').eq('household_id', householdId).eq('user_id', userId).single()
  assert.equal(householdMembership.error, null)
  assert.equal(householdMembership.data.role, 'owner')
  assert.equal(householdMembership.data.status, 'active')

  const secondImport = await importMigrationPlan(plan, secondLogin.data.user, { client, saveLink: () => undefined })
  assert.equal(secondImport.link.batchId, firstImport.link.batchId)
  assert.deepEqual(secondImport.counts, plan.counts)
  assert.equal(secondImport.reusedBatch, true)

  const onboardingPetId = `onboarding-${suffix}`
  const onboardingProfile = {
    ...createEmptyProfile('cane', onboardingPetId),
    name: 'Nuvola',
    photo: 'data:image/jpeg;base64,/9j/2Q==',
    weight: '4.2',
  }
  const onboardingPlan = await buildMigrationPlan({
    schemaVersion: 2,
    household: { caregivers: [{ id: 'owner', name: 'Sergio', role: 'Famiglia', color: '#D9694A' }] },
    pets: [{
      id: onboardingPetId,
      profile: onboardingProfile,
      health: createEmptyHealth(),
      events: [],
      trickProgress: {},
      badges: [],
    }],
    selectedPetId: onboardingPetId,
    selectedCaregiverId: 'owner',
    tutorialDone: false,
  })
  const onboardingImport = await importMigrationPlan(
    onboardingPlan,
    secondLogin.data.user,
    { client, saveLink: () => undefined },
  )
  assert.equal(onboardingImport.reusedBatch, false)
  const createdPet = await client.from('pets')
    .select('id,household_id,photo_path').eq('legacy_source_id', onboardingPetId).single()
  assert.equal(createdPet.error, null)
  assert.equal(createdPet.data.household_id, householdId)
  assert.match(createdPet.data.photo_path, /profile\/photo-/)
  const petMembership = await client.from('pet_members')
    .select('id').eq('pet_id', createdPet.data.id).eq('user_id', userId).single()
  assert.equal(petMembership.error, null)
  const repeatedOnboarding = await importMigrationPlan(
    onboardingPlan,
    secondLogin.data.user,
    { client, saveLink: () => undefined },
  )
  assert.equal(repeatedOnboarding.link.batchId, onboardingImport.link.batchId)
  assert.equal(repeatedOnboarding.reusedBatch, true)

  const rollbackCounts = {
    pets: 1, activities: 0, healthEvents: 0, medications: 0,
    medicationLogs: 0, weightLogs: 0, documents: 0, contentProgress: 0,
  }
  const pending = await client.rpc('begin_migration_batch', {
    target_household_id: householdId,
    fingerprint: `rollback-${suffix}`,
    expected: rollbackCounts,
  })
  assert.equal(pending.error, null)
  assert.ok(pending.data && typeof pending.data === 'object' && 'id' in pending.data)
  const pendingId = (pending.data as { id: string }).id
  const tempPet = await client.rpc('create_pet_with_owner', {
    target_household_id: householdId,
    pet_payload: { name: 'Temporaneo', species: 'cane', lifePhase: 'adulto' },
    source_id: `rollback-pet-${suffix}`,
    batch_id: pendingId,
  })
  assert.equal(tempPet.error, null)
  const rollback = await client.rpc('rollback_migration_batch', { batch_id: pendingId })
  assert.equal(rollback.error, null)
  const removed = await client.from('pets').select('id', { count: 'exact', head: true }).eq('legacy_source_id', `rollback-pet-${suffix}`)
  assert.equal(removed.count, 0)

  assert.equal((await client.auth.signOut()).error, null)
  const reloadLogin = await client.auth.signInWithPassword({ email, password: secondPassword })
  assert.equal(reloadLogin.error, null)
  const reloadedPet = await client.from('pets').select('id').eq('id', createdPet.data.id).single()
  assert.equal(reloadedPet.error, null)
  assert.equal((await client.auth.signOut()).error, null)
  console.log('PASS: profilo auth automatico, autoriparazione legacy, onboarding cloud, reload, doppio import e rollback pulito')
} finally {
  if (householdId) await admin.from('households').delete().eq('id', householdId)
  if (userId) await admin.auth.admin.deleteUser(userId)
}
