import { AlertCircle, Check, ChevronRight, ExternalLink, FileText, HeartPulse, Pill, Plus, Scale, Scissors, Shield, ShieldCheck, Stethoscope, Syringe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DeadlineList } from '../components/DeadlineList'
import { formatDate, timeFormatter } from '../lib/date'
import { nextPreventionDate } from '../lib/deadlines'
import { buildInAppDeadlines } from '../lib/reminders'
import { conditionLabels } from '../lib/profile'
import { useAppState } from '../state/AppState'
import type { PetDocument, PreventionRecord, WeightRecord } from '../types'
import { HealthRecordDialog } from './HealthRecordDialog'
import type { HealthRecordType } from './HealthRecordDialog'

function SectionTitle({ icon: Icon, title, onAdd, tutorialId }: { icon: LucideIcon; title: string; onAdd?: () => void; tutorialId?: string }) {
  return <div className="health-section-title"><div><span><Icon size={21} /></span><h2>{title}</h2></div>{onAdd && <button id={tutorialId} className="button-secondary care-add-button" onClick={onAdd}><Plus size={19} /> Aggiungi</button>}</div>
}

function RecordDocuments({ documents }: { documents: PetDocument[] }) {
  if (!documents.length) return null
  return <div className="care-document-links">{documents.map((document) => <a key={document.id} href={document.dataUrl} target="_blank" rel="noreferrer"><FileText size={15} />{document.name}<ExternalLink size={14} /></a>)}</div>
}

function PreventionSection({ id, title, explanation, records, onAdd }: { id: string; title: string; explanation: string; records: PreventionRecord[]; onAdd: () => void }) {
  return <section id={id} className="health-section prevention-section"><SectionTitle icon={ShieldCheck} title={title} onAdd={onAdd} /><p className="section-explainer">{explanation}</p>{records.length ? <div className="prevention-grid">{records.map((record) => <article key={record.id}><span>{record.kind}</span><h3>{record.product}</h3><p>Ultima · {formatDate(record.lastDate)}</p><strong>Prossima · {formatDate(nextPreventionDate(record))}</strong>{record.seasonalPause && <small>Pausa stagionale attiva</small>}<RecordDocuments documents={record.documents} /></article>)}</div> : <div className="empty-inline">Nessun dato inserito. Aggiungilo solo quando vuoi seguire questa voce.</div>}</section>
}

function WeightChart({ records }: { records: WeightRecord[] }) {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date)).slice(-6)
  if (sorted.length < 2) return <div className="empty-inline">Aggiungi almeno due pesi per vedere l’andamento.</div>
  const values = sorted.map((item) => item.value)
  const min = Math.min(...values) - 0.3
  const max = Math.max(...values) + 0.3
  const points = sorted.map((item, index) => `${(index / (sorted.length - 1)) * 100},${54 - ((item.value - min) / Math.max(0.1, max - min)) * 46}`).join(' ')
  const [lastX, lastY] = points.split(' ').at(-1)?.split(',') ?? ['100', '30']
  return <svg className="weight-chart" viewBox="0 0 100 60" preserveAspectRatio="none" role="img" aria-label="Andamento del peso"><line x1="0" y1="54" x2="100" y2="54" /><polyline points={points} /><circle cx={lastX} cy={lastY} r="2.5" /></svg>
}

