import { FilePlus2, X } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../components/Modal'
import { todayKey } from '../lib/date'
import { useAppState } from '../state/AppState'
import type { PetDocument } from '../types'

export type HealthRecordType = 'vaccination' | 'prevention' | 'deworming' | 'medication' | 'visit' | 'weight' | 'grooming'

const titles: Record<HealthRecordType, string> = {
  vaccination: 'Aggiungi vaccinazione',
  prevention: 'Aggiungi antiparassitario',
  deworming: 'Aggiungi sverminazione',
  medication: 'Aggiungi terapia',
  visit: 'Aggiungi visita',
  weight: 'Registra il peso',
  grooming: 'Aggiungi toelettatura o bagno',
}

const monthOptions = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export function HealthRecordDialog({ type, onClose }: { type: HealthRecordType; onClose: () => void }) {
  const { addGrooming, addMedication, addPrevention, addVaccination, addVisit, addWeight } = useAppState()
  const [name, setName] = useState('')
  const [secondary, setSecondary] = useState('')
  const [date, setDate] = useState(todayKey())
  const [nextDate, setNextDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [lotNumber, setLotNumber] = useState('')
  const [interval, setInterval] = useState(type === 'grooming' ? '0' : '30')
  const [times, setTimes] = useState('08:00, 20:00')
  const [seasonalPause, setSeasonalPause] = useState(false)
  const [pauseStartMonth, setPauseStartMonth] = useState('11')
  const [pauseEndMonth, setPauseEndMonth] = useState('2')
  const [documents, setDocuments] = useState<PetDocument[]>([])
  const [fileError, setFileError] = useState('')

  const addFiles = async (files: FileList | null) => {
    if (!files) return
    const accepted = [...files].filter((file) => file.size <= 1_200_000)
    if (accepted.length !== files.length) setFileError('Alcuni file superano 1,2 MB e non sono stati aggiunti.')
    const added = await Promise.all(accepted.map((file) => new Promise<PetDocument>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve({
        id: createId(),
        name: file.name,
        kind: 'esame',
        dataUrl: String(reader.result ?? ''),
        addedAt: new Date().toISOString(),
      })
      reader.readAsDataURL(file)
    })))
    setDocuments((current) => [...current, ...added])
  }

  const submit = () => {
    if (!name.trim()) return
    if (type === 'vaccination') addVaccination({ name, administeredDate: date, nextDate, lotNumber, expiryDate, notes: secondary, documents })
    if (type === 'prevention' || type === 'deworming') addPrevention({
      kind: type === 'deworming' ? 'Sverminazione' : 'Antiparassitari (pulci e zecche)',
      product: name,
      lastDate: date,
      intervalDays: Number(interval) || 30,
      seasonalPause,
      ...(seasonalPause ? { pauseStartMonth: Number(pauseStartMonth), pauseEndMonth: Number(pauseEndMonth) } : {}),
      documents,
    })
    if (type === 'medication') addMedication({ name, dose: secondary, times: times.split(',').map((value) => value.trim()).filter(Boolean), startDate: date, endDate: nextDate, active: true, documents })
    if (type === 'visit') addVisit({ title: name, date, notes: secondary, documents })
    if (type === 'weight') addWeight({ value: Number(name), date, documents })
    if (type === 'grooming') addGrooming({ title: name, lastDate: date, intervalWeeks: Number(interval) || 0, notes: secondary, documents })
    onClose()
  }

  const isPrevention = type === 'prevention' || type === 'deworming'
  const dateLabel = type === 'visit' ? 'Data appuntamento' : isPrevention ? 'Ultima somministrazione' : type === 'weight' ? 'Data misurazione' : type === 'medication' ? 'Inizio terapia' : type === 'grooming' ? 'Ultima volta' : 'Data somministrazione'

  return <Modal title={titles[type]} onClose={onClose}>
    <p className="form-intro">Inserisci e conferma tu ogni dato. Cuccia non interpreta documenti e non salva informazioni sanitarie automaticamente.</p>
    <div className="form-stack health-record-form">
      <label className="field"><span>{type === 'weight' ? 'Peso in kg' : isPrevention ? 'Prodotto' : type === 'visit' ? 'Motivo' : type === 'grooming' ? 'Cosa è stato fatto' : 'Nome'}</span><input type={type === 'weight' ? 'number' : 'text'} step={type === 'weight' ? '0.1' : undefined} value={name} onChange={(event) => setName(event.target.value)} autoFocus /></label>
      {type !== 'weight' && !isPrevention && <label className="field"><span>{type === 'medication' ? 'Dose' : 'Note'}</span><input value={secondary} onChange={(event) => setSecondary(event.target.value)} /></label>}
      <label className="field"><span>{dateLabel}</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      {type === 'vaccination' && <><div className="form-grid two-columns"><label className="field"><span>Lotto</span><input value={lotNumber} onChange={(event) => setLotNumber(event.target.value)} /></label><label className="field"><span>Scadenza prodotto</span><input type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} /></label></div><label className="field"><span>Prossimo richiamo</span><input type="date" value={nextDate} onChange={(event) => setNextDate(event.target.value)} /></label></>}
      {isPrevention && <><label className="field"><span>Cadenza indicata</span><select value={interval} onChange={(event) => setInterval(event.target.value)}><option value="30">Ogni 30 giorni</option><option value="60">Ogni 60 giorni</option><option value="90">Ogni 90 giorni</option><option value="180">Ogni 6 mesi</option><option value="365">Ogni anno</option></select><small>Usa solo la cadenza indicata dal veterinario o dal prodotto.</small></label><label className="check-field"><input type="checkbox" checked={seasonalPause} onChange={(event) => setSeasonalPause(event.target.checked)} /><span>Pausa stagionale</span></label>{seasonalPause && <div className="form-grid two-columns"><label className="field"><span>Da</span><select value={pauseStartMonth} onChange={(event) => setPauseStartMonth(event.target.value)}>{monthOptions.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select></label><label className="field"><span>A</span><select value={pauseEndMonth} onChange={(event) => setPauseEndMonth(event.target.value)}>{monthOptions.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select></label></div>}</>}
      {type === 'medication' && <><label className="field"><span>Fine terapia</span><input type="date" value={nextDate} onChange={(event) => setNextDate(event.target.value)} /></label><label className="field"><span>Orari, separati da virgola</span><input value={times} onChange={(event) => setTimes(event.target.value)} /></label></>}
      {type === 'grooming' && <label className="field"><span>Promemoria morbido <small>opzionale</small></span><select value={interval} onChange={(event) => setInterval(event.target.value)}><option value="0">Nessun promemoria</option><option value="2">Ogni ~2 settimane</option><option value="4">Ogni ~4 settimane</option><option value="6">Ogni ~6 settimane</option><option value="8">Ogni ~8 settimane</option></select></label>}
      <div className="record-documents"><strong>Documenti <small>opzionali</small></strong><label className="button-secondary"><FilePlus2 size={18} /> Allega foto o file<input type="file" multiple accept="image/*,.pdf" onChange={(event) => void addFiles(event.target.files)} /></label>{fileError && <p className="field-error">{fileError}</p>}{documents.map((document) => <span key={document.id}>{document.name}<button onClick={() => setDocuments((current) => current.filter((item) => item.id !== document.id))} aria-label={`Rimuovi ${document.name}`}><X size={15} /></button></span>)}</div>
    </div>
    <div className="form-actions"><button className="button-secondary" onClick={onClose}>Annulla</button><button className="button-primary" onClick={submit} disabled={!name.trim()}>Salva manualmente</button></div>
  </Modal>
}
