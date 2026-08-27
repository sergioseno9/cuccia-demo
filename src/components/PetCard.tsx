import { ContactRound, Printer } from 'lucide-react'
import type { DogProfile, MedicationRecord } from '../types'

export function PetCard({ profile, medications }: { profile: DogProfile; medications: MedicationRecord[] }) {
  const activeMedications = medications.filter((record) => record.active)
  const feeding = [profile.feeding.food, profile.feeding.portion, profile.feeding.schedule].filter(Boolean).join(' · ')

  return (
    <section className="pet-card-section print-pet-card" id="pet-card">
      <div className="pet-card-heading"><div><span className="card-logo"><img src="./dog-icon.svg" alt="" /></span><div><p className="eyebrow">Pet Card</p><h2>{profile.name}</h2></div></div><button className="button-secondary print-trigger" onClick={() => window.print()}><Printer size={16} /> Stampa / salva PDF</button></div>
      <div className="pet-card-grid">
        {profile.photo && <div className="pet-card-photo card-wide"><img src={profile.photo} alt={`Foto di ${profile.name}`} /></div>}
        <div><span>Microchip</span><strong>{profile.microchip || '—'}</strong></div>
        <div><span>Veterinario</span><strong>{profile.vetName || '—'}</strong></div>
        <div><span>Telefono veterinario</span><strong>{profile.vetPhone || '—'}</strong></div>
        <div><span>Emergenza</span><strong>{profile.emergencyContact || '—'}</strong></div>
        <div className="card-wide"><span>Farmaci in corso</span><strong>{activeMedications.length ? activeMedications.map((record) => `${record.name} · ${record.dose}`).join(', ') : 'Nessuno inserito'}</strong></div>
        <div className="card-wide"><span>Allergie</span><strong>{profile.allergies || 'Nessuna inserita'}</strong></div>
        <div className="card-wide"><span>Alimentazione</span><strong>{feeding || 'Non inserita'}</strong>{profile.feeding.notes && <small>{profile.feeding.notes}</small>}</div>
        <div className="card-wide"><span>Note del proprietario</span><strong>{profile.notes || 'Nessuna nota inserita'}</strong></div>
      </div>
      <p className="pet-card-note"><ContactRound size={15} /> Funziona offline. Verifica sempre i dati prima di condividerla con sitter, pensione o veterinario.</p>
    </section>
  )
}
