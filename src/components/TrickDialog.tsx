import { Award, Share2 } from 'lucide-react'
import { formatDate } from '../lib/date'
import { shareTrickBadge } from '../lib/shareBadge'
import { useAppState } from '../state/AppState'
import type { Trick } from '../data/tricks'
import type { TrickStatus } from '../types'
import { Modal } from './Modal'

const statusLabels: Record<TrickStatus, string> = {
  da_imparare: 'Da imparare',
  in_corso: 'In corso',
  imparato: 'Imparato',
}

export function TrickDialog({ trick, onClose }: { trick: Trick; onClose: () => void }) {
  const { activePet, profile, setTrickStatus } = useAppState()
  if (!activePet || !profile) return null
  const progress = activePet.trickProgress[trick.id] ?? { status: 'da_imparare' as const }

  return (
    <Modal title={trick.name} onClose={onClose}>
      <div className="trick-dialog-scroll">
        <div className="trick-meta"><span>{trick.level}</span><span>{trick.timePerDay} al giorno</span>{trick.useful && <span>Utile ogni giorno</span>}</div>
        <p className="trick-goal">{trick.goal}</p>
        <section><h3>Perché può essere utile</h3><p>{trick.why}</p></section>
        <section><h3>Passi gentili</h3><ol>{trick.steps.map((step) => <li key={step}>{step}</li>)}</ol></section>
        <section className="trick-fallback"><h3>Se non funziona</h3><p>{trick.ifNotWorking}</p></section>
        <section className="trick-status"><h3>Il vostro progresso</h3><div>{(Object.keys(statusLabels) as TrickStatus[]).map((status) => <button key={status} className={progress.status === status ? 'is-active' : ''} onClick={() => setTrickStatus(trick.id, trick.name, status)}>{statusLabels[status]}</button>)}</div>{progress.learnedAt && <p><Award size={18} /> Badge ottenuto il {formatDate(progress.learnedAt)}</p>}</section>
        {progress.status === 'imparato' && <button className="button-primary share-badge-button" onClick={() => shareTrickBadge(profile.name, trick.name)}><Share2 size={20} /> Condividi come immagine</button>}
      </div>
    </Modal>
  )
}
