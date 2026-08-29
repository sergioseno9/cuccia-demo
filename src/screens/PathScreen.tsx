import { CheckCircle2, ChevronRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { DiscoverPageHeader } from '../components/DiscoverPageHeader'
import { trainingPaths } from '../data/paths'
import { tricks } from '../data/tricks'
import { useAppState } from '../state/AppState'
import type { TrickStatus } from '../types'

const statusLabels: Record<TrickStatus, string> = {
  da_imparare: 'Da imparare',
  in_corso: 'In corso',
  imparato: 'Imparato',
}

export function PathScreen() {
  const { pathId = '' } = useParams()
  const { activePet, profile } = useAppState()
  const path = trainingPaths.find((item) => item.id === pathId)
  if (!activePet || !profile || !path || profile.species !== 'cane') return <Navigate to="/scopri/giochi" replace />
  const pathTricks = path.trickIds.flatMap((trickId) => {
    const trick = tricks.find((item) => item.id === trickId)
    return trick ? [trick] : []
  })
  const completedCount = pathTricks.filter((trick) => activePet.trickProgress[trick.id]?.status === 'imparato').length
  const nextTrick = pathTricks.find((trick) => activePet.trickProgress[trick.id]?.status !== 'imparato')
  const progress = pathTricks.length ? (completedCount / pathTricks.length) * 100 : 0

  return <main className="screen discover-subpage path-page">
    <DiscoverPageHeader backTo="/scopri/giochi" eyebrow="Percorso guidato" title={path.title} />
    <p className="path-description">{path.description}</p>
    <section className="path-overview" aria-label="Avanzamento percorso">
      <div><strong>{completedCount} di {pathTricks.length}</strong><span>trucchi imparati</span></div>
      <div className="path-overview-bar"><span style={{ width: `${progress}%` }} /></div>
    </section>
    <section className="path-sequence" aria-labelledby="path-sequence-title">
      <h2 id="path-sequence-title">La sequenza</h2>
      <div>{pathTricks.map((trick, index) => {
        const status = activePet.trickProgress[trick.id]?.status ?? 'da_imparare'
        return <Link key={trick.id} to={`/scopri/trucco/${trick.id}`}>
          <span className="path-step-number">{index + 1}</span>
          <div><strong>{trick.name}</strong><span className={`path-trick-status path-status-${status}`}>{statusLabels[status]}</span></div>
          {trick.useful && <span className="useful-chip">Utile</span>}
          <ChevronRight size={20} />
        </Link>
      })}</div>
    </section>
    {nextTrick ? <Link className="button-primary path-primary-action" to={`/scopri/trucco/${nextTrick.id}`}>{completedCount ? 'Continua' : 'Inizia'}<ChevronRight size={20} /></Link> : <div className="path-complete"><CheckCircle2 size={24} /><div><strong>Percorso completato</strong><p>Potete ripassare ogni trucco quando ne avete voglia.</p></div></div>}
  </main>
}
