import { AlertTriangle, BadgeInfo, CalendarDays, Phone, Scissors, Shield, Stethoscope, UsersRound, Utensils } from 'lucide-react'
import { formatDate } from '../lib/date'
import { useAppState } from '../state/AppState'
import { Modal } from './Modal'
import { ProfileSettingsPanel } from './ProfileSettingsPanel'

export type ProfileSection = 'feeding' | 'contacts' | 'family' | 'settings'

const titles: Record<ProfileSection, string> = {
  feeding: 'Alimentazione',
  contacts: 'Contatti utili',
  family: 'Famiglia',
  settings: 'Impostazioni',
}

const sexLabel = { male: 'Maschio', female: 'Femmina', unknown: 'Non indicato' }
const sizeLabel = { small: 'Piccola', medium: 'Media', large: 'Grande' }

export function ProfileDetailDialog({ section, focus, onClose, onEdit }: { section: ProfileSection; focus?: string | null; onClose: () => void; onEdit: () => void }) {
  const { activePet, caregivers, profile } = useAppState()
  if (!activePet || !profile) return null

  return <Modal title={titles[section]} onClose={onClose}><div className="profile-detail-scroll">
    {section === 'feeding' && <section className="profile-section feeding-section"><div className="section-title-row"><div><p className="eyebrow">Routine utile</p><h2>Alimentazione</h2></div><Utensils size={21} /></div><div className="feeding-summary"><div><span>Cibo</span><strong>{profile.feeding.food || 'Non inserito'}</strong></div><div><span>Razione</span><strong>{profile.feeding.portion || 'Non inserita'}</strong></div><div><span>Frequenza</span><strong>{profile.feeding.schedule || 'Non inserita'}</strong></div></div>{profile.feeding.notes && <p className="section-explainer">{profile.feeding.notes}</p>}<button className="button-secondary" onClick={onEdit}>Modifica alimentazione</button></section>}

    {section === 'contacts' && <><section className="profile-facts" aria-label="Dati principali"><div><CalendarDays size={18} /><span>Nato il</span><strong>{profile.birthDate ? formatDate(profile.birthDate) : 'Non inserito'}</strong></div><div><BadgeInfo size={18} /><span>Dettagli</span><strong>{sexLabel[profile.sex]} · taglia {sizeLabel[profile.size].toLowerCase()}</strong></div><div><Shield size={18} /><span>Microchip</span><strong>{profile.microchip || 'Non inserito'}</strong></div></section><section className="profile-section contact-section"><div className="contact-list"><article><span><Stethoscope size={19} /></span><div><strong>{profile.vetName || 'Veterinario non inserito'}</strong><p>Veterinario di riferimento</p></div>{profile.vetPhone && <a href={`tel:${profile.vetPhone}`} aria-label="Chiama il veterinario"><Phone size={18} /></a>}</article><article><span><AlertTriangle size={19} /></span><div><strong>{profile.emergencyContact || 'Contatto non inserito'}</strong><p>Emergenza</p></div></article><article><span><Scissors size={19} /></span><div><strong>{profile.groomerName || 'Toelettatore non inserito'}</strong><p>Toelettatura/bagno</p></div>{profile.groomerPhone && <a href={`tel:${profile.groomerPhone}`} aria-label="Chiama il toelettatore"><Phone size={18} /></a>}</article></div><button className="button-secondary" onClick={onEdit}>Modifica dati e contatti</button></section></>}

    {section === 'family' && <section className="profile-section"><div className="section-title-row"><div><p className="eyebrow">La squadra</p><h2>Famiglia</h2></div><UsersRound size={21} /></div><div className="family-grid">{caregivers.map((caregiver) => <article key={caregiver.id}><span className="avatar" style={{ background: caregiver.color }}>{caregiver.name[0]}</span><strong>{caregiver.name}</strong><p>{caregiver.role}</p></article>)}</div><button className="button-secondary" onClick={onEdit}>Modifica famiglia</button></section>}

    {section === 'settings' && <ProfileSettingsPanel focus={focus} onEdit={onEdit} />}
  </div></Modal>
}
