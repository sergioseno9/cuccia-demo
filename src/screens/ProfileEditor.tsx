import { ArrowLeft, Camera, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PetAvatar } from '../components/PetAvatar'
import { ConditionPreferences, PhasePicker } from '../components/ProfilePreferences'
import { caregiverColors } from '../data'
import { prepareLocalFile } from '../lib/images'
import { currentWeight } from '../lib/weight'
import { useAppState } from '../state/AppState'
import type { Caregiver, PetProfile } from '../types'

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
const editorSections = new Set(['identity', 'phase', 'health', 'contacts', 'feeding', 'reminders', 'notes', 'family'])

export function ProfileEditor() {
  const { activePet, caregivers, profile, updateCaregivers, updateProfile } = useAppState()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [draft, setDraft] = useState<PetProfile | null>(() => profile
    ? { ...profile, weight: activePet ? currentWeight(activePet)?.toString() ?? '' : '' }
    : null)
  const [familyDraft, setFamilyDraft] = useState<Caregiver[]>(caregivers)
  const [caregiverName, setCaregiverName] = useState('')
  const [photoError, setPhotoError] = useState('')

  useEffect(() => {
    const section = searchParams.get('section')
    if (!section || !editorSections.has(section)) return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`profile-editor-${section}`)?.scrollIntoView({ block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [searchParams])

  if (!draft) return null

  const update = <Key extends keyof PetProfile>(key: Key, value: PetProfile[Key]) =>
    setDraft((current) => current ? { ...current, [key]: value } : current)

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
    setFamilyDraft((current) => [...current, {
      id: createId(),
      name: caregiverName.trim(),
      role: 'Famiglia',
      color: caregiverColors[current.length % caregiverColors.length],
    }])
    setCaregiverName('')
  }

  const save = () => {
    if (!draft.name.trim() || !familyDraft.some((caregiver) => caregiver.name.trim())) return
    updateProfile(draft)
    updateCaregivers(familyDraft.filter((caregiver) => caregiver.name.trim()))
    navigate('/profilo')
  }

  return <main className="profile-editor-page">
    <header className="profile-editor-header">
      <button className="icon-button" type="button" onClick={() => navigate('/profilo')} aria-label="Torna al profilo"><ArrowLeft size={22} /></button>
      <div><p className="eyebrow">Scheda animale</p><h1>Modifica {draft.name}</h1></div>
    </header>

    <div className="profile-editor-content">
      <section className="editor-group editor-photo-section" id="profile-editor-identity">
        <label className="photo-editor"><PetAvatar className="large-dog-avatar" name={draft.name} photo={draft.photo} species={draft.species} /><span className="button-secondary"><Camera size={18} /> Cambia foto</span><input type="file" accept="image/*" onChange={(event) => void handlePhoto(event.target.files?.[0])} />{photoError && <span className="field-error">{photoError}</span>}</label>
        <div><h2>Dati di {draft.name}</h2><p className="section-explainer">Specie: {draft.species}. Per evitare errori nella scheda, la specie non cambia dopo la creazione.</p></div>
        <div className="form-grid two-columns"><label className="field"><span>Nome</span><input value={draft.name} onChange={(event) => update('name', event.target.value)} /></label><label className="field"><span>Data di nascita</span><input type="date" value={draft.birthDate} onChange={(event) => update('birthDate', event.target.value)} /></label></div>
        <div className="form-grid two-columns"><label className="field"><span>Sesso</span><select value={draft.sex} onChange={(event) => update('sex', event.target.value as PetProfile['sex'])}><option value="male">Maschio</option><option value="female">Femmina</option><option value="unknown">Non indicato</option></select></label><label className="field"><span>Taglia</span><select value={draft.size} onChange={(event) => update('size', event.target.value as PetProfile['size'])}><option value="small">Piccola</option><option value="medium">Media</option><option value="large">Grande</option></select></label></div>
        <div className="form-grid two-columns"><label className="field"><span>Razza</span><input value={draft.breed} onChange={(event) => update('breed', event.target.value)} /></label><label className="field"><span>Peso kg</span><input type="number" step="0.1" value={draft.weight} onChange={(event) => update('weight', event.target.value)} /></label></div>
        {draft.species === 'gatto' && <label className="field"><span>Vita in casa o fuori</span><select value={draft.indoorOutdoor} onChange={(event) => update('indoorOutdoor', event.target.value as PetProfile['indoorOutdoor'])}><option value="indoor">In casa</option><option value="outdoor">All’aperto</option><option value="both">Casa e fuori</option></select></label>}
      </section>

      <section className="editor-group" id="profile-editor-phase"><h2>Fase di vita</h2><p className="section-explainer">La scegli tu. Cambiarla adatta i contenuti alla fase attuale.</p><PhasePicker profile={draft} onChange={setDraft} /></section>
      <section className="editor-group" id="profile-editor-health"><ConditionPreferences profile={draft} onChange={setDraft} /><label className="field"><span>Note organizzative</span><textarea value={draft.conditionNotes} onChange={(event) => update('conditionNotes', event.target.value)} /></label><label className="field"><span>Condizioni o malattie annotate</span><textarea value={draft.medicalNotes} onChange={(event) => update('medicalNotes', event.target.value)} placeholder="Inserisci solo informazioni confermate da te" /></label></section>

      <section className="editor-group" id="profile-editor-contacts"><h2>Libretto e contatti</h2><label className="field"><span>Microchip</span><input value={draft.microchip} onChange={(event) => update('microchip', event.target.value)} /></label><div className="form-grid two-columns"><label className="field"><span>Veterinario</span><input value={draft.vetName} onChange={(event) => update('vetName', event.target.value)} /></label><label className="field"><span>Telefono veterinario</span><input type="tel" value={draft.vetPhone} onChange={(event) => update('vetPhone', event.target.value)} /></label></div><label className="field"><span>Contatto emergenza</span><textarea value={draft.emergencyContact} onChange={(event) => update('emergencyContact', event.target.value)} /></label><div className="form-grid two-columns"><label className="field"><span>Toelettatore</span><input value={draft.groomerName} onChange={(event) => update('groomerName', event.target.value)} /></label><label className="field"><span>Telefono toelettatore</span><input type="tel" value={draft.groomerPhone} onChange={(event) => update('groomerPhone', event.target.value)} /></label></div></section>

      <section className="editor-group" id="profile-editor-feeding"><h2>Alimentazione</h2><div className="form-grid two-columns"><label className="field"><span>Cibo</span><input value={draft.feeding.food} onChange={(event) => update('feeding', { ...draft.feeding, food: event.target.value })} /></label><label className="field"><span>Razione</span><input value={draft.feeding.portion} onChange={(event) => update('feeding', { ...draft.feeding, portion: event.target.value })} /></label></div><label className="field"><span>Orari o frequenza</span><input value={draft.feeding.schedule} onChange={(event) => update('feeding', { ...draft.feeding, schedule: event.target.value })} /></label><label className="field"><span>Note alimentazione</span><textarea value={draft.feeding.notes} onChange={(event) => update('feeding', { ...draft.feeding, notes: event.target.value })} /></label><label className="field"><span>Allergie confermate</span><textarea value={draft.allergies} onChange={(event) => update('allergies', event.target.value)} /></label></section>

      <section className="editor-group" id="profile-editor-reminders"><h2>Promemoria manuali</h2><p className="section-explainer">Le date entrano nello scadenzario solo dopo una tua conferma.</p><label className="field"><span>Controllo annuale</span><input type="date" value={draft.annualCheckDate} onChange={(event) => update('annualCheckDate', event.target.value)} /></label><div className="form-grid two-columns"><label className="field"><span>Rinnovo assicurazione</span><input type="date" value={draft.insuranceRenewalDate} onChange={(event) => update('insuranceRenewalDate', event.target.value)} /></label><label className="field"><span>Verifica dati microchip</span><input type="date" value={draft.microchipRenewalDate} onChange={(event) => update('microchipRenewalDate', event.target.value)} /></label></div></section>
      <section className="editor-group" id="profile-editor-notes"><h2>Note del proprietario</h2><label className="field"><span>Note</span><textarea value={draft.notes} onChange={(event) => update('notes', event.target.value)} /></label></section>

      <section className="editor-group editor-family" id="profile-editor-family"><h2>Famiglia</h2>{familyDraft.map((caregiver) => <div className="caregiver-edit-row" key={caregiver.id}><span className="avatar" style={{ background: caregiver.color }}>{caregiver.name[0]}</span><input aria-label="Nome caregiver" value={caregiver.name} onChange={(event) => setFamilyDraft((current) => current.map((item) => item.id === caregiver.id ? { ...item, name: event.target.value } : item))} /><input aria-label="Ruolo caregiver" value={caregiver.role} onChange={(event) => setFamilyDraft((current) => current.map((item) => item.id === caregiver.id ? { ...item, role: event.target.value } : item))} /><button className="icon-button" type="button" aria-label={`Rimuovi ${caregiver.name}`} onClick={() => setFamilyDraft((current) => current.filter((item) => item.id !== caregiver.id))}><Trash2 size={18} /></button></div>)}<div className="inline-add"><input value={caregiverName} onChange={(event) => setCaregiverName(event.target.value)} placeholder="Nuova persona" /><button className="icon-button filled" type="button" onClick={addCaregiver} aria-label="Aggiungi persona"><Plus size={20} /></button></div></section>
    </div>

    <footer className="profile-editor-actions"><button className="button-secondary" type="button" onClick={() => navigate('/profilo')}>Annulla</button><button className="button-primary" type="button" onClick={save}>Salva modifiche</button></footer>
  </main>
}
