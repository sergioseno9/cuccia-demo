import { Camera, ChevronLeft, ChevronRight, Dog, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ConditionPreferences, PhasePicker, TrackingPreferences } from '../components/ProfilePreferences'
import { caregiverColors } from '../data'
import { ageLabel, todayKey } from '../lib/date'
import { modulePresets, suggestLifePhase } from '../lib/profile'
import { useAppState } from '../state/AppState'
import type { Caregiver, DogProfile, HealthData } from '../types'

const initialProfile: DogProfile = {
  createdAt: new Date().toISOString(),
  lifePhase: 'adulto',
  trackedModules: modulePresets.adulto,
  conditions: [],
  conditionNotes: '',
  name: '',
  photo: '',
  birthDate: '',
  sex: 'unknown',
  breed: '',
  size: 'medium',
  weight: '',
  microchip: '',
  vetName: '',
  vetPhone: '',
  emergencyContact: '',
  groomerName: '',
  groomerPhone: '',
  feeding: { food: '', portion: '', schedule: '', notes: '' },
  allergies: '',
  notes: '',
  annualCheckDate: '',
  insuranceRenewalDate: '',
  microchipRenewalDate: '',
  documents: [],
  caregivers: [{ id: 'caregiver-1', name: 'Giulia', role: 'Caregiver', color: caregiverColors[0] }],
}

const steps = [
  'Nome e foto',
  'Età e fase',
  'Qualche dettaglio',
  'Peso',
  'Microchip',
  'Veterinario',
  'Chi se ne occupa',
  'Cosa vuoi seguire',
  'Condizioni particolari',
]

const createId = () => `${Date.now()}-${Math.random()}`

