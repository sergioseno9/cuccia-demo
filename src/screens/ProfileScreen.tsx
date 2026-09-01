import { ChevronRight, Cloud, Edit3, Phone, Settings, UsersRound, Utensils } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PetAvatar } from '../components/PetAvatar'
import { ProfileDetailDialog } from '../components/ProfileDetailDialog'
import type { ProfileSection } from '../components/ProfileDetailDialog'
import { useEntryMode } from '../entry/EntryContext'
import { ageLabel } from '../lib/date'
import { lifePhaseLabel } from '../lib/profile'
import { useAppState } from '../state/AppState'

export function ProfileScreen() {
  const { activePet, data, profile, selectPet } = useAppState()
  const { guestMode, requestAccount } = useEntryMode()
  const [section, setSection] = useState<ProfileSection | null>(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const requestedSection = searchParams.get('section')
  const focus = searchParams.get('focus')
  useEffect(() => {
    if (requestedSection === 'feeding' || requestedSection === 'contacts' || requestedSection === 'family' || requestedSection === 'settings') {
      setSection(requestedSection)
    }
  }, [requestedSection])
  if (!activePet || !profile) return null
  const menuItems = [
    { id: 'feeding' as const, label: 'Alimentazione', icon: Utensils, tone: 'clay' },
    { id: 'contacts' as const, label: 'Contatti utili', icon: Phone, tone: 'blue' },
    { id: 'family' as const, label: 'Famiglia', icon: UsersRound, tone: 'sage' },
    { id: 'settings' as const, label: 'Impostazioni', icon: Settings, tone: 'neutral' },
  ]

  return <div className="screen profile-screen">
    <header className="minimal-screen-header profile-title"><p className="eyebrow">Profilo</p></header>
    <section className="profile-identity-card"><PetAvatar className="profile-avatar" name={profile.name} photo={profile.photo} species={profile.species} /><div><h1>{profile.name}</h1><p>{ageLabel(profile.birthDate)} · {profile.breed || profile.species} · {lifePhaseLabel(profile.lifePhase, profile.species)}</p></div><button className="icon-button light-button" onClick={() => navigate('/profilo/modifica?section=identity')} aria-label="Modifica profilo"><Edit3 size={20} /></button></section>
    {guestMode && <section className="guest-account-nudge"><Cloud size={22} /><div><strong>Salva e condividi</strong><p>Crea un account quando vuoi. Prima prepariamo un backup dei dati locali.</p></div><button className="text-button" onClick={requestAccount}>Crea account</button></section>}
    <section className="profile-minimal-section"><h2>Animali in famiglia</h2><div className="profile-pet-list">{data.pets.map((pet) => <button className={pet.id === activePet.id ? 'is-active' : ''} key={pet.id} onClick={() => selectPet(pet.id)}><PetAvatar name={pet.profile.name} photo={pet.profile.photo} species={pet.profile.species} /><strong>{pet.profile.name}</strong><span>{pet.profile.species} · {lifePhaseLabel(pet.profile.lifePhase, pet.profile.species)}</span></button>)}</div></section>
    <section className="profile-minimal-section"><h2>Gestisci</h2><div className="profile-menu">{menuItems.map(({ icon: Icon, ...item }) => <button key={item.id} onClick={() => setSection(item.id)}><Icon className={`tone-${item.tone}`} size={23} /><strong>{item.label}</strong><ChevronRight size={21} /></button>)}</div></section>
    {section && <ProfileDetailDialog section={section} focus={focus} onClose={() => { setSection(null); navigate('/profilo', { replace: true }) }} onEdit={(target) => { setSection(null); navigate(`/profilo/modifica?section=${target}`) }} />}
  </div>
}
