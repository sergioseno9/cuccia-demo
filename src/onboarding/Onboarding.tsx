import { Camera, Cat, Check, ChevronLeft, ChevronRight, Dog, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ConditionPreferences, PhasePicker } from '../components/ProfilePreferences'
import { PetAvatar } from '../components/PetAvatar'
import { caregiverColors } from '../data'
import { createDemoData } from '../lib/demo'
import { createEmptyHealth } from '../lib/migrate'
import { prepareLocalFile } from '../lib/images'
import { createEmptyProfile, modulePresets, suggestLifePhase, withRequiredModules } from '../lib/profile'
import { useAppState } from '../state/AppState'
import type { AppData, Caregiver, HealthData, PetProfile, PetSpecies } from '../types'

const stepTitles = ['Specie', 'Nome e foto', 'Età e fase', 'Dettagli', 'Peso', 'Microchip', 'Veterinario', 'Famiglia', 'Condizioni']
const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

const onboardingData = (profile: PetProfile, health: HealthData, caregivers: Caregiver[]): AppData => {
  const normalized = {
    ...profile,
    trackedModules: withRequiredModules(profile.trackedModules, profile.conditions, profile.species),
  }
  return {
    schemaVersion: 2,
    household: { caregivers },
    pets: [{ id: normalized.id, profile: normalized, health, events: [], trickProgress: {}, badges: [] }],
    selectedPetId: normalized.id,
    selectedCaregiverId: caregivers[0]?.id ?? '',
    tutorialDone: false,
  }
}

