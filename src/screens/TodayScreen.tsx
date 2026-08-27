import { Bone, BookOpen, ChevronRight, Clock3, ContactRound, Droplets, MoonStar, Sparkles, Waves } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityRow } from '../components/ActivityRow'
import { DailyEntryDialog } from '../components/DailyEntryDialog'
import { DeadlineList } from '../components/DeadlineList'
import { DogOverview } from '../components/DogOverview'
import { EventEditor } from '../components/EventEditor'
import { EventIcon } from '../components/EventIcon'
import { OutingsPanel } from '../components/OutingsPanel'
import { PetCardDialog } from '../components/PetCardDialog'
import { TodayStateCards } from '../components/TodayStateCards'
import { actionLabels } from '../data'
import { panicGuideMap } from '../data/guides'
import { buildDeadlines } from '../lib/deadlines'
import { ageLabel, dayKey, todayKey } from '../lib/date'
import { selectMomentGuide } from '../lib/guideSelection'
import { lifePhaseLabels } from '../lib/profile'
import { useAppState } from '../state/AppState'
import type { CareEvent, CareEventType } from '../types'

const panicActions = [
  { label: 'Notte', icon: MoonStar },
  { label: 'Pipì in casa', icon: Droplets },
  { label: 'Morsi', icon: Bone },
  { label: 'Caos', icon: Waves },
] as const

