import { AlertCircle, Check, ChevronRight, HeartPulse, Pill, Plus, Scale, Shield, ShieldCheck, Stethoscope, Syringe } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeadlineList } from '../components/DeadlineList'
import { addDays, formatDate, timeFormatter } from '../lib/date'
import { buildDeadlines } from '../lib/deadlines'
import { conditionLabels } from '../lib/profile'
import { useAppState } from '../state/AppState'
import type { PreventionRecord, WeightRecord } from '../types'
import { HealthRecordDialog } from './HealthRecordDialog'
import type { HealthRecordType } from './HealthRecordDialog'

function SectionTitle({ icon: Icon, title, onAdd }: { icon: typeof Syringe; title: string; onAdd?: () => void }) {
  return <div className="health-section-title"><div><span><Icon size={18} /></span><h2>{title}</h2></div>{onAdd && <button className="icon-button" onClick={onAdd} aria-label={`Aggiungi in ${title}`}><Plus size={18} /></button>}</div>
}

function PreventionSection({ title, explanation, records, onAdd }: { title: string; explanation: string; records: PreventionRecord[]; onAdd: () => void }) {
  return <section className="health-section prevention-section"><SectionTitle icon={ShieldCheck} title={title} onAdd={onAdd} /><p className="section-explainer">{explanation}</p>{records.length ? <div className="prevention-grid">{records.map((record) => <article key={record.id}><span>{record.kind}</span><h3>{record.product}</h3><p>Ultima · {formatDate(record.lastDate)}</p><strong>Prossima · {formatDate(addDays(record.lastDate, record.intervalDays))}</strong></article>)}</div> : <div className="empty-inline">Nessun dato inserito. Aggiungilo solo quando vuoi seguire questa scadenza.</div>}</section>
}

function WeightChart({ records }: { records: WeightRecord[] }) {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date)).slice(-6)
  if (sorted.length < 2) return <div className="empty-inline">Aggiungi almeno due pesi per vedere l’andamento.</div>
  const values = sorted.map((item) => item.value)
  const min = Math.min(...values) - 0.3
  const max = Math.max(...values) + 0.3
  const points = sorted.map((item, index) => {
    const x = (index / (sorted.length - 1)) * 100
    const y = 54 - ((item.value - min) / Math.max(0.1, max - min)) * 46
    return `${x},${y}`
  }).join(' ')
  const [lastX, lastY] = points.split(' ').at(-1)?.split(',') ?? ['100', '30']
  return <svg className="weight-chart" viewBox="0 0 100 60" preserveAspectRatio="none" role="img" aria-label="Andamento del peso"><line x1="0" y1="54" x2="100" y2="54" /><polyline points={points} /><circle cx={lastX} cy={lastY} r="2.5" /></svg>
}

