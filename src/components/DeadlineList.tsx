import { CalendarDays, Check, FileCheck2, Pill, ShieldCheck, Stethoscope, Syringe } from 'lucide-react'
import { formatDate, timeFormatter, todayKey } from '../lib/date'
import type { Deadline } from '../types'

const whenLabel = (deadline: Deadline) => {
  const due = new Date(deadline.dueDate.length === 10 ? `${deadline.dueDate}T12:00:00` : deadline.dueDate)
  const today = new Date(`${todayKey()}T12:00:00`)
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000)
  const time = deadline.dueDate.includes('T') ? ` · ${timeFormatter.format(due)}` : ''
  if (days < 0) return `Scaduto · ${formatDate(deadline.dueDate)}`
  if (days === 0) return `Oggi${time}`
  if (days === 1) return `Domani${time}`
  if (days <= 7) return `Tra ${days} giorni${time}`
  return formatDate(deadline.dueDate)
}

const deadlineIcon = (source: Deadline['source']) => {
  if (source === 'vaccination') return <Syringe size={21} />
  if (source === 'prevention' || source === 'deworming') return <ShieldCheck size={21} />
  if (source === 'medication') return <Pill size={21} />
  if (source === 'visit') return <Stethoscope size={21} />
  if (source === 'profile') return <FileCheck2 size={21} />
  return <CalendarDays size={21} />
}

export function DeadlineList({ compact = false, deadlines, limit, onSelect }: { compact?: boolean; deadlines: Deadline[]; limit?: number; onSelect?: (deadline: Deadline) => void }) {
  const visibleDeadlines = limit ? deadlines.slice(0, limit) : deadlines

  if (!visibleDeadlines.length) {
    return (
      <div className="empty-state compact-empty">
        <Check size={19} aria-hidden="true" />
        <p>Nessuna scadenza inserita. Aggiungila quando ti è utile.</p>
      </div>
    )
  }

  return (
    <div className={`deadline-list ${compact ? 'is-compact' : ''}`}>
      {visibleDeadlines.map((deadline) => {
        const content = <>
          <span className={`deadline-icon deadline-source-${deadline.source}`}>{deadlineIcon(deadline.source)}</span>
          <div>
            <strong>{deadline.title}</strong>
            {!compact && <p>{deadline.detail}</p>}
          </div>
          <span className={`deadline-when status-text-${deadline.status}`}>{whenLabel(deadline)}</span>
        </>
        return onSelect
          ? <button type="button" className="deadline-row deadline-button" key={deadline.id} onClick={() => onSelect(deadline)}>{content}</button>
          : <article className="deadline-row" key={deadline.id}>{content}</article>
      })}
    </div>
  )
}
