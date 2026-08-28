import { Cat, ContactRound, Dog } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeadlineList } from '../components/DeadlineList'
import { PetCardDialog } from '../components/PetCardDialog'
import { ageLabel } from '../lib/date'
import { buildInAppDeadlines } from '../lib/reminders'
import { lifePhaseLabel } from '../lib/profile'
import { useAppState } from '../state/AppState'

export function HomeScreen() {
  const { activePet, profile } = useAppState()
  const [petCardOpen, setPetCardOpen] = useState(false)
  const navigate = useNavigate()
  const deadlines = useMemo(() => activePet ? buildInAppDeadlines(activePet) : [], [activePet])
  if (!profile) return null

  return (
    <div className="screen home-screen">
      <header className="today-header"><div className="dog-identity"><div className="dog-avatar">{profile.photo ? <img src={profile.photo} alt={`Foto di ${profile.name}`} /> : profile.species === 'gatto' ? <Cat size={28} /> : <Dog size={28} />}</div><div><p className="eyebrow">Tutto ciò che conta per</p><h1>{profile.name}</h1><span>{ageLabel(profile.birthDate)} · {lifePhaseLabel(profile.lifePhase, profile.species)}</span></div></div></header>

      <section id="tutorial-home" className="focus-section home-deadlines" aria-labelledby="home-deadlines-title"><div className="section-title-row"><div><p className="eyebrow">Scadenzario</p><h2 id="home-deadlines-title">Prossime scadenze</h2></div></div><DeadlineList deadlines={deadlines} limit={5} onSelect={(deadline) => navigate(`/cura?focus=${deadline.source}`)} /></section>

      <section className="home-pet-card"><div className="home-pet-card-mark"><img src="./dog-icon.svg" alt="" /></div><div><p className="eyebrow">PetCard</p><h2>La sua scheda, pronta da condividere</h2><p>Microchip, contatti, farmaci, allergie e alimentazione. Funziona anche offline.</p></div><button className="button-primary" onClick={() => setPetCardOpen(true)}><ContactRound size={20} /> Apri PetCard</button></section>

      {petCardOpen && <PetCardDialog onClose={() => setPetCardOpen(false)} />}
    </div>
  )
}
