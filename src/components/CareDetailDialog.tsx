import {
  AlertCircle, Check, ExternalLink, FileText, HeartPulse, Pencil, Pill, Plus, Scale,
  Scissors, Shield, ShieldCheck, Stethoscope, Syringe, Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DocumentManager } from './DocumentManager'
import { Modal } from './Modal'
import { formatDate, timeFormatter } from '../lib/date'
import { nextPreventionDate } from '../lib/deadlines'
import { conditionLabels } from '../lib/profile'
import { useAppState } from '../state/AppState'
import type { HealthRecord, PetDocument, PreventionRecord, WeightRecord } from '../types'
import type { HealthRecordType } from '../screens/HealthRecordDialog'

export type CareSection = HealthRecordType | 'documents' | 'profile'

const sectionTitles: Record<CareSection, string> = {
  vaccination: 'Vaccinazioni', prevention: 'Antiparassitari', deworming: 'Sverminazione',
  medication: 'Farmaci e terapie', visit: 'Visite veterinarie', weight: 'Peso e crescita',
  grooming: 'Igiene e abitudini', documents: 'Documenti', profile: 'Microchip e condizioni',
}

function SectionTitle({ icon: Icon, title, onAdd, tutorialId }: { icon: LucideIcon; title?: string; onAdd?: () => void; tutorialId?: string }) {
  return <div className={`health-section-title ${title ? '' : 'actions-only'}`}>
    {title && <div><span><Icon size={21} /></span><h2>{title}</h2></div>}
    {onAdd && <button id={tutorialId} className="button-secondary care-add-button" onClick={onAdd}><Plus size={19} /> Aggiungi</button>}
  </div>
}

function RecordActions({ label, onEdit, onDelete }: { label: string; onEdit: () => void; onDelete: () => void }) {
  const remove = () => {
    if (window.confirm(`Eliminare “${label}”? L’azione non si può annullare.`)) onDelete()
  }
  return <div className="care-record-actions">
    <button type="button" onClick={onEdit}><Pencil size={17} /> Modifica</button>
    <button type="button" className="danger-text" onClick={remove}><Trash2 size={17} /> Elimina</button>
  </div>
}

function RecordDocuments({ documents }: { documents: PetDocument[] }) {
  if (!documents.length) return null
  return <div className="care-document-links">{documents.map((document) => <a key={document.id} href={document.dataUrl} target="_blank" rel="noreferrer"><FileText size={15} />{document.name}<ExternalLink size={14} /></a>)}</div>
}

