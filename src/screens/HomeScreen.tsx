import { ChevronRight, Share2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeadlineList } from '../components/DeadlineList'
import { HomeOutingSummary } from '../components/HomeOutingSummary'
import { PetAvatar } from '../components/PetAvatar'
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
      <header className="home-hero">
        <PetAvatar className="home-hero-avatar" name={profile.name} photo={profile.photo} species={profile.species} />
        <h1>{profile.name}</h1>
        <p>{ageLabel(profile.birthDate)} · {lifePhaseLabel(profile.lifePhase, profile.species)}</p>
      </header>

      <section id="tutorial-home" className="home-deadlines" aria-labelledby="home-deadlines-title">
        <div className="minimal-section-heading">
          <h2 id="home-deadlines-title">Prossime scadenze</h2>
          <span>{Math.min(deadlines.length, 3)}</span>
        </div>
        <DeadlineList compact deadlines={deadlines} limit={3} onSelect={(deadline) => navigate(`/cura?focus=${deadline.source}`)} />
      </section>

      <HomeOutingSummary />

      <button className="home-pet-card-link" onClick={() => setPetCardOpen(true)}>
        <Share2 size={20} />
        <span>PetCard di {profile.name}</span>
        <ChevronRight size={20} />
      </button>

      {petCardOpen && <PetCardDialog onClose={() => setPetCardOpen(false)} />}
    </div>
  )
}
