import { AlertTriangle, BadgeInfo, CalendarDays, CircleHelp, Phone, RotateCcw, Scissors, Shield, SlidersHorizontal, Stethoscope, Trash2, UsersRound, Utensils } from 'lucide-react'
import { useState } from 'react'
import { formatDate } from '../lib/date'
import { conditionLabels, lifePhaseLabel, moduleLabels, trackedModuleIds } from '../lib/profile'
import { useAppState } from '../state/AppState'
import { BackupManager } from './BackupManager'
import { CloudAccountPanel } from './CloudAccountPanel'
import { DocumentManager } from './DocumentManager'
import { Modal } from './Modal'

export type ProfileSection = 'feeding' | 'contacts' | 'family' | 'settings'

const titles: Record<ProfileSection, string> = {
  feeding: 'Alimentazione',
  contacts: 'Contatti utili',
  family: 'Famiglia',
  settings: 'Impostazioni',
}

const sexLabel = { male: 'Maschio', female: 'Femmina', unknown: 'Non indicato' }
const sizeLabel = { small: 'Piccola', medium: 'Media', large: 'Grande' }

export function ProfileDetailDialog({ section, onClose, onEdit }: { section: ProfileSection; onClose: () => void; onEdit: () => void }) {
  const { activePet, caregivers, data, profile, removePet, resetAll, restartTutorial } = useAppState()
  const [confirmReset, setConfirmReset] = useState(false)
  if (!activePet || !profile) return null
  const visibleModules = trackedModuleIds(profile.species).filter((module) => profile.trackedModules.includes(module))

  return <Modal title={titles[section]} onClose={onClose}><div className="profile-detail-scroll">
    {section === 'settings' && <CloudAccountPanel />}
    {section === 'feeding' && <section className="profile-section feeding-section"><div className="section-title-row"><div><p className="eyebrow">Routine utile</p><h2>Alimentazione</h2></div><Utensils size={21} /></div><div className="feeding-summary"><div><span>Cibo</span><strong>{profile.feeding.food || 'Non inserito'}</strong></div><div><span>Razione</span><strong>{profile.feeding.portion || 'Non inserita'}</strong></div><div><span>Frequenza</span><strong>{profile.feeding.schedule || 'Non inserita'}</strong></div></div>{profile.feeding.notes && <p className="section-explainer">{profile.feeding.notes}</p>}<button className="button-secondary" onClick={onEdit}>Modifica alimentazione</button></section>}

    {section === 'contacts' && <><section className="profile-facts" aria-label="Dati principali"><div><CalendarDays size={18} /><span>Nato il</span><strong>{profile.birthDate ? formatDate(profile.birthDate) : 'Non inserito'}</strong></div><div><BadgeInfo size={18} /><span>Dettagli</span><strong>{sexLabel[profile.sex]} · taglia {sizeLabel[profile.size].toLowerCase()}</strong></div><div><Shield size={18} /><span>Microchip</span><strong>{profile.microchip || 'Non inserito'}</strong></div></section><section className="profile-section contact-section"><div className="contact-list"><article><span><Stethoscope size={19} /></span><div><strong>{profile.vetName || 'Veterinario non inserito'}</strong><p>Veterinario di riferimento</p></div>{profile.vetPhone && <a href={`tel:${profile.vetPhone}`} aria-label="Chiama il veterinario"><Phone size={18} /></a>}</article><article><span><AlertTriangle size={19} /></span><div><strong>{profile.emergencyContact || 'Contatto non inserito'}</strong><p>Emergenza</p></div></article><article><span><Scissors size={19} /></span><div><strong>{profile.groomerName || 'Toelettatore non inserito'}</strong><p>Toelettatura/bagno</p></div>{profile.groomerPhone && <a href={`tel:${profile.groomerPhone}`} aria-label="Chiama il toelettatore"><Phone size={18} /></a>}</article></div><button className="button-secondary" onClick={onEdit}>Modifica dati e contatti</button></section></>}

    {section === 'family' && <section className="profile-section"><div className="section-title-row"><div><p className="eyebrow">La squadra</p><h2>Famiglia</h2></div><UsersRound size={21} /></div><div className="family-grid">{caregivers.map((caregiver) => <article key={caregiver.id}><span className="avatar" style={{ background: caregiver.color }}>{caregiver.name[0]}</span><strong>{caregiver.name}</strong><p>{caregiver.role}</p></article>)}</div><button className="button-secondary" onClick={onEdit}>Modifica famiglia</button></section>}

    {section === 'settings' && <><section className="profile-section tracking-summary"><div className="section-title-row"><div><p className="eyebrow">Personalizzazione</p><h2>Cosa seguo per {profile.name}</h2></div><SlidersHorizontal size={21} /></div><div className="tracking-summary-phase"><span>Fase scelta</span><strong>{lifePhaseLabel(profile.lifePhase, profile.species)}</strong></div><div className="tracking-chip-list">{visibleModules.map((module) => <span key={module}>{moduleLabels[module]}</span>)}</div>{profile.conditions.length > 0 && <div className="profile-condition-list"><strong>Condizioni organizzative</strong><p>{profile.conditions.map((condition) => conditionLabels[condition]).join(' · ')}</p></div>}{profile.outingIntervalHours && profile.trackedModules.includes('outings') && <p className="profile-interval">Promemoria morbido uscite: circa ogni {profile.outingIntervalHours} h.</p>}<button className="button-secondary" onClick={onEdit}>Modifica fase e preferenze</button></section><DocumentManager /><BackupManager /><section className="profile-section tutorial-replay-section"><div><CircleHelp size={23} /><div><strong>Come funziona Cuccia</strong><p>Rivedi i passaggi iniziali quando vuoi.</p></div></div><button className="button-secondary" onClick={restartTutorial}>Rivedi tutorial</button></section><section className="profile-section pet-removal-section"><h2>Schede animali</h2>{data.pets.map((pet) => <div key={pet.id}><span>{pet.profile.name}</span>{data.pets.length > 1 && <button className="text-button danger-text" onClick={() => window.confirm(`Rimuovere la scheda di ${pet.profile.name}?`) && removePet(pet.id)}><Trash2 size={16} /> Rimuovi</button>}</div>)}</section><section className="reset-section"><div><RotateCcw size={19} /><div><strong>Azzera i dati locali</strong><p>Rimuove tutte le schede, Cura e Diario da questo browser.</p></div></div>{confirmReset ? <div className="reset-actions"><button className="button-secondary" onClick={() => setConfirmReset(false)}>Annulla</button><button className="danger-button" onClick={resetAll}>Conferma azzeramento</button></div> : <button className="text-button danger-text" onClick={() => setConfirmReset(true)}>Azzera</button>}</section><p className="profile-footnote">Dati e documenti restano in questo browser. Usa solo contenuti demo o non sensibili.</p></>}
  </div></Modal>
}
