import { ChevronRight, FileText, HeartPulse, Pill, Scale, Scissors, ShieldCheck, Stethoscope, Syringe } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CareDetailDialog } from '../components/CareDetailDialog'
import type { CareSection } from '../components/CareDetailDialog'
import { formatDate } from '../lib/date'
import { buildInAppDeadlines } from '../lib/reminders'
import { currentWeight } from '../lib/weight'
import { useAppState } from '../state/AppState'
import { HealthRecordDialog } from './HealthRecordDialog'
import type { HealthRecordType } from './HealthRecordDialog'
import type { HealthRecord } from '../types'

export function CareScreen() {
  const { activePet, profile } = useAppState()
  const [dialog, setDialog] = useState<{ type: HealthRecordType; record?: HealthRecord } | null>(null)
  const [section, setSection] = useState<CareSection | null>(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const deadlines = useMemo(() => activePet ? buildInAppDeadlines(activePet) : [], [activePet])

  useEffect(() => {
    const focus = searchParams.get('focus')
    const validSections: CareSection[] = ['vaccination', 'prevention', 'deworming', 'medication', 'visit', 'weight', 'grooming', 'documents', 'profile']
    if (focus && validSections.includes(focus as CareSection)) setSection(focus as CareSection)
  }, [searchParams])

  if (!activePet || !profile) return null
  const weight = currentWeight(activePet)

  const nextVisit = deadlines.find((deadline) => deadline.source === 'visit')
  const indexItems = [
    { section: 'vaccination' as const, label: 'Vaccinazioni', value: activePet.health.vaccinations[0]?.nextDate ? `Prossima ${formatDate(activePet.health.vaccinations[0].nextDate)}` : `${activePet.health.vaccinations.length} registrate`, icon: Syringe, tone: 'sage' },
    { section: 'prevention' as const, label: 'Antiparassitari', value: `${activePet.health.preventions.filter((item) => !/svermin/i.test(item.kind)).length} registrati`, icon: ShieldCheck, tone: 'clay' },
    { section: 'medication' as const, label: 'Farmaci', value: `${activePet.health.medications.filter((item) => item.active).length} attivi`, icon: Pill, tone: 'blue' },
    { section: 'visit' as const, label: 'Visite', value: nextVisit ? formatDate(nextVisit.dueDate) : 'Nessuna data', icon: Stethoscope, tone: 'honey' },
    { section: 'weight' as const, label: 'Peso e crescita', value: `${weight ?? '—'} kg`, icon: Scale, tone: 'ink' },
    { section: 'documents' as const, label: 'Documenti', value: `${profile.documents.length} file`, icon: FileText, tone: 'neutral' },
  ]
  const extraItems = [
    { section: 'deworming' as const, label: 'Sverminazione', value: `${activePet.health.preventions.filter((item) => /svermin/i.test(item.kind)).length} registrate`, icon: ShieldCheck, tone: 'sage' },
    { section: 'grooming' as const, label: 'Igiene e abitudini', value: `${activePet.health.grooming.length} voci`, icon: Scissors, tone: 'honey' },
    { section: 'profile' as const, label: 'Microchip e condizioni', value: profile.microchip ? 'Completo' : 'Da completare', icon: HeartPulse, tone: 'blue' },
  ]

  return <div className="screen care-screen">
    <header className="minimal-screen-header"><p className="eyebrow">Libretto di {profile.name}</p><h1>Cura</h1></header>
    <div className="care-stat-grid"><article><span>Peso</span><strong>{weight ?? '—'} kg</strong></article><article><span>Prossima visita</span><strong>{nextVisit ? formatDate(nextVisit.dueDate) : '—'}</strong></article></div>
    <section className="care-index"><h2>Il libretto</h2><div className="care-index-card">{indexItems.map(({ icon: Icon, ...item }) => <button key={item.section} onClick={() => setSection(item.section)}><Icon className={`tone-${item.tone}`} size={23} /><strong>{item.label}</strong><span>{item.value}</span><ChevronRight size={20} /></button>)}</div></section>
    <section className="care-index care-extra-index"><h2>Altri dati</h2><div className="care-index-card">{extraItems.map(({ icon: Icon, ...item }) => <button key={item.section} onClick={() => setSection(item.section)}><Icon className={`tone-${item.tone}`} size={23} /><strong>{item.label}</strong><span>{item.value}</span><ChevronRight size={20} /></button>)}</div></section>
    {section && <CareDetailDialog section={section} onClose={() => setSection(null)} onAdd={(type) => { setSection(null); setDialog({ type }) }} onEdit={(type, record) => { setSection(null); setDialog({ type, record }) }} onEditProfile={() => navigate('/profilo')} />}
    {dialog && <HealthRecordDialog type={dialog.type} record={dialog.record} onClose={() => setDialog(null)} />}
  </div>
}
