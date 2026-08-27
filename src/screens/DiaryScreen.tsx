import { CalendarDays, ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { actionLabels, feedCopy } from '../data'
import { dayKey, dayLabel, timeFormatter, todayKey } from '../lib/date'
import { useAppState } from '../state/AppState'
import type { CareEvent } from '../types'
import { EventIcon } from '../components/EventIcon'
import { EventEditor } from '../components/EventEditor'

type FilterId = 'all' | 'walk' | 'meal' | 'water' | 'bath' | 'grooming' | 'note'

const baseFilters: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Tutte' },
  { id: 'walk', label: 'Passeggiate' },
  { id: 'meal', label: 'Pappa' },
  { id: 'water', label: 'Acqua' },
  { id: 'grooming', label: 'Toelettatura/bagno' },
  { id: 'note', label: 'Note' },
]

const matchesFilter = (event: CareEvent, filter: FilterId) => {
  if (filter === 'all') return true
  if (filter === 'bath') return event.type === 'pee' || event.type === 'poop'
  return event.type === filter
}

export function DiaryScreen() {
  const { data } = useAppState()
  const [filter, setFilter] = useState<FilterId>('all')
  const [editing, setEditing] = useState<CareEvent | null>(null)
  const profile = data.profile!
  const needsEnabled = profile.trackedModules.includes('needs')
  const filters = needsEnabled ? [...baseFilters.slice(0, 4), { id: 'bath' as const, label: 'Pipì e cacca' }, ...baseFilters.slice(4)] : baseFilters
  const visibleEvents = useMemo(() => [...data.events].filter((event) => !event.deletedAt && event.type !== 'sleep' && (needsEnabled || (event.type !== 'pee' && event.type !== 'poop')) && matchesFilter(event, filter)).sort((a, b) => b.happenedAt.localeCompare(a.happenedAt)), [data.events, filter, needsEnabled])
  const groups = useMemo(() => visibleEvents.reduce<Record<string, CareEvent[]>>((result, event) => {
    const key = dayKey(event.happenedAt)
    result[key] = [...(result[key] ?? []), event]
    return result
  }, {}), [visibleEvents])
  const todayEvents = visibleEvents.filter((event) => dayKey(event.happenedAt) === todayKey())
  const walkMinutes = todayEvents.reduce((total, event) => total + (event.durationMin ?? 0), 0)
  const activeLabel = filters.find((item) => item.id === filter)?.label ?? 'Attività'

  return (
    <div className="screen diary-screen">
      <header className="screen-header"><p className="eyebrow">Storico quotidiano</p><h1>Diario</h1><p>Ogni cosa al suo posto, senza trasformare la giornata in una lista di obblighi.</p></header>
      <div className="filter-strip" role="tablist" aria-label="Filtra il diario">{filters.map((item) => <button role="tab" aria-selected={filter === item.id} className={filter === item.id ? 'is-active' : ''} onClick={() => setFilter(item.id)} key={item.id}>{item.label}</button>)}</div>

      <section className="diary-stats" aria-label={`Statistiche ${activeLabel}`}>
        <div><span>{activeLabel} oggi</span><strong>{todayEvents.length}</strong></div>
        {filter === 'walk' && <div><span>Tempo totale</span><strong>{walkMinutes} min</strong></div>}
        {filter === 'all' && <div><span>Passeggiate</span><strong>{todayEvents.filter((event) => event.type === 'walk').length}</strong></div>}
        {filter === 'bath' && <div><span>Pipì · cacca</span><strong>{todayEvents.filter((event) => event.type === 'pee').length} · {todayEvents.filter((event) => event.type === 'poop').length}</strong></div>}
      </section>

      {visibleEvents.length ? <div className="timeline">{Object.entries(groups).map(([date, events]) => <section className="timeline-day" key={date}><h2>{dayLabel(date)}</h2><div>{events.map((event) => {
        const author = profile.caregivers.find((caregiver) => caregiver.id === event.caregiverId) ?? profile.caregivers[0]
        const editor = profile.caregivers.find((caregiver) => caregiver.id === event.editedBy)
        return <button type="button" className="timeline-item timeline-button" key={event.id} onClick={() => setEditing(event)}><span className="timeline-icon"><EventIcon type={event.type} size={18} /></span><div className="timeline-copy"><strong>{actionLabels[event.type]}</strong><p>{author.name} {feedCopy[event.type]} · {timeFormatter.format(new Date(event.happenedAt))}</p>{(event.note || event.durationMin) && <small>{event.note ?? `${event.durationMin} min`}</small>}{event.editedAt && <small>Modificato{editor ? ` da ${editor.name}` : ''}</small>}</div><span className="avatar small-avatar" style={{ background: author.color }}>{author.name[0]}</span></button>
      })}</div></section>)}</div> : <div className="empty-state diary-empty"><CalendarDays size={24} /><div><strong>Ancora nessuna attività in questa sezione</strong><p>Quando vorrai, segna la prima dalla schermata Oggi.</p></div></div>}
      <button className="load-more" disabled><ChevronDown size={17} /> Tutto lo storico è qui</button>
      {editing && <EventEditor event={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
