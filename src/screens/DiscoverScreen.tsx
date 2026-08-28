import { ChevronRight, Lightbulb, Sparkles, Target } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DiscoverLibraryDialog } from '../components/DiscoverLibraryDialog'
import { PersonalityQuiz } from '../components/PersonalityQuiz'
import { TrickDialog } from '../components/TrickDialog'
import { tricks } from '../data/tricks'
import type { Trick } from '../data/tricks'
import { selectTip } from '../data/tips'
import { useAppState } from '../state/AppState'

export function DiscoverScreen() {
  const { activePet, profile } = useAppState()
  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null)
  const [quizOpen, setQuizOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const navigate = useNavigate()
  const tip = useMemo(() => profile ? selectTip(profile.species, profile.lifePhase) : null, [profile])
  if (!activePet || !profile || !tip) return null

  const openRelated = () => {
    if (!tip.relatedId) {
      setLibraryOpen(true)
      return
    }
    const relatedTrick = tricks.find((trick) => trick.id === tip.relatedId)
    if (relatedTrick) setSelectedTrick(relatedTrick)
    else navigate(`/scopri/guida/${tip.relatedId}`)
  }

  return <div className="screen discover-screen">
    <header id="tutorial-discover" className="minimal-screen-header discover-header"><p className="eyebrow">Idee per {profile.name}</p><h1>Scopri</h1></header>
    <div className="discover-feature-list">
      <button className="discover-feature-card quiz-feature" onClick={() => setQuizOpen(true)}><span><Sparkles size={27} /></span><div><strong>Che tipo è {profile.name}?</strong><p>{activePet.quizResult ? 'Rivedi il risultato' : 'Un mini-quiz per ridere insieme'}</p></div><ChevronRight size={22} /></button>
      <button className="discover-feature-card tip-feature" onClick={openRelated}><span><Lightbulb size={27} /></span><div><strong>Consiglio del momento</strong><p>{tip.title}</p></div><ChevronRight size={22} /></button>
      <button className="discover-feature-card games-feature" onClick={() => setLibraryOpen(true)}><span><Target size={27} /></span><div><strong>Giochi &amp; trucchi</strong><p>Guide, esercizi e percorsi gentili</p></div><ChevronRight size={22} /></button>
    </div>

    {selectedTrick && <TrickDialog trick={selectedTrick} onClose={() => setSelectedTrick(null)} />}
    {quizOpen && <PersonalityQuiz key={activePet.id} onClose={() => setQuizOpen(false)} />}
    {libraryOpen && <DiscoverLibraryDialog onClose={() => setLibraryOpen(false)} />}
  </div>
}
