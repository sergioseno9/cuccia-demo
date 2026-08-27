import { feedCopy } from '../data'
import { timeFormatter } from '../lib/date'
import type { CareEvent, Caregiver } from '../types'

interface ActivityRowProps {
  event: CareEvent
  author: Caregiver
  editor?: Caregiver
  onEdit: () => void
}

export function ActivityRow({ event, author, editor, onEdit }: ActivityRowProps) {
  const detail = event.durationMin
    ? `${event.durationMin} min`
    : event.note

  return (
    <button type="button" className="activity-row activity-row-button" onClick={onEdit} aria-label={`Modifica ${feedCopy[event.type]} delle ${timeFormatter.format(new Date(event.happenedAt))}`}>
      <span className="avatar" style={{ backgroundColor: author.color }} aria-hidden="true">
        {author.name.slice(0, 1).toUpperCase()}
      </span>
      <div className="activity-copy">
        <p><strong>{author.name}</strong> {feedCopy[event.type]} · {timeFormatter.format(new Date(event.happenedAt))}</p>
        {detail && <span>{detail}</span>}
        {event.editedAt && <small>Modificato{editor ? ` da ${editor.name}` : ''}</small>}
      </div>
    </button>
  )
}