export function TodayScreen() {
  const { data, addEvent, selectCaregiver } = useAppState()
  const [dialog, setDialog] = useState<'medication' | 'note' | null>(null)
  const [outingsOpen, setOutingsOpen] = useState(false)
  const [petCardOpen, setPetCardOpen] = useState(false)
  const [editing, setEditing] = useState<CareEvent | null>(null)
  const navigate = useNavigate()
  const profile = data.profile!
  const needsEnabled = profile.trackedModules.includes('needs')
  const sortedEvents = useMemo(() => data.events.filter((event) => !event.deletedAt && event.type !== 'sleep' && (needsEnabled || (event.type !== 'pee' && event.type !== 'poop'))).sort((a, b) => b.happenedAt.localeCompare(a.happenedAt)), [data.events, needsEnabled])
  const todayEvents = sortedEvents.filter((event) => dayKey(event.happenedAt) === todayKey())
  const deadlines = buildDeadlines(data)
  const momentGuide = selectMomentGuide(data)
  const quickActions: CareEventType[] = [
    ...(profile.trackedModules.includes('outings') ? ['walk' as const] : []),
    'meal',
    ...(profile.trackedModules.includes('water') ? ['water' as const] : []),
    'medication',
    'note',
    ...(profile.trackedModules.includes('grooming') ? ['grooming' as const] : []),
  ]

  const handleAction = (type: CareEventType) => {
    if (type === 'medication' || type === 'note') {
      setDialog(type)
      return
    }
    addEvent(type)
  }

  return (
    <div className={`screen today-screen phase-${profile.lifePhase}`}>
      <header className="today-header">
        <div className="dog-identity"><div className="dog-avatar">{profile.photo ? <img src={profile.photo} alt={`Foto di ${profile.name}`} /> : <img src="./dog-icon.svg" alt="" />}</div><div><p className="eyebrow">La casa digitale di</p><h1>{profile.name}</h1><span>{ageLabel(profile.birthDate)}</span></div></div>
        <div className="today-header-actions"><span className={`badge ${profile.lifePhase === 'cucciolo' ? 'badge-honey' : 'badge-sage'}`}>{lifePhaseLabels[profile.lifePhase]}</span><button className="guide-header-button" onClick={() => navigate('/guida')} aria-label="Apri Guida"><BookOpen size={20} /></button></div>
      </header>

      <section className="focus-section" aria-labelledby="deadlines-title"><div className="section-title-row"><div><p className="eyebrow">Prima cosa da sapere</p><h2 id="deadlines-title">Prossime scadenze</h2></div><button className="text-link" onClick={() => navigate('/salute')}>Scadenzario <ChevronRight size={16} /></button></div><DeadlineList deadlines={deadlines} limit={3} /></section>

      <DogOverview health={data.health} profileWeight={profile.weight} onOpenHealth={() => navigate('/salute')} />

      <section className="quick-log-section" aria-labelledby="quick-title"><div className="section-title-row"><div><p className="eyebrow">Solo se ti è utile</p><h2 id="quick-title">Azioni rapide</h2></div></div><section className="caregiver-switch" aria-labelledby="caregiver-label"><span id="caregiver-label">Tu sei</span><div>{profile.caregivers.map((caregiver) => <button key={caregiver.id} className={data.selectedCaregiverId === caregiver.id ? 'is-active' : ''} onClick={() => selectCaregiver(caregiver.id)} aria-pressed={data.selectedCaregiverId === caregiver.id}><span style={{ background: caregiver.color }}>{caregiver.name[0]}</span>{caregiver.name}</button>)}</div></section><div className="quick-grid">{quickActions.map((type) => <button key={type} className={`quick-action quick-${type}`} onClick={() => handleAction(type)}><EventIcon type={type} size={21} /><span>{type === 'walk' ? 'Uscita' : actionLabels[type]}</span></button>)}</div></section>

      <section className="pet-card-callout"><span><ContactRound size={23} /></span><div><p className="eyebrow">Pronta in pochi secondi</p><h2>Condividi la Pet Card</h2><p>Contatti, microchip, terapie e alimentazione in una scheda stampabile.</p></div><button className="button-primary" onClick={() => setPetCardOpen(true)}>Apri <ChevronRight size={16} /></button></section>

      <TodayStateCards events={data.events} health={data.health} profile={profile} onOpenOutings={() => setOutingsOpen(true)} onOpenWeight={() => navigate('/salute')} onQuickLog={handleAction} />

      {profile.lifePhase === 'cucciolo' && <section className="panic-section" aria-labelledby="panic-title"><div className="panic-heading"><div><p className="eyebrow">Un passo alla volta</p><h2 id="panic-title">Niente panico</h2><p>Scegli quello che sta succedendo. Troverai una guida breve e gentile.</p></div><Sparkles size={25} /></div><div className="panic-grid">{panicActions.map(({ label, icon: Icon }) => <button key={label} onClick={() => navigate(`/guida/${panicGuideMap[label]}`)}><Icon size={19} /><span>{label}</span><ChevronRight size={14} /></button>)}</div></section>}

      {momentGuide && <section className="moment-guide" aria-labelledby="moment-title"><div className="moment-guide-icon"><BookOpen size={22} /></div><div><p className="eyebrow">Guida del momento</p><h2 id="moment-title">{momentGuide.title}</h2><button className="text-link" onClick={() => navigate(`/guida/${momentGuide.id}`)}>Leggi (~{momentGuide.readingMinutes} min) <ChevronRight size={16} /></button></div></section>}

      <section className="secondary-feed" aria-labelledby="recent-title"><div className="section-title-row"><div><p className="eyebrow">Coordinamento familiare</p><h2 id="recent-title">Attività recenti</h2></div><button className="text-link" onClick={() => navigate('/diario')}>Vedi tutto <ChevronRight size={16} /></button></div>{todayEvents.length ? <div className="activity-list">{todayEvents.slice(0, 4).map((event) => <ActivityRow key={event.id} event={event} author={profile.caregivers.find((caregiver) => caregiver.id === event.caregiverId) ?? profile.caregivers[0]} editor={profile.caregivers.find((caregiver) => caregiver.id === event.editedBy)} onEdit={() => setEditing(event)} />)}</div> : <div className="empty-state"><Clock3 size={22} /><div><strong>Nessuna attività registrata oggi</strong><p>Va bene così: il diario è uno strumento, non un obbligo.</p></div></div>}</section>

      {dialog && <DailyEntryDialog type={dialog} onClose={() => setDialog(null)} />}
      {outingsOpen && <OutingsPanel onClose={() => setOutingsOpen(false)} />}
      {petCardOpen && <PetCardDialog onClose={() => setPetCardOpen(false)} />}
      {editing && <EventEditor event={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
