import { ArrowLeft, BookOpen, ChevronRight, Clock3, Wrench } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { guides } from '../data/guides'
import { useAppState } from '../state/AppState'

const categories = [
  { id: 'cucciolo', label: 'Cucciolo', description: 'Guide calme per i primi mesi insieme.', icon: BookOpen },
  { id: 'strumenti', label: 'Strumenti', description: 'Checklist pratiche da usare quando servono.', icon: Wrench },
] as const

export function GuideHubScreen() {
  const navigate = useNavigate()
  const { data } = useAppState()
  const lifePhase = data.profile!.lifePhase
  const visibleGuides = guides.filter((guide) => guide.fase === lifePhase || guide.fase === 'tutte')

  return (
    <div className="screen guide-hub-screen">
      <header className="guide-hub-header">
        <button className="icon-button" onClick={() => navigate('/')} aria-label="Torna a Oggi"><ArrowLeft size={19} /></button>
        <div><p className="eyebrow">Mini-guide statiche</p><h1>Guida</h1><p>Risposte semplici, metodi gentili e nessun giudizio.</p></div>
      </header>

      {visibleGuides.length === 0 && <div className="empty-state guide-empty"><BookOpen size={22} /><div><strong>Guide in preparazione per questa fase</strong><p>La home resta pulita: qui compariranno solo contenuti davvero pertinenti.</p></div></div>}

      {categories.map(({ id, label, description, icon: Icon }) => visibleGuides.some((guide) => guide.category === id) && (
        <section key={id} className="guide-category" aria-labelledby={`guide-${id}`}>
          <div className="guide-category-heading"><span><Icon size={20} /></span><div><h2 id={`guide-${id}`}>{label}</h2><p>{description}</p></div></div>
          <div className="guide-card-list">
            {visibleGuides.filter((guide) => guide.category === id).map((guide) => (
              <Link key={guide.id} to={`/guida/${guide.id}`} className="guide-list-card">
                <div><h3>{guide.title}</h3><span className="guide-reading-time"><Clock3 size={13} />{guide.readingMinutes} min</span><div className="guide-trigger-list">{guide.triggers.map((trigger) => <span key={trigger}>{trigger}</span>)}</div></div>
                <ChevronRight size={18} />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
