import { Award, Share2 } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { DiscoverPageHeader } from '../components/DiscoverPageHeader'
import { tricks } from '../data/tricks'
import { formatDate } from '../lib/date'
import { shareTrickBadge } from '../lib/shareBadge'
import { useAppState } from '../state/AppState'
import type { TrickStatus } from '../types'

const statusLabels: Record<TrickStatus, string> = {
  da_imparare: 'Da imparare',
  in_corso: 'In corso',
  imparato: 'Imparato',
}

export function TrickScreen() {
  const { id = '' } = useParams()
  const { activePet, profile, setTrickStatus } = useAppState()
  const trick = tricks.find((item) => item.id === id)
  if (!activePet || !profile || !trick || profile.species !== 'cane') return <Navigate to="/scopri" replace />
  const progress = activePet.trickProgress[trick.id] ?? { status: 'da_imparare' as const }

  return <main className="screen discover-subpage trick-page">
    <DiscoverPageHeader eyebrow={`${trick.level} · ${trick.timePerDay} al giorno`} title={trick.name} />
    <div className="trick-page-content">
      <div className="trick-meta">{trick.useful && <span>Utile ogni giorno</span>}</div>
      <p className="trick-goal">{trick.goal}</p>
      <section><h2>Perché può essere utile</h2><p>{trick.why}</p></section>
      <section><h2>Passi gentili</h2><ol>{trick.steps.map((step) => <li key={step}>{step}</li>)}</ol></section>
      <section className="trick-fallback"><h2>Se non funziona</h2><p>{trick.ifNotWorking}</p></section>
      <section className="trick-status"><h2>Il vostro progresso</h2><div>{(Object.keys(statusLabels) as TrickStatus[]).map((status) => <button key={status} className={progress.status === status ? 'is-active' : ''} onClick={() => setTrickStatus(trick.id, trick.name, status)}>{statusLabels[status]}</button>)}</div>{progress.learnedAt && <p><Award size={18} /> Badge ottenuto il {formatDate(progress.learnedAt)}</p>}</section>
      {progress.status === 'imparato' && <button className="button-primary share-badge-button" onClick={() => shareTrickBadge(profile.name, trick.name)}><Share2 size={20} /> Condividi come immagine</button>}
    </div>
  </main>
}
