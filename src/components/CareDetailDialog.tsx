import {
  AlertCircle, Check, ExternalLink, FileText, HeartPulse, Pencil, Pill, Plus, Scale,
  Scissors, Shield, ShieldCheck, Stethoscope, Syringe, Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
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

function SectionTitle({ icon: Icon, label, onAdd, tutorialId }: { icon: LucideIcon; label?: string; onAdd?: () => void; tutorialId?: string }) {
  return <div className={`health-section-title care-section-heading ${label ? '' : 'actions-only'}`}>
    {label && <div><Icon size={18} /><span className="care-section-label">{label}</span></div>}
    {onAdd && <button type="button" id={tutorialId} className="care-add-button" onClick={onAdd}><Plus size={18} /> Aggiungi</button>}
  </div>
}

function RecordActions({ label, onEdit, onDelete }: { label: string; onEdit: () => void; onDelete: () => void }) {
  const remove = () => {
    if (window.confirm(`Eliminare “${label}”? L’azione non si può annullare.`)) onDelete()
  }
  return <div className="care-record-actions">
    <button type="button" onClick={onEdit}><Pencil size={18} /> Modifica</button>
    <button type="button" className="danger-text" onClick={remove}><Trash2 size={18} /> Elimina</button>
  </div>
}

function RecordDocuments({ documents }: { documents: PetDocument[] }) {
  if (!documents.length) return null
  return <div className="care-document-links">{documents.map((document) => <a key={document.id} href={document.dataUrl} target="_blank" rel="noreferrer"><FileText size={15} />{document.name}<ExternalLink size={14} /></a>)}</div>
}

function CareRecordCard({ icon: Icon, tone, title, details, metaLabel, metaValue, children, actions }: {
  icon: LucideIcon
  tone: 'sage' | 'clay' | 'blue' | 'honey' | 'ink'
  title: string
  details?: ReactNode
  metaLabel: string
  metaValue: string
  children?: ReactNode
  actions: ReactNode
}) {
  return <article className="care-record-card">
    <div className="care-record-summary">
      <span className={`care-record-marker is-${tone}`}><Icon size={18} /></span>
      <div className="care-record-copy"><h3>{title}</h3></div>
      <div className="care-record-meta"><span>{metaLabel}</span><strong>{metaValue}</strong></div>
    </div>
    {details && <div className="care-record-details care-record-details-wide">{details}</div>}
    {children}
    {actions}
  </article>
}

function PreventionSection({ explanation, records, label, onAdd, onEdit, onDelete }: {
  explanation: string
  records: PreventionRecord[]
  label: string
  onAdd: () => void
  onEdit: (record: PreventionRecord) => void
  onDelete: (id: string) => void
}) {
  return <section className="health-section prevention-section">
    <SectionTitle icon={ShieldCheck} label={label} onAdd={onAdd} />
    <p className="care-section-note">{explanation}</p>
    {records.length ? <div className="care-record-list">{records.map((record) => <CareRecordCard key={record.id} icon={ShieldCheck} tone="clay" title={record.product} metaLabel="Prossima" metaValue={formatDate(nextPreventionDate(record))} details={<><p>{record.kind} · ultima {formatDate(record.lastDate)}</p><p>Ogni {record.intervalDays} giorni{record.seasonalPause ? ' · pausa stagionale attiva' : ''}</p></>} actions={<RecordActions label={record.product} onEdit={() => onEdit(record)} onDelete={() => onDelete(record.id)} />}><RecordDocuments documents={record.documents} /></CareRecordCard>)}</div> : <div className="empty-inline">Nessun dato inserito. Aggiungilo solo quando vuoi seguire questa voce.</div>}
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

  return <Modal className="care-detail-modal" title={sectionTitles[section]} onClose={onClose}>
    {section === 'vaccination' && <section className="health-section">
      <SectionTitle icon={Syringe} label="Storico e richiami" onAdd={() => onAdd('vaccination')} tutorialId="tutorial-care-add" />
      {activePet.health.vaccinations.length ? <div className="care-record-list">{activePet.health.vaccinations.map((record) => <CareRecordCard key={record.id} icon={Check} tone="sage" title={record.name} metaLabel="Prossimo" metaValue={record.nextDate ? formatDate(record.nextDate) : 'Da definire'} details={<><p>Somministrato {formatDate(record.administeredDate)}{record.lotNumber ? ` · Lotto ${record.lotNumber}` : ''}</p>{(record.expiryDate || record.notes) && <p>{record.expiryDate ? `Scadenza prodotto · ${formatDate(record.expiryDate)}` : ''}{record.expiryDate && record.notes ? ' · ' : ''}{record.notes}</p>}</>} actions={<RecordActions label={record.name} onEdit={() => onEdit('vaccination', record)} onDelete={() => state.deleteVaccination(record.id)} />}><RecordDocuments documents={record.documents} /></CareRecordCard>)}</div> : <div className="empty-inline">Nessuna vaccinazione inserita.</div>}
    </section>}

    {section === 'prevention' && <PreventionSection label="Pulci e zecche" explanation="Prodotto, ultima somministrazione e cadenza restano quelli confermati da te." records={antiparasitics} onAdd={() => onAdd('prevention')} onEdit={(record) => onEdit('prevention', record)} onDelete={state.deletePrevention} />}
    {section === 'deworming' && <PreventionSection label="Sverminazione" explanation="Prodotto e cadenza restano quelli confermati da te." records={deworming} onAdd={() => onAdd('deworming')} onEdit={(record) => onEdit('deworming', record)} onDelete={state.deletePrevention} />}

    {section === 'medication' && <section className="health-section medication-section"><SectionTitle icon={Pill} label="Farmaci e terapie" onAdd={() => onAdd('medication')} />
      {activePet.health.medications.length ? <div className="care-record-list">{activePet.health.medications.map((record) => {
        const doses = activePet.events.filter((event) => !event.deletedAt && event.type === 'medication' && event.medicationId === record.id).slice(0, 3)
        return <CareRecordCard key={record.id} icon={Pill} tone="blue" title={record.name} metaLabel="Stato" metaValue={record.active ? 'In corso' : 'Conclusa'} details={<><p>{record.dose} · {record.times.join(' / ') || 'orario libero'}</p><p>Dal {formatDate(record.startDate)}{record.endDate ? ` al ${formatDate(record.endDate)}` : ''}</p></>} actions={<RecordActions label={record.name} onEdit={() => onEdit('medication', record)} onDelete={() => state.deleteMedication(record.id)} />}><RecordDocuments documents={record.documents} /><div className="dose-history"><strong>Ultime dosi registrate nel Diario</strong>{doses.length ? doses.map((dose) => { const author = caregivers.find((caregiver) => caregiver.id === dose.caregiverId); return <span key={dose.id}>{author?.name ?? 'Famiglia'} · {timeFormatter.format(new Date(dose.happenedAt))}</span> }) : <span>Ancora nessuna dose registrata.</span>}</div></CareRecordCard>
      })}</div> : <div className="empty-inline">Nessuna terapia inserita.</div>}
    </section>}

    {section === 'visit' && <section className="health-section"><SectionTitle icon={Stethoscope} label="Appuntamenti e storico" onAdd={() => onAdd('visit')} />
      {visits.length ? <div className="care-record-list">{visits.map((record) => <CareRecordCard key={record.id} icon={Stethoscope} tone="honey" title={record.title} metaLabel="Data" metaValue={formatDate(record.date)} details={<p>{record.notes || 'Nessuna nota'}</p>} actions={<RecordActions label={record.title} onEdit={() => onEdit('visit', record)} onDelete={() => state.deleteVisit(record.id)} />}><RecordDocuments documents={record.documents} /></CareRecordCard>)}</div> : <div className="empty-inline">Nessuna visita registrata.</div>}
    </section>}

    {section === 'weight' && <section className="health-section weight-section"><SectionTitle icon={Scale} label="Peso" onAdd={() => onAdd('weight')} />
      <div className="weight-layout"><div className="weight-current"><span>Attuale</span><strong>{weights[0]?.value || '—'} <small>kg</small></strong><p>{weights[0] ? formatDate(weights[0].date) : 'Non inserito'}</p></div><WeightChart records={weights} /></div>
      {weights.length ? <div className="care-record-list weight-history">{weights.map((record) => <CareRecordCard key={record.id} icon={Scale} tone="ink" title={`${record.value} kg`} metaLabel="Registrato" metaValue={formatDate(record.date)} actions={<RecordActions label={`${record.value} kg`} onEdit={() => onEdit('weight', record)} onDelete={() => state.deleteWeight(record.id)} />}><RecordDocuments documents={record.documents} /></CareRecordCard>)}</div> : <div className="empty-inline">Nessun peso inserito.</div>}
    </section>}

    {section === 'grooming' && <section className="health-section grooming-section"><SectionTitle icon={Scissors} label="Igiene e abitudini" onAdd={() => onAdd('grooming')} />
      {grooming.length ? <div className="care-record-list grooming-list">{grooming.map((record) => <CareRecordCard key={record.id} icon={Scissors} tone="sage" title={record.title} metaLabel="Ultima" metaValue={formatDate(record.lastDate)} details={<>{record.intervalWeeks > 0 && <p>Di solito ogni ~{record.intervalWeeks} settimane. È un promemoria morbido.</p>}{record.notes && <p>{record.notes}</p>}</>} actions={<RecordActions label={record.title} onEdit={() => onEdit('grooming', record)} onDelete={() => state.deleteGrooming(record.id)} />}><RecordDocuments documents={record.documents} /></CareRecordCard>)}</div> : <div className="empty-inline">Ancora nessuna abitudine inserita.</div>}
    </section>}

    {section === 'documents' && <DocumentManager hideTitle />}
    {section === 'profile' && <section className="health-section conditions-section"><SectionTitle icon={Shield} onAdd={onEditProfile} /><div className="condition-row"><Shield size={22} /><div><strong>Microchip</strong><p>{profile.microchip || 'Non inserito'}</p></div></div><div className="condition-row"><AlertCircle size={22} /><div><strong>Allergie</strong><p>{profile.allergies || 'Nessuna allergia inserita'}</p></div></div><div className="condition-row"><HeartPulse size={22} /><div><strong>Condizioni organizzative</strong><p>{profile.conditions.length ? profile.conditions.map((condition) => conditionLabels[condition]).join(' · ') : 'Nessuna condizione attiva'}</p>{profile.conditionNotes && <p>{profile.conditionNotes}</p>}</div></div><div className="condition-row"><HeartPulse size={22} /><div><strong>Condizioni e malattie annotate</strong><p>{profile.medicalNotes || 'Nessuna nota inserita'}</p></div></div></section>}
  </Modal>
}