export function HealthScreen() {
  const { data, addEvent } = useAppState()
  const [dialog, setDialog] = useState<HealthRecordType | null>(null)
  const navigate = useNavigate()
  const profile = data.profile!
  const deadlines = useMemo(() => buildDeadlines(data), [data])
  const weights = [...data.health.weights].sort((a, b) => b.date.localeCompare(a.date))
  const visits = [...data.health.visits].sort((a, b) => b.date.localeCompare(a.date))
  const deworming = data.health.preventions.filter((record) => /svermin/i.test(record.kind))
  const antiparasitics = data.health.preventions.filter((record) => !/svermin/i.test(record.kind))

  return (
    <div className="screen health-screen">
      <header className="screen-header health-header"><p className="eyebrow">Libretto sanitario digitale di {profile.name}</p><h1>Salute</h1><p>Scadenze, terapie e storico in un posto affidabile. Ogni dato è inserito e confermato da te.</p></header>

      <section className="health-deadlines" aria-labelledby="health-deadlines-title"><div className="section-title-row"><div><p className="eyebrow">Scadenzario</p><h2 id="health-deadlines-title">Prossime scadenze</h2></div><span className="count-pill">{deadlines.length}</span></div><DeadlineList deadlines={deadlines} /></section>

      <div className="manual-banner"><ShieldCheck size={21} /><div><strong>Controllo sempre nelle tue mani</strong><p>Niente OCR e niente salvataggi automatici: le informazioni sanitarie entrano solo dopo una tua conferma.</p></div></div>

      <section className="health-section"><SectionTitle icon={Syringe} title="Vaccinazioni" onAdd={() => setDialog('vaccination')} />{data.health.vaccinations.length ? <div className="record-list">{data.health.vaccinations.map((record) => <article className="record-row" key={record.id}><div className="record-marker"><Check size={16} /></div><div><strong>{record.name}</strong><p>Somministrato {formatDate(record.administeredDate)}</p>{record.notes && <small>{record.notes}</small>}</div><span>Prossimo<br/><strong>{record.nextDate ? formatDate(record.nextDate) : 'da definire'}</strong></span></article>)}</div> : <div className="empty-inline">Nessuna vaccinazione inserita.</div>}</section>

      <PreventionSection title="Antiparassitari (pulci e zecche)" explanation="Prodotto, ultima somministrazione e prossima data calcolata dalla cadenza che inserisci." records={antiparasitics} onAdd={() => setDialog('prevention')} />
      <PreventionSection title="Sverminazione" explanation="Tieni qui prodotto e cadenza indicata dal veterinario, senza suggerimenti automatici." records={deworming} onAdd={() => setDialog('deworming')} />

      <section className="health-section medication-section"><SectionTitle icon={Pill} title="Farmaci e terapie" onAdd={() => setDialog('medication')} />{data.health.medications.length ? <div className="therapy-list">{data.health.medications.map((record) => {
        const doses = data.events.filter((event) => !event.deletedAt && event.type === 'medication' && event.medicationId === record.id).slice(0, 3)
        return <article className="therapy-card" key={record.id}><div className="therapy-main"><div><span className="badge badge-sage">{record.active ? 'In corso' : 'Conclusa'}</span><h3>{record.name}</h3><p>{record.dose} · {record.times.join(' / ') || 'orario libero'}</p></div><button className="button-primary small-button" onClick={() => addEvent('medication', { medicationId: record.id, note: `${record.name} · ${record.dose}` })}>Somministrato</button></div><div className="dose-history"><strong>Ultime dosi</strong>{doses.length ? doses.map((dose) => { const author = profile.caregivers.find((caregiver) => caregiver.id === dose.caregiverId); return <span key={dose.id}>{author?.name ?? 'Caregiver'} · {timeFormatter.format(new Date(dose.happenedAt))}</span> }) : <span>Ancora nessuna dose registrata.</span>}</div></article>
      })}</div> : <div className="empty-inline">Nessuna terapia in corso.</div>}</section>

      <section className="health-section"><SectionTitle icon={Stethoscope} title="Visite veterinarie" onAdd={() => setDialog('visit')} />{visits.length ? <div className="visit-list">{visits.map((record) => <article key={record.id}><span className="date-tile"><strong>{new Date(`${record.date}T12:00:00`).getDate()}</strong>{new Intl.DateTimeFormat('it-IT', { month: 'short' }).format(new Date(`${record.date}T12:00:00`))}</span><div><h3>{record.title}</h3><p>{record.notes || 'Nessuna nota'}</p></div></article>)}</div> : <div className="empty-inline">Nessuna visita registrata.</div>}</section>

      <section className="health-section weight-section"><SectionTitle icon={Scale} title="Peso" onAdd={() => setDialog('weight')} /><div className="weight-layout"><div className="weight-current"><span>Attuale</span><strong>{(weights[0]?.value ?? profile.weight) || '—'} <small>kg</small></strong><p>{weights[0] ? formatDate(weights[0].date) : 'Dal profilo'}</p></div><WeightChart records={weights} /></div></section>

      <section className="health-section microchip-section"><SectionTitle icon={Shield} title="Microchip" /><div className="microchip-card"><div><span>Numero registrato</span><strong>{profile.microchip || 'Non inserito'}</strong>{profile.microchipRenewalDate && <p>Verifica dati · {formatDate(profile.microchipRenewalDate)}</p>}</div><button className="text-link" onClick={() => navigate('/profilo')}>Modifica nel Profilo <ChevronRight size={16} /></button></div></section>

      <section className="health-section conditions-section"><div className="health-section-title"><div><span><HeartPulse size={18} /></span><h2>Allergie e condizioni</h2></div></div><div className="condition-row"><AlertCircle size={20} /><div><strong>Allergie</strong><p>{profile.allergies || 'Nessuna allergia inserita'}</p></div></div><div className="condition-row"><HeartPulse size={20} /><div><strong>Condizioni particolari</strong><p>{profile.conditions.length ? profile.conditions.map((condition) => conditionLabels[condition]).join(' · ') : 'Nessuna condizione attiva'}</p>{profile.conditionNotes && <p>{profile.conditionNotes}</p>}</div></div></section>

      {dialog && <HealthRecordDialog type={dialog} onClose={() => setDialog(null)} />}
    </div>
  )
}