function PreventionSection({ explanation, records, title, onAdd, onEdit, onDelete }: {
  explanation: string
  records: PreventionRecord[]
  title?: string
  onAdd: () => void
  onEdit: (record: PreventionRecord) => void
  onDelete: (id: string) => void
}) {
  return <section className="health-section prevention-section">
    <SectionTitle icon={ShieldCheck} title={title} onAdd={onAdd} />
    <p className="section-explainer">{explanation}</p>
    {records.length ? <div className="prevention-grid">{records.map((record) => <article key={record.id}>
      <span>{record.kind}</span><h3>{record.product}</h3><p>Ultima · {formatDate(record.lastDate)}</p>
      <strong>Prossima · {formatDate(nextPreventionDate(record))}</strong>
      {record.seasonalPause && <small>Pausa stagionale attiva</small>}
      <RecordDocuments documents={record.documents} />
      <RecordActions label={record.product} onEdit={() => onEdit(record)} onDelete={() => onDelete(record.id)} />
    </article>)}</div> : <div className="empty-inline">Nessun dato inserito. Aggiungilo solo quando vuoi seguire questa voce.</div>}
  </section>
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

interface CareDetailDialogProps {
  section: CareSection
  onAdd: (type: HealthRecordType) => void
  onEdit: (type: HealthRecordType, record: HealthRecord) => void
  onClose: () => void
  onEditProfile: () => void
}

export function CareDetailDialog({ section, onAdd, onEdit, onClose, onEditProfile }: CareDetailDialogProps) {
  const state = useAppState()
  const { activePet, caregivers, profile } = state
  if (!activePet || !profile) return null
  const weights = [...activePet.health.weights].sort((a, b) => b.date.localeCompare(a.date))
  const visits = [...activePet.health.visits].sort((a, b) => b.date.localeCompare(a.date))
  const grooming = [...activePet.health.grooming].sort((a, b) => b.lastDate.localeCompare(a.lastDate))
  const deworming = activePet.health.preventions.filter((record) => /svermin/i.test(record.kind))
  const antiparasitics = activePet.health.preventions.filter((record) => !/svermin/i.test(record.kind))

  return <Modal title={sectionTitles[section]} onClose={onClose}>
    {section === 'vaccination' && <section className="health-section">
      <SectionTitle icon={Syringe} title="Storico e richiami" onAdd={() => onAdd('vaccination')} tutorialId="tutorial-care-add" />
      {activePet.health.vaccinations.length ? <div className="record-list">{activePet.health.vaccinations.map((record) => <article className="record-row" key={record.id}>
        <div className="record-marker"><Check size={18} /></div><div><strong>{record.name}</strong><p>Somministrato {formatDate(record.administeredDate)}</p>
          {record.lotNumber && <small>Lotto · {record.lotNumber}</small>}{record.expiryDate && <small>Scadenza prodotto · {formatDate(record.expiryDate)}</small>}{record.notes && <small>{record.notes}</small>}
          <RecordDocuments documents={record.documents} /><RecordActions label={record.name} onEdit={() => onEdit('vaccination', record)} onDelete={() => state.deleteVaccination(record.id)} />
        </div><span>Prossimo<br /><strong>{record.nextDate ? formatDate(record.nextDate) : 'da definire'}</strong></span>
      </article>)}</div> : <div className="empty-inline">Nessuna vaccinazione inserita.</div>}
    </section>}

    {section === 'prevention' && <PreventionSection title="Pulci e zecche" explanation="Prodotto, ultima somministrazione e cadenza restano quelli confermati da te." records={antiparasitics} onAdd={() => onAdd('prevention')} onEdit={(record) => onEdit('prevention', record)} onDelete={state.deletePrevention} />}
    {section === 'deworming' && <PreventionSection explanation="Prodotto e cadenza restano quelli confermati da te." records={deworming} onAdd={() => onAdd('deworming')} onEdit={(record) => onEdit('deworming', record)} onDelete={state.deletePrevention} />}

    {section === 'medication' && <section className="health-section medication-section"><SectionTitle icon={Pill} onAdd={() => onAdd('medication')} />
      {activePet.health.medications.length ? <div className="therapy-list">{activePet.health.medications.map((record) => {
        const doses = activePet.events.filter((event) => !event.deletedAt && event.type === 'medication' && event.medicationId === record.id).slice(0, 3)
        return <article className="therapy-card" key={record.id}><div className="therapy-main"><div><span className="badge badge-sage">{record.active ? 'In corso' : 'Conclusa'}</span><h3>{record.name}</h3><p>{record.dose} · {record.times.join(' / ') || 'orario libero'}</p><RecordDocuments documents={record.documents} /></div></div>
          <div className="dose-history"><strong>Ultime dosi registrate nel Diario</strong>{doses.length ? doses.map((dose) => { const author = caregivers.find((caregiver) => caregiver.id === dose.caregiverId); return <span key={dose.id}>{author?.name ?? 'Famiglia'} · {timeFormatter.format(new Date(dose.happenedAt))}</span> }) : <span>Ancora nessuna dose registrata.</span>}</div>
          <RecordActions label={record.name} onEdit={() => onEdit('medication', record)} onDelete={() => state.deleteMedication(record.id)} />
        </article>
      })}</div> : <div className="empty-inline">Nessuna terapia inserita.</div>}
    </section>}

    {section === 'visit' && <section className="health-section"><SectionTitle icon={Stethoscope} title="Appuntamenti e storico" onAdd={() => onAdd('visit')} />
      {visits.length ? <div className="visit-list">{visits.map((record) => <article key={record.id}><span className="date-tile"><strong>{new Date(`${record.date}T12:00:00`).getDate()}</strong>{new Intl.DateTimeFormat('it-IT', { month: 'short' }).format(new Date(`${record.date}T12:00:00`))}</span><div><h3>{record.title}</h3><p>{record.notes || 'Nessuna nota'}</p><RecordDocuments documents={record.documents} /><RecordActions label={record.title} onEdit={() => onEdit('visit', record)} onDelete={() => state.deleteVisit(record.id)} /></div></article>)}</div> : <div className="empty-inline">Nessuna visita registrata.</div>}
    </section>}

    {section === 'weight' && <section className="health-section weight-section"><SectionTitle icon={Scale} title="Peso" onAdd={() => onAdd('weight')} />
      <div className="weight-layout"><div className="weight-current"><span>Attuale</span><strong>{weights[0]?.value || '—'} <small>kg</small></strong><p>{weights[0] ? formatDate(weights[0].date) : 'Non inserito'}</p></div><WeightChart records={weights} /></div>
      {weights.length ? <div className="weight-history">{weights.map((record) => <article key={record.id}><div><strong>{record.value} kg</strong><span>{formatDate(record.date)}</span><RecordDocuments documents={record.documents} /></div><RecordActions label={`${record.value} kg`} onEdit={() => onEdit('weight', record)} onDelete={() => state.deleteWeight(record.id)} /></article>)}</div> : <div className="empty-inline">Nessun peso inserito.</div>}
    </section>}

    {section === 'grooming' && <section className="health-section grooming-section"><SectionTitle icon={Scissors} onAdd={() => onAdd('grooming')} />
      {grooming.length ? <div className="grooming-list">{grooming.map((record) => <article className="grooming-card" key={record.id}><div><strong>{record.title}</strong><p>Ultima volta · {formatDate(record.lastDate)}</p>{record.intervalWeeks > 0 && <small>Di solito ogni ~{record.intervalWeeks} settimane. È un promemoria morbido.</small>}{record.notes && <small>{record.notes}</small>}<RecordDocuments documents={record.documents} /></div><RecordActions label={record.title} onEdit={() => onEdit('grooming', record)} onDelete={() => state.deleteGrooming(record.id)} /></article>)}</div> : <div className="empty-inline">Ancora nessuna abitudine inserita.</div>}
    </section>}

    {section === 'documents' && <DocumentManager hideTitle />}
    {section === 'profile' && <section className="health-section conditions-section"><SectionTitle icon={Shield} onAdd={onEditProfile} /><div className="condition-row"><Shield size={22} /><div><strong>Microchip</strong><p>{profile.microchip || 'Non inserito'}</p></div></div><div className="condition-row"><AlertCircle size={22} /><div><strong>Allergie</strong><p>{profile.allergies || 'Nessuna allergia inserita'}</p></div></div><div className="condition-row"><HeartPulse size={22} /><div><strong>Condizioni organizzative</strong><p>{profile.conditions.length ? profile.conditions.map((condition) => conditionLabels[condition]).join(' · ') : 'Nessuna condizione attiva'}</p>{profile.conditionNotes && <p>{profile.conditionNotes}</p>}</div></div><div className="condition-row"><HeartPulse size={22} /><div><strong>Condizioni e malattie annotate</strong><p>{profile.medicalNotes || 'Nessuna nota inserita'}</p></div></div></section>}
  </Modal>
}
