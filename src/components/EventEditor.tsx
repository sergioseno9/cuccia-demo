import { Clock3, History, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { actionLabels } from '../data'
import { timeFormatter } from '../lib/date'
import { useAppState } from '../state/AppState'
import type { CareEvent } from '../types'
import { Modal } from './Modal'

const toInputValue = (value: string) => {
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

const presetTime = (minutesAgo: number) => {
  const date = new Date(Date.now() - minutesAgo * 60_000)
  return toInputValue(date.toISOString())
}

export function EventEditor({ event, onClose }: { event: CareEvent; onClose: () => void }) {
  const { data, deleteEvent, updateEvent } = useAppState()
  const [happenedAt, setHappenedAt] = useState(toInputValue(event.happenedAt))
  const [durationMin, setDurationMin] = useState(event.durationMin?.toString() ?? '')
  const [caregiverId, setCaregiverId] = useState(event.caregiverId)
  const [note, setNote] = useState(event.note ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const editor = data.profile!.caregivers.find((caregiver) => caregiver.id === event.editedBy)

  const save = () => {
    updateEvent(event.id, {
      happenedAt: new Date(happenedAt).toISOString(),
      caregiverId,
      note: note.trim() || undefined,
      durationMin: event.type === 'walk' && durationMin ? Number(durationMin) : undefined,
    })
    onClose()
  }

  const remove = () => {
    deleteEvent(event.id)
    onClose()
  }

  return (
    <Modal title={`Modifica ${actionLabels[event.type].toLowerCase()}`} onClose={onClose}>
      <div className="event-editor">
        <div className="preset-group"><span><Clock3 size={15} /> Ora</span><div><button type="button" onClick={() => setHappenedAt(presetTime(0))}>Adesso</button><button type="button" onClick={() => setHappenedAt(presetTime(15))}>Poco fa</button><button type="button" onClick={() => document.getElementById('event-time')?.focus()}>Scegli</button></div></div>
        <label className="field"><span>Data e ora</span><input id="event-time" type="datetime-local" value={happenedAt} onChange={(input) => setHappenedAt(input.target.value)} /></label>

        {event.type === 'walk' && <div className="duration-editor"><span>Durata</span><div className="duration-presets">{[15, 30, 45, 60].map((minutes) => <button type="button" key={minutes} className={durationMin === String(minutes) ? 'is-active' : ''} onClick={() => setDurationMin(String(minutes))}>{minutes} min</button>)}</div><label className="field"><span>Personalizzata</span><div className="input-suffix"><input type="number" min="1" max="600" value={durationMin} onChange={(input) => setDurationMin(input.target.value)} /><span>min</span></div></label></div>}

        <label className="field"><span>Caregiver</span><select value={caregiverId} onChange={(input) => setCaregiverId(input.target.value)}>{data.profile!.caregivers.map((caregiver) => <option key={caregiver.id} value={caregiver.id}>{caregiver.name}</option>)}</select></label>
        <label className="field"><span>Nota <small>opzionale</small></span><textarea value={note} onChange={(input) => setNote(input.target.value)} placeholder="Aggiungi un dettaglio utile" /></label>

        {event.editedAt && <p className="audit-note"><History size={14} /> Modificato {timeFormatter.format(new Date(event.editedAt))}{editor ? ` da ${editor.name}` : ''}</p>}
      </div>
      <div className="event-editor-actions">{confirmDelete ? <div><button className="button-secondary" onClick={() => setConfirmDelete(false)}>Annulla</button><button className="danger-button" onClick={remove}>Elimina davvero</button></div> : <button className="text-button danger-text" onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Elimina</button>}<button className="button-primary" onClick={save}>Salva modifiche</button></div>
    </Modal>
  )
}
