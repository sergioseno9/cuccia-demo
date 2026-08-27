import { useState } from 'react'
import { useAppState } from '../state/AppState'
import type { CareEventType } from '../types'
import { Modal } from './Modal'

interface DailyEntryDialogProps {
  type: Extract<CareEventType, 'medication' | 'note'>
  onClose: () => void
}

export function DailyEntryDialog({ type, onClose }: DailyEntryDialogProps) {
  const { data, addEvent } = useAppState()
  const [detail, setDetail] = useState('')
  const [medicationId, setMedicationId] = useState(data.health.medications[0]?.id ?? '')
  const medication = data.health.medications.find((record) => record.id === medicationId)

  const submit = () => {
    if (type === 'medication') {
      if (!medication) return
      addEvent('medication', {
        medicationId: medication.id,
        note: `${medication.name} · ${medication.dose}`,
      })
    } else {
      if (!detail.trim()) return
      addEvent('note', { note: detail.trim() })
    }
    onClose()
  }

  return (
    <Modal title={type === 'medication' ? 'Conferma il farmaco' : 'Aggiungi una nota'} onClose={onClose}>
      <p className="form-intro">
        {type === 'medication'
          ? 'Seleziona la terapia e conferma tu la somministrazione. Nessun dato sanitario viene salvato automaticamente.'
          : 'Lascia una nota breve solo quando serve alla famiglia.'}
      </p>
      {type === 'medication' ? (
        <label className="field">
          <span>Terapia</span>
          <select value={medicationId} onChange={(event) => setMedicationId(event.target.value)}>
            {data.health.medications.map((record) => (
              <option value={record.id} key={record.id}>{record.name} · {record.dose}</option>
            ))}
          </select>
          {!data.health.medications.length && <small>Aggiungi prima una terapia nella sezione Salute.</small>}
        </label>
      ) : (
        <label className="field">
          <span>Nota</span>
          <textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Es. Ha riposato tranquillo dopo pranzo." autoFocus />
        </label>
      )}
      <div className="form-actions">
        <button className="button-secondary" onClick={onClose}>Annulla</button>
        <button className="button-primary" onClick={submit} disabled={type === 'medication' ? !medication : !detail.trim()}>
          Conferma
        </button>
      </div>
    </Modal>
  )
}
