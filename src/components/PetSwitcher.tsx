import { Cat, Dog, Plus } from 'lucide-react'
import { useState } from 'react'
import { createEmptyProfile, lifePhaseLabel, modulePresets, suggestLifePhase } from '../lib/profile'
import { useAppState } from '../state/AppState'
import type { LifePhase, PetSpecies } from '../types'
import { Modal } from './Modal'
import { PetAvatar } from './PetAvatar'

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

function AddPetDialog({ onClose }: { onClose: () => void }) {
  const { addPet } = useAppState()
  const [species, setSpecies] = useState<PetSpecies>('cane')
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [lifePhase, setLifePhase] = useState<LifePhase>('adulto')

  const changeBirthDate = (value: string) => {
    setBirthDate(value)
    if (value) setLifePhase(suggestLifePhase(value))
  }

  const submit = () => {
    if (!name.trim()) return
    const id = createId()
    addPet({
      ...createEmptyProfile(species, id),
      name: name.trim(),
      birthDate,
      lifePhase,
      trackedModules: modulePresets(species, lifePhase),
    })
    onClose()
  }

  return <Modal title="Aggiungi un animale" onClose={onClose}>
    <p className="form-intro">Crea una scheda separata. Potrai completare tutti i dati dal Profilo.</p>
    <div className="species-choice compact-choice">
      <button className={species === 'cane' ? 'is-selected' : ''} onClick={() => setSpecies('cane')}><Dog size={25} /><span>Cane</span></button>
      <button className={species === 'gatto' ? 'is-selected' : ''} onClick={() => setSpecies('gatto')}><Cat size={25} /><span>Gatto</span></button>
    </div>
    <div className="form-stack">
      <label className="field"><span>Nome</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label className="field"><span>Data di nascita <small>opzionale</small></span><input type="date" value={birthDate} onChange={(event) => changeBirthDate(event.target.value)} /></label>
      <label className="field"><span>Fase di vita</span><select value={lifePhase} onChange={(event) => setLifePhase(event.target.value as LifePhase)}><option value="cucciolo">{lifePhaseLabel('cucciolo', species)}</option><option value="adulto">Adulto</option><option value="senior">Senior</option></select></label>
    </div>
    <div className="form-actions"><button className="button-secondary" onClick={onClose}>Annulla</button><button className="button-primary" onClick={submit} disabled={!name.trim()}>Aggiungi</button></div>
  </Modal>
}

export function PetSwitcher() {
  const { data, selectPet } = useAppState()
  const [adding, setAdding] = useState(false)
  return <>
    <div className="pet-switcher" aria-label="Scegli animale">
      <div className="pet-switcher-list">{data.pets.map((pet) => <button key={pet.id} className={pet.id === data.selectedPetId ? 'is-selected' : ''} onClick={() => selectPet(pet.id)} aria-label={`Apri la scheda di ${pet.profile.name}`} aria-pressed={pet.id === data.selectedPetId}>
        <PetAvatar className="pet-switcher-avatar" name={pet.profile.name} photo={pet.profile.photo} species={pet.profile.species} />
        <span className="pet-switcher-name">{pet.profile.name}</span>
      </button>)}</div>
      <button className="pet-switcher-add" onClick={() => setAdding(true)} aria-label="Aggiungi un animale"><Plus size={22} /><span>Aggiungi</span></button>
    </div>
    {adding && <AddPetDialog onClose={() => setAdding(false)} />}
  </>
}