export function CareScreen() {
  const { activePet, caregivers, profile } = useAppState()
  const [dialog, setDialog] = useState<HealthRecordType | null>(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const deadlines = useMemo(() => activePet ? buildInAppDeadlines(activePet) : [], [activePet])
  const weights = [...(activePet?.health.weights ?? [])].sort((a, b) => b.date.localeCompare(a.date))
  const visits = [...(activePet?.health.visits ?? [])].sort((a, b) => b.date.localeCompare(a.date))
  const grooming = [...(activePet?.health.grooming ?? [])].sort((a, b) => b.lastDate.localeCompare(a.lastDate))
  const deworming = activePet?.health.preventions.filter((record) => /svermin/i.test(record.kind)) ?? []
  const antiparasitics = activePet?.health.preventions.filter((record) => !/svermin/i.test(record.kind)) ?? []

  useEffect(() => {
    const focus = searchParams.get('focus')
    if (!focus) return
    window.setTimeout(() => document.getElementById(focus)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
  }, [searchParams])

  if (!activePet || !profile) return null

  return (
    <div className="screen health-screen care-screen">
      <header className="screen-header health-header"><p className="eyebrow">Libretto e abitudini di {profile.name}</p><h1>Cura</h1><p>Salute, scadenze e igiene in un posto ordinato. Ogni dato viene inserito e confermato da te.</p></header>

      <section className="health-deadlines" aria-labelledby="care-deadlines-title"><div className="section-title-row"><div><p className="eyebrow">Scadenzario</p><h2 id="care-deadlines-title">Prossime scadenze</h2></div><span className="count-pill">{deadlines.length}</span></div><DeadlineList deadlines={deadlines} onSelect={(deadline) => document.getElementById(deadline.source)?.scrollIntoView({ behavior: 'smooth' })} /></section>
      <div className="manual-banner"><ShieldCheck size={24} /><div><strong>Controllo sempre nelle tue mani</strong><p>Niente lettura automatica: i dati sanitari entrano solo dopo una tua conferma.</p></div></div>

      <section id="vaccination" className="health-section"><SectionTitle icon={Syringe} title="Vaccinazioni" tutorialId="tutorial-care-add" onAdd={() => setDialog('vaccination')} />{activePet.health.vaccinations.length ? <div className="record-list">{activePet.health.vaccinations.map((record) => <article className="record-row" key={record.id}><div className="record-marker"><Check size={18} /></div><div><strong>{record.name}</strong><p>Somministrato {formatDate(record.administeredDate)}</p>{record.lotNumber && <small>Lotto · {record.lotNumber}</small>}{record.expiryDate && <small>Scadenza prodotto · {formatDate(record.expiryDate)}</small>}{record.notes && <small>{record.notes}</small>}<RecordDocuments documents={record.documents} /></div><span>Prossimo<br/><strong>{record.nextDate ? formatDate(record.nextDate) : 'da definire'}</strong></span></article>)}</div> : <div className="empty-inline">Nessuna vaccinazione inserita.</div>}</section>
      <PreventionSection id="prevention" title="Antiparassitari (pulci e zecche)" explanation="Inserisci prodotto, ultima somministrazione e cadenza indicata." records={antiparasitics} onAdd={() => setDialog('prevention')} />
      <PreventionSection id="deworming" title="Sverminazione" explanation="Prodotto e cadenza restano quelli confermati da te." records={deworming} onAdd={() => setDialog('deworming')} />

      <section id="medication" className="health-section medication-section"><SectionTitle icon={Pill} title="Farmaci e terapie" onAdd={() => setDialog('medication')} />{activePet.health.medications.length ? <div className="therapy-list">{activePet.health.medications.map((record) => { const doses = activePet.events.filter((event) => !event.deletedAt && event.type === 'medication' && event.medicationId === record.id).slice(0, 3); return <article className="therapy-card" key={record.id}><div className="therapy-main"><div><span className="badge badge-sage">{record.active ? 'In corso' : 'Conclusa'}</span><h3>{record.name}</h3><p>{record.dose} · {record.times.join(' / ') || 'orario libero'}</p><RecordDocuments documents={record.documents} /></div></div><div className="dose-history"><strong>Ultime dosi registrate nel Diario</strong>{doses.length ? doses.map((dose) => { const author = caregivers.find((caregiver) => caregiver.id === dose.caregiverId); return <span key={dose.id}>{author?.name ?? 'Famiglia'} · {timeFormatter.format(new Date(dose.happenedAt))}</span> }) : <span>Ancora nessuna dose registrata.</span>}</div></article> })}</div> : <div className="empty-inline">Nessuna terapia inserita.</div>}</section>

      <section id="visit" className="health-section"><SectionTitle icon={Stethoscope} title="Visite veterinarie" onAdd={() => setDialog('visit')} />{visits.length ? <div className="visit-list">{visits.map((record) => <article key={record.id}><span className="date-tile"><strong>{new Date(`${record.date}T12:00:00`).getDate()}</strong>{new Intl.DateTimeFormat('it-IT', { month: 'short' }).format(new Date(`${record.date}T12:00:00`))}</span><div><h3>{record.title}</h3><p>{record.notes || 'Nessuna nota'}</p><RecordDocuments documents={record.documents} /></div></article>)}</div> : <div className="empty-inline">Nessuna visita registrata.</div>}</section>
      <section className="health-section weight-section"><SectionTitle icon={Scale} title="Peso" onAdd={() => setDialog('weight')} /><div className="weight-layout"><div className="weight-current"><span>Attuale</span><strong>{(weights[0]?.value ?? profile.weight) || '—'} <small>kg</small></strong><p>{weights[0] ? formatDate(weights[0].date) : 'Dal profilo'}</p></div><WeightChart records={weights} /></div>{weights[0] && <RecordDocuments documents={weights[0].documents} />}</section>

      <section className="health-section grooming-section"><SectionTitle icon={Scissors} title="Igiene e abitudini" onAdd={() => setDialog('grooming')} />{grooming[0] ? <article className="grooming-card"><div><span>Toelettatura / bagno</span><strong>{grooming[0].title}</strong><p>Ultima volta · {formatDate(grooming[0].lastDate)}</p>{grooming[0].intervalWeeks > 0 && <small>Di solito ogni ~{grooming[0].intervalWeeks} settimane. È un promemoria morbido, non una scadenza.</small>}{grooming[0].notes && <small>{grooming[0].notes}</small>}<RecordDocuments documents={grooming[0].documents} /></div></article> : <div className="empty-inline">Ancora nessuna abitudine di toelettatura inserita.</div>}</section>

      <section id="profile" className="health-section microchip-section"><SectionTitle icon={Shield} title="Microchip" onAdd={() => navigate('/profilo')} /><div className="microchip-card"><div><span>Numero registrato</span><strong>{profile.microchip || 'Non inserito'}</strong>{profile.microchipRenewalDate && <p>Verifica dati · {formatDate(profile.microchipRenewalDate)}</p>}</div><button className="text-link" onClick={() => navigate('/profilo')}>Apri Profilo <ChevronRight size={18} /></button></div></section>
      <section className="health-section conditions-section"><SectionTitle icon={HeartPulse} title="Allergie e condizioni" onAdd={() => navigate('/profilo')} /><div className="condition-row"><AlertCircle size={22} /><div><strong>Allergie</strong><p>{profile.allergies || 'Nessuna allergia inserita'}</p></div></div><div className="condition-row"><HeartPulse size={22} /><div><strong>Condizioni organizzative</strong><p>{profile.conditions.length ? profile.conditions.map((condition) => conditionLabels[condition]).join(' · ') : 'Nessuna condizione attiva'}</p>{profile.conditionNotes && <p>{profile.conditionNotes}</p>}</div></div><div className="condition-row"><HeartPulse size={22} /><div><strong>Condizioni e malattie annotate</strong><p>{profile.medicalNotes || 'Nessuna nota inserita'}</p></div></div></section>

      {dialog && <HealthRecordDialog type={dialog} onClose={() => setDialog(null)} />}
    </div>
  )
}
