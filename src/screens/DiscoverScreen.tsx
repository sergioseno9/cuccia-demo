import { BookOpen, ChevronRight, Sparkles, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppState'

export function DiscoverScreen() {
  const { activePet, profile } = useAppState()
  const navigate = useNavigate()
  if (!activePet || !profile) return null

  return <div className="screen discover-screen">
    <header className="minimal-screen-header discover-header"><p className="eyebrow">Idee per {profile.name}</p><h1>Scopri</h1></header>
    <div id="tutorial-discover" className="discover-feature-list">
      <button className="discover-feature-card quiz-feature" onClick={() => navigate('/scopri/quiz')}><span><Sparkles size={27} /></span><div><strong>Che tipo è {profile.name}?</strong><p>{activePet.quizResult ? 'Rivedi il risultato' : 'Un mini-quiz per ridere insieme'}</p></div><ChevronRight size={22} /></button>
      <button className="discover-feature-card guides-feature" onClick={() => navigate('/scopri/guide')}><span><BookOpen size={27} /></span><div><strong>Guide</strong><p>Cura quotidiana e strumenti da leggere con calma</p></div><ChevronRight size={22} /></button>
      <button className="discover-feature-card games-feature" onClick={() => navigate('/scopri/giochi')}><span><Target size={27} /></span><div><strong>Giochi &amp; trucchi</strong><p>Solo esercizi e percorsi gentili</p></div><ChevronRight size={22} /></button>
    </div>
  </div>
}
