import { ContactRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeadlineList } from '../components/DeadlineList'
import { PetCardDialog } from '../components/PetCardDialog'
import { ageLabel } from '../lib/date'
import { buildDeadlines } from '../lib/deadlines'
import { lifePhaseLabels } from '../lib/profile'
import { useAppState } from '../state/AppState'

export function HomeScreen() {
  const { data } = useAppState()
  const [petCardOpen, setPetCardOpen] = useState(false)
  const navigate = useNavigate()
  const profile = data.profile!
  const deadlines = useMemo(() => buildDeadlines(data), [data])

  return (
    <div className="screen home-screen">
      <header className="today-header"><div className="dog-identity"><div className="dog-avatar">{profile.photo ? <img src={profile.photo} alt={`Foto di ${profile.name}`} /> : <img src="./dog-icon.svg" alt="" />}</div><div><p className="eyebrow">Tutto ciò che conta per</p><h1>{profile.name}</h1><span>{ageLabel(profile.birthDate)} · {lifePhaseLabels[profile.lifePhase]}</span></div></div></header>

      <section id="tutorial-home" className="focus-section home-deadlines" aria-labelledby="home-deadlines-title"><div className="section-title-row"><div><p className="eyebrow">Scadenzario</p><h2 id="home-deadlines-title">Prossime scadenze</h2></div></div><DeadlineList deadlines={deadlines} limit={5} onSelect={(deadline) => navigate(`/cura?focus=${deadline.source}`)} /></section>

      <section className="home-pet-card"><div className="home-pet-card-mark"><img src="./dog-icon.svg" alt="" /></div><div><p className="eyebrow">PetCard</p><h2>La sua scheda, pronta da condividere</h2><p>Microchip, contatti, farmaci, allergie e alimentazione. Funziona anche offline.</p></div><button className="button-primary" onClick={() => setPetCardOpen(true)}><ContactRound size={20} /> Apri PetCard</button></section>

      {petCardOpen && <PetCardDialog onClose={() => setPetCardOpen(false)} />}
    </div>
  )
}
