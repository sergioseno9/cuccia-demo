import { Camera, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../components/Modal'
import { ConditionPreferences, PhasePicker, TrackingPreferences } from '../components/ProfilePreferences'
import { caregiverColors } from '../data'
import { prepareLocalFile } from '../lib/images'
import { useAppState } from '../state/AppState'
import type { Caregiver, PetProfile } from '../types'
import { PetAvatar } from '../components/PetAvatar'

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export function ProfileEditor({ onClose }: { onClose: () => void }) {
  const { caregivers, profile, updateCaregivers, updateProfile } = useAppState()
  const [draft, setDraft] = useState<PetProfile | null>(profile)
  const [familyDraft, setFamilyDraft] = useState<Caregiver[]>(caregivers)
  const [caregiverName, setCaregiverName] = useState('')
  const [photoError, setPhotoError] = useState('')
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
      id: createId(), name: caregiverName.trim(), role: 'Famiglia',
      color: caregiverColors[current.length % caregiverColors.length],
    }])
    setCaregiverName('')
  }

  const save = () => {
    if (!draft.name.trim() || !familyDraft.some((caregiver) => caregiver.name.trim())) return
    updateProfile(draft)
    updateCaregivers(familyDraft.filter((caregiver) => caregiver.name.trim()))
    onClose()
  }

  return <Modal title={`Modifica ${draft.name}`} onClose={onClose}>
    <div className="profile-editor-scroll">
      <label className="photo-editor"><PetAvatar className="large-dog-avatar" name={draft.name} photo={draft.photo} species={draft.species} /><span className="button-secondary"><Camera size={16} /> Cambia foto</span><input type="file" accept="image/*" onChange={(event) => void handlePhoto(event.target.files?.[0])} />{photoError && <span className="field-error">{photoError}</span>}</label>

      <div className="editor-group"><h3>Dati di {draft.name}</h3><p className="section-explainer">Specie: {draft.species}. Per evitare errori nella scheda, la specie non cambia dopo la creazione.</p><div className="form-grid two-columns"><label className="field"><span>Nome</span><input value={draft.name} onChange={(event) => update('name', event.target.value)} /></label><label className="field"><span>Data di nascita</span><input type="date" value={draft.birthDate} onChange={(event) => update('birthDate', event.target.value)} /></label></div><div className="form-grid two-columns"><label className="field"><span>Sesso</span><select value={draft.sex} onChange={(event) => update('sex', event.target.value as PetProfile['sex'])}><option value="male">Maschio</option><option value="female">Femmina</option><option value="unknown">Non indicato</option></select></label><label className="field"><span>Taglia</span><select value={draft.size} onChange={(event) => update('size', event.target.value as PetProfile['size'])}><option value="small">Piccola</option><option value="medium">Media</option><option value="large">Grande</option></select></label></div><div className="form-grid two-columns"><label className="field"><span>Razza</span><input value={draft.breed} onChange={(event) => update('breed', event.target.value)} /></label><label className="field"><span>Peso kg</span><input type="number" step="0.1" value={draft.weight} onChange={(event) => update('weight', event.target.value)} /></label></div>{draft.species === 'gatto' && <label className="field"><span>Vita in casa o fuori</span><select value={draft.indoorOutdoor} onChange={(event) => update('indoorOutdoor', event.target.value as PetProfile['indoorOutdoor'])}><option value="indoor">In casa</option><option value="outdoor">All’aperto</option><option value="both">Casa e fuori</option></select></label>}</div>

      <div className="editor-group"><h3>Fase di vita</h3><p className="section-explainer">La scegli tu. Cambiarla aggiorna il punto di partenza di moduli e contenuti.</p><PhasePicker profile={draft} onChange={setDraft} resetModulesOnPhase /></div>
      <div className="editor-group"><TrackingPreferences profile={draft} onChange={setDraft} /></div>
      <div className="editor-group"><ConditionPreferences profile={draft} onChange={setDraft} /><label className="field"><span>Note organizzative</span><textarea value={draft.conditionNotes} onChange={(event) => update('conditionNotes', event.target.value)} /></label><label className="field"><span>Condizioni o malattie annotate</span><textarea value={draft.medicalNotes} onChange={(event) => update('medicalNotes', event.target.value)} placeholder="Inserisci solo informazioni confermate da te" /></label></div>

      <div className="editor-group"><h3>Libretto e contatti</h3><label className="field"><span>Microchip</span><input value={draft.microchip} onChange={(event) => update('microchip', event.target.value)} /></label><div className="form-grid two-columns"><label className="field"><span>Veterinario</span><input value={draft.vetName} onChange={(event) => update('vetName', event.target.value)} /></label><label className="field"><span>Telefono veterinario</span><input type="tel" value={draft.vetPhone} onChange={(event) => update('vetPhone', event.target.value)} /></label></div><label className="field"><span>Contatto emergenza</span><textarea value={draft.emergencyContact} onChange={(event) => update('emergencyContact', event.target.value)} /></label><div className="form-grid two-columns"><label className="field"><span>Toelettatore</span><input value={draft.groomerName} onChange={(event) => update('groomerName', event.target.value)} /></label><label className="field"><span>Telefono toelettatore</span><input type="tel" value={draft.groomerPhone} onChange={(event) => update('groomerPhone', event.target.value)} /></label></div></div>

      <div className="editor-group"><h3>Alimentazione</h3><div className="form-grid two-columns"><label className="field"><span>Cibo</span><input value={draft.feeding.food} onChange={(event) => update('feeding', { ...draft.feeding, food: event.target.value })} /></label><label className="field"><span>Razione</span><input value={draft.feeding.portion} onChange={(event) => update('feeding', { ...draft.feeding, portion: event.target.value })} /></label></div><label className="field"><span>Orari o frequenza</span><input value={draft.feeding.schedule} onChange={(event) => update('feeding', { ...draft.feeding, schedule: event.target.value })} /></label><label className="field"><span>Note alimentazione</span><textarea value={draft.feeding.notes} onChange={(event) => update('feeding', { ...draft.feeding, notes: event.target.value })} /></label><label className="field"><span>Allergie confermate</span><textarea value={draft.allergies} onChange={(event) => update('allergies', event.target.value)} /></label></div>

      <div className="editor-group"><h3>Promemoria manuali</h3><p className="section-explainer">Le date entrano nello scadenzario solo dopo una tua conferma.</p><label className="field"><span>Controllo annuale</span><input type="date" value={draft.annualCheckDate} onChange={(event) => update('annualCheckDate', event.target.value)} /></label><div className="form-grid two-columns"><label className="field"><span>Rinnovo assicurazione</span><input type="date" value={draft.insuranceRenewalDate} onChange={(event) => update('insuranceRenewalDate', event.target.value)} /></label><label className="field"><span>Verifica dati microchip</span><input type="date" value={draft.microchipRenewalDate} onChange={(event) => update('microchipRenewalDate', event.target.value)} /></label></div></div>

      <div className="editor-group"><h3>Note del proprietario</h3><textarea value={draft.notes} onChange={(event) => update('notes', event.target.value)} /></div>

      <div className="editor-family"><h3>Famiglia</h3>{familyDraft.map((caregiver) => <div className="caregiver-edit-row" key={caregiver.id}><span className="avatar" style={{ background: caregiver.color }}>{caregiver.name[0]}</span><input value={caregiver.name} onChange={(event) => setFamilyDraft((current) => current.map((item) => item.id === caregiver.id ? { ...item, name: event.target.value } : item))} /><input value={caregiver.role} onChange={(event) => setFamilyDraft((current) => current.map((item) => item.id === caregiver.id ? { ...item, role: event.target.value } : item))} /><button className="icon-button" aria-label={`Rimuovi ${caregiver.name}`} onClick={() => setFamilyDraft((current) => current.filter((item) => item.id !== caregiver.id))}><Trash2 size={16} /></button></div>)}<div className="inline-add"><input value={caregiverName} onChange={(event) => setCaregiverName(event.target.value)} placeholder="Nuova persona" /><button className="icon-button filled" onClick={addCaregiver} aria-label="Aggiungi persona"><Plus size={18} /></button></div></div>
    </div>
    <div className="form-actions"><button className="button-secondary" onClick={onClose}>Annulla</button><button className="button-primary" onClick={save}>Salva modifiche</button></div>
  </Modal>
}