export function Onboarding({ onComplete }: { onComplete?: (data: AppData) => Promise<void> | void }) {
  const { completeOnboarding, loadDemo } = useAppState()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<PetProfile>(() => createEmptyProfile('cane', createId()))
  const [caregivers, setCaregivers] = useState<Caregiver[]>([
    { id: createId(), name: '', role: 'Famiglia', color: caregiverColors[0] },
  ])
  const [caregiverName, setCaregiverName] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [finishError, setFinishError] = useState('')
  const [finishing, setFinishing] = useState(false)

  const update = <Key extends keyof PetProfile>(key: Key, value: PetProfile[Key]) =>
    setProfile((current) => ({ ...current, [key]: value }))

  const selectSpecies = (species: PetSpecies) => setProfile((current) => ({
    ...createEmptyProfile(species, current.id),
    createdAt: current.createdAt,
  }))

  const changeBirthDate = (birthDate: string) => {
    const lifePhase = birthDate ? suggestLifePhase(birthDate) : profile.lifePhase
    setProfile((current) => ({
      ...current,
      birthDate,
      lifePhase,
      trackedModules: modulePresets(current.species, lifePhase),
    }))
  }

  const handlePhoto = async (file?: File) => {
    if (!file) return
    try {
      update('photo', await prepareLocalFile(file, 1000))
      setPhotoError('')
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Impossibile preparare la foto.')
    }
  }

  const addCaregiver = () => {
    if (!caregiverName.trim()) return
    setCaregivers((current) => [...current, {
      id: createId(),
      name: caregiverName.trim(),
      role: 'Famiglia',
      color: caregiverColors[current.length % caregiverColors.length],
    }])
    setCaregiverName('')
  }

  const canContinue = step === 1 ? Boolean(profile.name.trim()) : step === 7
    ? caregivers.some((caregiver) => caregiver.name.trim())
    : true

  const finishWithData = async (data: AppData) => {
    if (!onComplete) {
      const pet = data.pets[0]
      completeOnboarding(pet.profile, pet.health, data.household.caregivers)
      return
    }
    setFinishing(true)
    setFinishError('')
    try {
      await onComplete(data)
    } catch (error) {
      setFinishError(error instanceof Error ? error.message : 'Non riesco a completare il salvataggio. I dati inseriti restano disponibili.')
    } finally {
      setFinishing(false)
    }
  }

  const finish = () => {
    const cleanCaregivers = caregivers.filter((caregiver) => caregiver.name.trim())
    const health = createEmptyHealth()
    if (profile.weight) health.weights.push({
      id: createId(), value: Number(profile.weight), date: new Date().toISOString().slice(0, 10), documents: [],
    })
    void finishWithData(onboardingData(profile, health, cleanCaregivers))
  }

  const useDemo = () => onComplete ? void finishWithData(createDemoData()) : loadDemo()

  return <main className="onboarding-shell">
    <div className="onboarding-brand"><img src="./dog-icon.svg" alt="" /><span>cuccia</span></div>
    <section className="onboarding-card">
      <div className="onboarding-progress" aria-label={`Passaggio ${step + 1} di ${stepTitles.length}`}><span style={{ width: `${((step + 1) / stepTitles.length) * 100}%` }} /></div>
      <div className="onboarding-step-label">Passaggio {step + 1} di {stepTitles.length} · {stepTitles[step]}</div>

      {step === 0 && <div className="onboarding-content"><p className="eyebrow">Partiamo da qui</p><h1>Chi entra in Cuccia?</h1><p>Scegli cane o gatto. L’app mostrerà solo strumenti sensati per lui.</p><div className="species-choice"><button className={profile.species === 'cane' ? 'is-selected' : ''} onClick={() => selectSpecies('cane')}><Dog size={36} /><strong>Cane</strong><span>Uscite, Cura, guide e addestramento</span></button><button className={profile.species === 'gatto' ? 'is-selected' : ''} onClick={() => selectSpecies('gatto')}><Cat size={36} /><strong>Gatto</strong><span>Cura, lettiera opzionale e profilo dedicato</span></button></div></div>}

      {step === 1 && <div className="onboarding-content"><p className="eyebrow">La sua scheda</p><h1>Come si chiama?</h1><label className="onboarding-photo"><PetAvatar name={profile.name || 'il tuo pet'} photo={profile.photo} species={profile.species} /><strong><Camera size={18} /> Aggiungi foto</strong><input type="file" accept="image/*" onChange={(event) => void handlePhoto(event.target.files?.[0])} />{photoError && <span className="field-error">{photoError}</span>}</label><label className="field"><span>Nome</span><input autoFocus value={profile.name} onChange={(event) => update('name', event.target.value)} placeholder={profile.species === 'gatto' ? 'Es. Luna' : 'Es. Milo'} /></label></div>}

      {step === 2 && <div className="onboarding-content"><p className="eyebrow">Età e fase</p><h1>In che momento della vita è {profile.name}?</h1><label className="field"><span>Data di nascita <small>opzionale</small></span><input type="date" value={profile.birthDate} onChange={(event) => changeBirthDate(event.target.value)} /><small>La data suggerisce una fase, ma la scelta resta sempre tua.</small></label><PhasePicker profile={profile} onChange={setProfile} resetModulesOnPhase /></div>}

      {step === 3 && <div className="onboarding-content"><p className="eyebrow">Dettagli</p><h1>Qualche informazione utile</h1><div className="form-grid two-columns"><label className="field"><span>Sesso</span><select value={profile.sex} onChange={(event) => update('sex', event.target.value as PetProfile['sex'])}><option value="unknown">Non indicato</option><option value="male">Maschio</option><option value="female">Femmina</option></select></label><label className="field"><span>Taglia</span><select value={profile.size} onChange={(event) => update('size', event.target.value as PetProfile['size'])}><option value="small">Piccola</option><option value="medium">Media</option><option value="large">Grande</option></select></label></div><label className="field"><span>Razza <small>opzionale</small></span><input value={profile.breed} onChange={(event) => update('breed', event.target.value)} /></label>{profile.species === 'gatto' && <label className="field"><span>Vita in casa o fuori</span><select value={profile.indoorOutdoor} onChange={(event) => update('indoorOutdoor', event.target.value as PetProfile['indoorOutdoor'])}><option value="indoor">In casa</option><option value="outdoor">All’aperto</option><option value="both">Casa e fuori</option></select></label>}</div>}

      {step === 4 && <div className="onboarding-content"><p className="eyebrow">Peso</p><h1>Quanto pesa {profile.name}?</h1><label className="field"><span>Peso in kg <small>opzionale</small></span><input type="number" min="0" step="0.1" value={profile.weight} onChange={(event) => update('weight', event.target.value)} placeholder="Es. 7,4" /></label><p className="gentle-note">Puoi lasciarlo vuoto e aggiungerlo più avanti in Cura.</p></div>}

      {step === 5 && <div className="onboarding-content"><p className="eyebrow">Identificazione</p><h1>Microchip</h1><label className="field"><span>Numero microchip <small>opzionale</small></span><input inputMode="numeric" value={profile.microchip} onChange={(event) => update('microchip', event.target.value)} /></label><p className="gentle-note">Viene salvato solo su questo dispositivo e compare nella Pet Card.</p></div>}

      {step === 6 && <div className="onboarding-content"><p className="eyebrow">Contatti utili</p><h1>Veterinario di riferimento</h1><label className="field"><span>Nome <small>opzionale</small></span><input value={profile.vetName} onChange={(event) => update('vetName', event.target.value)} /></label><label className="field"><span>Telefono <small>opzionale</small></span><input type="tel" value={profile.vetPhone} onChange={(event) => update('vetPhone', event.target.value)} /></label><label className="field"><span>Contatto emergenza <small>opzionale</small></span><textarea value={profile.emergencyContact} onChange={(event) => update('emergencyContact', event.target.value)} /></label></div>}

      {step === 7 && <div className="onboarding-content"><p className="eyebrow">Famiglia</p><h1>Chi si occupa di {profile.name} con te?</h1><p>Ogni voce del Diario conserva sempre persona e orario.</p><div className="caregiver-onboarding-list">{caregivers.map((caregiver, index) => <div key={caregiver.id}><span className="avatar" style={{ background: caregiver.color }}>{caregiver.name[0] || index + 1}</span><input aria-label={`Nome persona ${index + 1}`} value={caregiver.name} onChange={(event) => setCaregivers((current) => current.map((item) => item.id === caregiver.id ? { ...item, name: event.target.value } : item))} placeholder={index === 0 ? 'Il tuo nome' : 'Nome'} />{caregivers.length > 1 && <button className="icon-button" onClick={() => setCaregivers((current) => current.filter((item) => item.id !== caregiver.id))} aria-label="Rimuovi"><Trash2 size={17} /></button>}</div>)}</div><div className="inline-add"><input value={caregiverName} onChange={(event) => setCaregiverName(event.target.value)} placeholder="Aggiungi una persona" /><button className="icon-button filled" onClick={addCaregiver} aria-label="Aggiungi persona"><Plus size={20} /></button></div></div>}

      {step === 8 && <div className="onboarding-content"><p className="eyebrow">Personalizzazione</p><h1>C’è qualcosa da tenere in vista?</h1><ConditionPreferences profile={profile} onChange={setProfile} /><label className="field"><span>Note sulle condizioni <small>opzionali</small></span><textarea value={profile.conditionNotes} onChange={(event) => update('conditionNotes', event.target.value)} /></label><p className="gentle-note"><Check size={18} /> Queste etichette organizzano i moduli. Non sono diagnosi.</p></div>}

      {finishError && <p className="field-error onboarding-finish-error" role="alert">{finishError}</p>}
      <div className="onboarding-actions"><button className="button-secondary" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0 || finishing}><ChevronLeft size={19} /> Indietro</button>{step < stepTitles.length - 1 ? <button className="button-primary" onClick={() => setStep((current) => current + 1)} disabled={!canContinue || finishing}>Avanti <ChevronRight size={19} /></button> : <button className="button-primary" onClick={finish} disabled={finishing}>{finishing ? 'Salvataggio…' : 'Entra in Cuccia'} <Check size={19} /></button>}</div>
    </section>
    <button className="demo-link" onClick={useDemo} disabled={finishing}>Oppure prova con dati dimostrativi</button>
  </main>
}
