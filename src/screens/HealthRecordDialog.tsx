import { useState } from 'react'
import { todayKey } from '../lib/date'
import { useAppState } from '../state/AppState'
import { Modal } from '../components/Modal'

export type HealthRecordType = 'vaccination' | 'prevention' | 'deworming' | 'medication' | 'visit' | 'weight'

const titles: Record<HealthRecordType, string> = {
  vaccination: 'Aggiungi vaccinazione',
  prevention: 'Aggiungi antiparassitario',
  deworming: 'Aggiungi sverminazione',
  medication: 'Aggiungi terapia',
  visit: 'Aggiungi visita',
  weight: 'Registra il peso',
}

export function HealthRecordDialog({ type, onClose }: { type: HealthRecordType; onClose: () => void }) {
  const { addMedication, addPrevention, addVaccination, addVisit, addWeight } = useAppState()
  const [name, setName] = useState('')
  const [secondary, setSecondary] = useState('')
  const [date, setDate] = useState(todayKey())
  const [nextDate, setNextDate] = useState('')
  const [interval, setInterval] = useState('30')
  const [times, setTimes] = useState('08:00, 20:00')

  const submit = () => {
    if (!name.trim()) return
    if (type === 'vaccination') addVaccination({ name, administeredDate: date, nextDate, notes: secondary })
    if (type === 'prevention' || type === 'deworming') addPrevention({ kind: type === 'deworming' ? 'Sverminazione' : 'Antiparassitari (pulci e zecche)', product: name, lastDate: date, intervalDays: Number(interval) || 30 })
    if (type === 'medication') addMedication({ name, dose: secondary, times: times.split(',').map((value) => value.trim()).filter(Boolean), startDate: date, endDate: nextDate, active: true })
    if (type === 'visit') addVisit({ title: name, date, notes: secondary })
    if (type === 'weight') addWeight({ value: Number(name), date })
    onClose()
  }

  return (
    <Modal title={titles[type]} onClose={onClose}>
      <p className="form-intro">Inserisci e conferma tu ogni dato. Cuccia non interpreta documenti e non salva informazioni sanitarie automaticamente.</p>
      <div className="form-stack">
        <label className="field"><span>{type === 'weight' ? 'Peso in kg' : type === 'prevention' || type === 'deworming' ? 'Prodotto' : type === 'visit' ? 'Motivo' : 'Nome'}</span><input type={type === 'weight' ? 'number' : 'text'} step={type === 'weight' ? '0.1' : undefined} value={name} onChange={(event) => setName(event.target.value)} placeholder={type === 'weight' ? '7,4' : ''} autoFocus /></label>
        {type !== 'weight' && type !== 'prevention' && type !== 'deworming' && <label className="field"><span>{type === 'medication' ? 'Dose' : 'Note'}</span><input value={secondary} onChange={(event) => setSecondary(event.target.value)} /></label>}
        <label className="field"><span>{type === 'visit' ? 'Data appuntamento' : type === 'prevention' || type === 'deworming' ? 'Ultima somministrazione' : type === 'weight' ? 'Data misurazione' : type === 'medication' ? 'Inizio terapia' : 'Data somministrazione'}</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        {(type === 'prevention' || type === 'deworming') && <label className="field"><span>Cadenza indicata</span><select value={interval} onChange={(event) => setInterval(event.target.value)}><option value="30">Ogni 30 giorni</option><option value="60">Ogni 60 giorni</option><option value="90">Ogni 90 giorni</option><option value="180">Ogni 6 mesi</option><option value="365">Ogni anno</option></select><small>Antiparassitari: proteggono da pulci e zecche. Inserisci solo la cadenza che ti è stata indicata.</small></label>}
        {(type === 'vaccination' || type === 'medication') && <label className="field"><span>{type === 'vaccination' ? 'Prossima scadenza' : 'Fine terapia'}</span><input type="date" value={nextDate} onChange={(event) => setNextDate(event.target.value)} /></label>}
        {type === 'medication' && <label className="field"><span>Orari, separati da virgola</span><input value={times} onChange={(event) => setTimes(event.target.value)} /></label>}
      </div>
      <div className="form-actions"><button className="button-secondary" onClick={onClose}>Annulla</button><button className="button-primary" onClick={submit} disabled={!name.trim()}>Salva manualmente</button></div>
    </Modal>
  )
}
