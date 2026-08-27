import { AlertTriangle, BadgeInfo, CalendarDays, Edit3, Phone, RotateCcw, Scissors, Shield, SlidersHorizontal, Stethoscope, Utensils, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { DocumentManager } from '../components/DocumentManager'
import { PetCard } from '../components/PetCard'
import { ageLabel, formatDate } from '../lib/date'
import { conditionLabels, lifePhaseLabels, moduleLabels, trackedModuleIds } from '../lib/profile'
import { useAppState } from '../state/AppState'
import { ProfileEditor } from './ProfileEditor'

const sexLabel = { male: 'Maschio', female: 'Femmina', unknown: 'Non indicato' }
const sizeLabel = { small: 'Piccola', medium: 'Media', large: 'Grande' }

export function ProfileScreen() {
  const { data, resetAll } = useAppState()
  const [editing, setEditing] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const profile = data.profile!
  const visibleModules = trackedModuleIds.filter((module) => profile.trackedModules.includes(module))

  return (
    <div className="screen profile-screen">
      <header className="profile-hero"><div className="dog-avatar profile-avatar">{profile.photo ? <img src={profile.photo} alt={`Foto di ${profile.name}`} /> : <img src="./dog-icon.svg" alt="" />}</div><div><p className="eyebrow">{lifePhaseLabels[profile.lifePhase]}</p><h1>{profile.name}</h1><p>{ageLabel(profile.birthDate)} · {profile.breed || 'Razza non indicata'}</p></div><button className="icon-button light-button" onClick={() => setEditing(true)} aria-label="Modifica profilo"><Edit3 size={19} /></button></header>

      <section className="profile-facts" aria-label="Dati principali"><div><CalendarDays size={18} /><span>Nato il</span><strong>{profile.birthDate ? formatDate(profile.birthDate) : 'Non inserito'}</strong></div><div><BadgeInfo size={18} /><span>Dettagli</span><strong>{sexLabel[profile.sex]} · taglia {sizeLabel[profile.size].toLowerCase()}</strong></div><div><Shield size={18} /><span>Microchip</span><strong>{profile.microchip || 'Non inserito'}</strong></div></section>

      <section className="profile-section contact-section"><div className="section-title-row"><div><p className="eyebrow">Riferimenti</p><h2>Contatti utili</h2></div></div><div className="contact-list"><article><span><Stethoscope size={19} /></span><div><strong>{profile.vetName || 'Veterinario non inserito'}</strong><p>Veterinario di riferimento</p></div>{profile.vetPhone && <a href={`tel:${profile.vetPhone}`} aria-label="Chiama il veterinario"><Phone size={18} /></a>}</article><article><span><AlertTriangle size={19} /></span><div><strong>{profile.emergencyContact || 'Contatto non inserito'}</strong><p>Emergenza</p></div></article><article><span><Scissors size={19} /></span><div><strong>{profile.groomerName || 'Toelettatore non inserito'}</strong><p>Toelettatura/bagno</p></div>{profile.groomerPhone && <a href={`tel:${profile.groomerPhone}`} aria-label="Chiama il toelettatore"><Phone size={18} /></a>}</article></div></section>

      <section className="profile-section feeding-section"><div className="section-title-row"><div><p className="eyebrow">Routine utile</p><h2>Alimentazione</h2></div><Utensils size={21} /></div><div className="feeding-summary"><div><span>Cibo</span><strong>{profile.feeding.food || 'Non inserito'}</strong></div><div><span>Razione</span><strong>{profile.feeding.portion || 'Non inserita'}</strong></div><div><span>Frequenza</span><strong>{profile.feeding.schedule || 'Non inserita'}</strong></div></div>{profile.feeding.notes && <p className="section-explainer">{profile.feeding.notes}</p>}</section>

      <PetCard profile={profile} medications={data.health.medications} />

      <section className="profile-section tracking-summary"><div className="section-title-row"><div><p className="eyebrow">L’app cresce con lui</p><h2>Cosa seguo per {profile.name}</h2></div><SlidersHorizontal size={21} /></div><div className="tracking-summary-phase"><span>Fase scelta</span><strong>{lifePhaseLabels[profile.lifePhase]}</strong></div><div className="tracking-chip-list">{visibleModules.map((module) => <span key={module}>{moduleLabels[module]}</span>)}</div>{profile.conditions.length > 0 && <div className="profile-condition-list"><strong>Condizioni particolari</strong><p>{profile.conditions.map((condition) => conditionLabels[condition]).join(' · ')}</p></div>}{profile.outingIntervalHours && profile.trackedModules.includes('outings') && <p className="profile-interval">Promemoria morbido uscite: circa ogni {profile.outingIntervalHours} h.</p>}<button className="button-secondary" onClick={() => setEditing(true)}>Modifica fase e preferenze</button></section>

      <section className="profile-section"><div className="section-title-row"><div><p className="eyebrow">La squadra</p><h2>Famiglia</h2></div><UsersRound size={21} /></div><div className="family-grid">{profile.caregivers.map((caregiver) => <article key={caregiver.id}><span className="avatar" style={{ background: caregiver.color }}>{caregiver.name[0]}</span><strong>{caregiver.name}</strong><p>{caregiver.role}</p></article>)}</div></section>

      <DocumentManager />

      <section className="reset-section"><div><RotateCcw size={19} /><div><strong>Azzera i dati locali</strong><p>Rimuove profilo, salute e diario solo da questo browser.</p></div></div>{confirmReset ? <div className="reset-actions"><button className="button-secondary" onClick={() => setConfirmReset(false)}>Annulla</button><button className="danger-button" onClick={resetAll}>Conferma azzeramento</button></div> : <button className="text-button danger-text" onClick={() => setConfirmReset(true)}>Azzera</button>}</section>

      {editing && <ProfileEditor onClose={() => setEditing(false)} />}
      <p className="profile-footnote">Dati e documenti restano in questo browser. Nessun caricamento automatico.</p>
    </div>
  )
}