export function Onboarding() {
  const { completeOnboarding, loadDemo } = useAppState()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState(initialProfile)
  const [caregiverName, setCaregiverName] = useState('')
  const [photoError, setPhotoError] = useState('')

  const update = <Key extends keyof DogProfile>(key: Key, value: DogProfile[Key]) => {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  const handlePhoto = (file?: File) => {
    if (!file) return
    if (file.size > 1_200_000) {
      setPhotoError('Scegli una foto sotto 1,2 MB per salvarla nel browser.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => update('photo', String(reader.result ?? ''))
    reader.readAsDataURL(file)
    setPhotoError('')
  }

  const addCaregiver = () => {
    if (!caregiverName.trim()) return
    const next: Caregiver = {
      id: createId(),
      name: caregiverName.trim(),
      role: 'Caregiver',
      color: caregiverColors[profile.caregivers.length % caregiverColors.length],
    }
    update('caregivers', [...profile.caregivers, next])
    setCaregiverName('')
  }

  const finish = () => {
    const caregivers = profile.caregivers.length ? profile.caregivers : [{ id: createId(), name: 'Io', role: 'Caregiver', color: caregiverColors[0] }]
    const finalProfile = { ...profile, caregivers, name: profile.name.trim() || 'Il mio cane' }
    const weight = Number(profile.weight)
    const health: HealthData = {
      vaccinations: [],
      preventions: [],
      medications: [],
      visits: [],
      weights: weight > 0 ? [{ id: createId(), value: weight, date: todayKey() }] : [],
    }
    completeOnboarding(finalProfile, health)
  }

  const renderStep = () => {
    if (step === 0) return <><div className="photo-picker"><div className="photo-preview">{profile.photo ? <img src={profile.photo} alt="Anteprima del cane" /> : <Dog size={34} />}</div><label className="button-secondary photo-button"><Camera size={17} /> Foto<input type="file" accept="image/*" onChange={(event) => handlePhoto(event.target.files?.[0])} /></label></div>{photoError && <p className="field-error">{photoError}</p>}<label className="field"><span>Come si chiama?</span><input value={profile.name} onChange={(event) => update('name', event.target.value)} placeholder="Milo" autoFocus /></label></>

    if (step === 1) return <><label className="field"><span>Data di nascita <small>opzionale</small></span><input type="date" max={todayKey()} value={profile.birthDate} onChange={(event) => { const birthDate = event.target.value; const lifePhase = suggestLifePhase(birthDate); setProfile((current) => ({ ...current, birthDate, lifePhase, trackedModules: modulePresets[lifePhase] })) }} /></label>{profile.birthDate && <div className="onboarding-insight"><strong>{ageLabel(profile.birthDate)}</strong><span>Ti suggeriamo una fase, ma la scegli sempre tu.</span></div>}<PhasePicker profile={profile} onChange={setProfile} resetModulesOnPhase /></>

    if (step === 2) return <div className="form-stack"><label className="field"><span>Sesso <small>opzionale</small></span><select value={profile.sex} onChange={(event) => update('sex', event.target.value as DogProfile['sex'])}><option value="unknown">Non indicato</option><option value="male">Maschio</option><option value="female">Femmina</option></select></label><label className="field"><span>Razza <small>opzionale</small></span><input value={profile.breed} onChange={(event) => update('breed', event.target.value)} placeholder="Es. Meticcio" /></label><label className="field"><span>Taglia</span><select value={profile.size} onChange={(event) => update('size', event.target.value as DogProfile['size'])}><option value="small">Piccola</option><option value="medium">Media</option><option value="large">Grande</option></select></label></div>

    if (step === 3) return <label className="field"><span>Peso attuale <small>opzionale</small></span><div className="input-suffix"><input type="number" min="0" step="0.1" value={profile.weight} onChange={(event) => update('weight', event.target.value)} placeholder="7,4" /><span>kg</span></div><small>Puoi aggiornarlo quando vuoi nel libretto sanitario.</small></label>

    if (step === 4) return <label className="field"><span>Numero microchip <small>opzionale</small></span><input value={profile.microchip} onChange={(event) => update('microchip', event.target.value)} inputMode="numeric" placeholder="Numero di 15 cifre" /><small>Lo trovi sul libretto o sul certificato di registrazione.</small></label>

    if (step === 5) return <div className="form-stack"><label className="field"><span>Veterinario di riferimento <small>opzionale</small></span><input value={profile.vetName} onChange={(event) => update('vetName', event.target.value)} placeholder="Nome o clinica" /></label><label className="field"><span>Telefono</span><input type="tel" value={profile.vetPhone} onChange={(event) => update('vetPhone', event.target.value)} placeholder="+39…" /></label><label className="field"><span>Contatto di emergenza</span><input value={profile.emergencyContact} onChange={(event) => update('emergencyContact', event.target.value)} placeholder="Clinica o persona e telefono" /></label></div>

    if (step === 6) return <><p className="plain-explainer">Aggiungi le persone che registreranno attività e farmaci su questo dispositivo.</p><div className="caregiver-list">{profile.caregivers.map((caregiver) => <div className="caregiver-edit-row" key={caregiver.id}><span className="avatar" style={{ background: caregiver.color }}>{caregiver.name[0]}</span><input value={caregiver.name} onChange={(event) => update('caregivers', profile.caregivers.map((item) => item.id === caregiver.id ? { ...item, name: event.target.value } : item))} /><button className="icon-button" aria-label={`Rimuovi ${caregiver.name}`} onClick={() => update('caregivers', profile.caregivers.filter((item) => item.id !== caregiver.id))}><Trash2 size={17} /></button></div>)}</div><div className="inline-add"><input value={caregiverName} onChange={(event) => setCaregiverName(event.target.value)} placeholder="Aggiungi una persona" /><button className="icon-button filled" onClick={addCaregiver} aria-label="Aggiungi caregiver"><Plus size={18} /></button></div></>

    if (step === 7) return <TrackingPreferences profile={profile} onChange={setProfile} />
    return <ConditionPreferences profile={profile} onChange={setProfile} />
  }

  return (
    <main className="onboarding-shell">
      <section className="onboarding-card">
        <header className="onboarding-brand"><img src="./dog-icon.svg" alt="" /><div><strong>cuccia</strong><span>Tutto ciò che conta, sempre a portata di mano.</span></div></header>
        <div className="progress-track"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        <p className="step-count">Passaggio {step + 1} di {steps.length}</p>
        <h1>{steps[step]}</h1>
        <p className="step-copy">Puoi saltare questo passaggio e modificare tutto più tardi.</p>
        <div className="step-body">{renderStep()}</div>
        <div className="onboarding-actions">
          {step > 0 ? <button className="button-secondary" onClick={() => setStep(step - 1)}><ChevronLeft size={17} /> Indietro</button> : <button className="text-button" onClick={loadDemo}>Prova con Milo</button>}
          <button className="button-primary" onClick={() => step === steps.length - 1 ? finish() : setStep(step + 1)}>{step === steps.length - 1 ? 'Entra in cuccia' : 'Avanti'}{step < steps.length - 1 && <ChevronRight size={17} />}</button>
        </div>
        {step < steps.length - 1 && <button className="skip-button" onClick={() => setStep(step + 1)}>Salta per ora</button>}
      </section>
    </main>
  )
}
