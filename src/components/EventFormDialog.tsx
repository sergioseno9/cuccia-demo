import { Clock3, History, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { actionLabels } from '../data'
import { timeFormatter, todayKey } from '../lib/date'
import { useAppState } from '../state/AppState'
import type { CareEvent, CareEventType } from '../types'
import { Modal } from './Modal'

const localParts = (value: string) => {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` }
}

const nowParts = (minutesAgo = 0) => localParts(new Date(Date.now() - minutesAgo * 60_000).toISOString())

export function EventFormDialog({ type, event, onClose }: { type: CareEventType; event?: CareEvent; onClose: () => void }) {
  const { activePet, caregivers, data, addEvent, deleteEvent, updateEvent } = useAppState()
  const initial = event ? localParts(event.happenedAt) : nowParts()
  const activeMedications = activePet?.health.medications.filter((record) => record.active || record.id === event?.medicationId) ?? []
  const initialMedication = activePet?.health.medications.find((record) => record.id === event?.medicationId)
  const medicationPrefix = initialMedication ? `${initialMedication.name} · ${initialMedication.dose}` : ''
  const initialNote = event?.note?.startsWith(medicationPrefix)
    ? event.note.slice(medicationPrefix.length).replace(/^\s*·\s*/, '')
    : event?.note ?? ''
  const [date, setDate] = useState(initial.date)
  const [time, setTime] = useState(initial.time)
  const [durationMin, setDurationMin] = useState(event?.durationMin?.toString() ?? '')
  const [caregiverId, setCaregiverId] = useState(event?.caregiverId ?? data.selectedCaregiverId)
  const [note, setNote] = useState(initialNote)
  const [medicationId, setMedicationId] = useState(event?.medicationId ?? activeMedications[0]?.id ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const editor = caregivers.find((caregiver) => caregiver.id === event?.editedBy)

  const applyPreset = (minutesAgo: number) => {
    const parts = nowParts(minutesAgo)
    setDate(parts.date)
    setTime(parts.time)
  }

  const save = () => {
    const happenedAt = new Date(`${date}T${time}`).toISOString()
    const medication = activeMedications.find((record) => record.id === medicationId)
    const finalNote = type === 'medication' && medication ? `${medication.name} · ${medication.dose}${note.trim() ? ` · ${note.trim()}` : ''}` : note.trim()
    if (event) {
      updateEvent(event.id, { happenedAt, caregiverId, note: finalNote || undefined, durationMin: type === 'walk' && durationMin ? Number(durationMin) : undefined, medicationId: type === 'medication' ? medicationId : undefined })
    } else {
      addEvent(type, { happenedAt, caregiverId, note: finalNote || undefined, durationMin: type === 'walk' && durationMin ? Number(durationMin) : undefined, ...(type === 'medication' ? { medicationId } : {}) })
    }
    onClose()
  }

  const remove = () => {
    if (!event) return
    deleteEvent(event.id)
    onClose()
  }

  const invalid = !date || !time || !caregiverId || (type === 'note' && !note.trim()) || (type === 'medication' && !medicationId)

  return (
    <Modal title={`${event ? 'Modifica' : 'Registra'} ${actionLabels[type].toLowerCase()}`} onClose={onClose}>
      <div className="event-editor event-form-large">
        <label className="field"><span>Data</span><input type="date" max={todayKey()} value={date} onChange={(input) => setDate(input.target.value)} /></label>
        <div className="preset-group"><span><Clock3 size={18} /> Ora</span><div><button type="button" onClick={() => applyPreset(0)}>Adesso</button><button type="button" onClick={() => applyPreset(15)}>Poco fa</button><button type="button" onClick={() => document.getElementById('event-time')?.focus()}>Scegli</button></div></div>
        <label className="field"><span>Ora</span><input id="event-time" type="time" value={time} onChange={(input) => setTime(input.target.value)} /></label>
        {type === 'walk' && <div className="duration-editor"><span>Durata</span><div className="duration-presets">{[15, 30, 45, 60].map((minutes) => <button type="button" key={minutes} className={durationMin === String(minutes) ? 'is-active' : ''} onClick={() => setDurationMin(String(minutes))}>{minutes} min</button>)}</div><label className="field"><span>Durata personalizzata</span><div className="input-suffix"><input type="number" min="1" max="600" value={durationMin} onChange={(input) => setDurationMin(input.target.value)} /><span>min</span></div></label></div>}
        {type === 'medication' && <label className="field"><span>Terapia</span><select value={medicationId} onChange={(input) => setMedicationId(input.target.value)}>{activeMedications.map((medication) => <option key={medication.id} value={medication.id}>{medication.name} · {medication.dose}</option>)}</select><small>La dose è quella inserita e confermata manualmente nella sezione Cura.</small></label>}
        <label className="field"><span>Chi lo registra</span><select value={caregiverId} onChange={(input) => setCaregiverId(input.target.value)}>{caregivers.map((caregiver) => <option key={caregiver.id} value={caregiver.id}>{caregiver.name}</option>)}</select></label>
        <label className="field"><span>Nota <small>{type === 'note' ? 'necessaria' : 'opzionale'}</small></span><textarea value={note} onChange={(input) => setNote(input.target.value)} placeholder="Aggiungi un dettaglio utile" /></label>
        {event?.editedAt && <p className="audit-note"><History size={16} /> Modificato alle {timeFormatter.format(new Date(event.editedAt))}{editor ? ` da ${editor.name}` : ''}</p>}
      </div>
      <div className="event-editor-actions">{event && (confirmDelete ? <div><button className="button-secondary" onClick={() => setConfirmDelete(false)}>Annulla</button><button className="danger-button" onClick={remove}>Elimina davvero</button></div> : <button className="text-button danger-text" onClick={() => setConfirmDelete(true)}><Trash2 size={18} /> Elimina</button>)}<button className="button-primary" onClick={save} disabled={invalid}>Salva</button></div>
    </Modal>
  )
}
