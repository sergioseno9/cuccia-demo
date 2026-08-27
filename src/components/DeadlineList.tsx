import { CalendarClock, Check, Clock3 } from 'lucide-react'
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

export function DeadlineList({ deadlines, limit, onSelect }: { deadlines: Deadline[]; limit?: number; onSelect?: (deadline: Deadline) => void }) {
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
    <div className="deadline-list">
      {visibleDeadlines.map((deadline) => {
        const content = <>
          <span className={`deadline-icon status-${deadline.status}`}>
            {deadline.status === 'overdue' ? <Clock3 size={18} /> : <CalendarClock size={18} />}
          </span>
          <div>
            <strong>{deadline.title}</strong>
            <p>{deadline.detail}</p>
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
