import { NotebookPen, Pill, ScanLine, Siren, Stethoscope, TriangleAlert, Utensils } from 'lucide-react'
import { ageLabel } from '../lib/date'
import type { MedicationRecord, PetProfile } from '../types'
import { PetAvatar } from './PetAvatar'

const splitContact = (value: string) => {
  const parts = value.split(/\s*[·\n]\s*/).filter(Boolean)
  return { name: parts[0] || 'Non inserito', detail: parts.slice(1).join(' · ') }
}

const formatMicrochip = (value: string) => value
  ? value.replace(/\s+/g, '').replace(/(.{3})(?=.)/g, '$1 ')
  : 'Non inserito'

export function PetCard({ profile, medications }: { profile: PetProfile; medications: MedicationRecord[] }) {
  const activeMedications = medications.filter((record) => record.active)
  const feeding = [profile.feeding.food, profile.feeding.portion, profile.feeding.schedule, profile.feeding.notes].filter(Boolean).join(' · ')
  const emergency = splitContact(profile.emergencyContact)
  const species = profile.species === 'cane' ? 'Cane' : 'Gatto'
  const medicationValue = activeMedications.length
    ? activeMedications.map((record) => `${record.name} · ${record.dose}`).join(', ')
    : 'Nessun farmaco inserito'

  return (
    <section className="pet-card-section print-pet-card" id="pet-card">
      <header className="pet-card-identity">
        <PetAvatar className="pet-card-avatar" name={profile.name} photo={profile.photo} species={profile.species} />
        <div><h2>{profile.name}</h2><p>{species} · {ageLabel(profile.birthDate)} · {profile.breed || 'Razza non inserita'}</p></div>
        <img className="pet-card-brand" src={`${import.meta.env.BASE_URL}dog-mark.svg`} alt="" />
      </header>
      <div className="pet-card-content">
        <section className="pet-card-microchip"><ScanLine size={30} /><div><span>Microchip</span><strong>{formatMicrochip(profile.microchip)}</strong></div></section>
        <div className="pet-card-contact-grid">
          <article><Stethoscope size={22} /><span>Veterinario</span><strong>{profile.vetName || 'Non inserito'}</strong><p>{profile.vetPhone || 'Telefono non inserito'}</p></article>
          <article><Siren size={22} /><span>Emergenza</span><strong>{emergency.name}</strong><p>{emergency.detail || 'Contatto non inserito'}</p></article>
        </div>
        <div className="pet-card-info-list">
          <div><span className="pet-card-info-icon tone-blue"><Pill size={22} /></span><div><span>Farmaci in corso</span><strong>{medicationValue}</strong></div></div>
          <div><span className="pet-card-info-icon tone-honey"><TriangleAlert size={22} /></span><div><span>Allergie</span><strong>{profile.allergies || 'Nessuna inserita'}</strong></div></div>
          <div><span className="pet-card-info-icon tone-sage"><Utensils size={22} /></span><div><span>Alimentazione</span><strong>{feeding || 'Non inserita'}</strong></div></div>
          {profile.notes && <div><span className="pet-card-info-icon tone-neutral"><NotebookPen size={22} /></span><div><span>Note utili</span><strong>{profile.notes}</strong></div></div>}
        </div>
      </div>
      <footer><img src={`${import.meta.env.BASE_URL}dog-icon.svg`} alt="" /><span>cuccia · scheda del {profile.species}</span></footer>
    </section>
  )
}
