import { ChevronRight, Clock3 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { actionLabels } from '../data'
import { dayKey, relativeAgo, timeFormatter, todayKey } from '../lib/date'
import { useAppState } from '../state/AppState'
import type { CareEvent, CareEventType } from '../types'
import { EventEditor } from './EventEditor'
import { EventIcon } from './EventIcon'
import { Modal } from './Modal'

type OutingFilter = 'all' | 'walk' | 'pee' | 'poop'

export function OutingsPanel({ onClose }: { onClose: () => void }) {
  const { data, addEvent } = useAppState()
  const [filter, setFilter] = useState<OutingFilter>('all')
  const [editing, setEditing] = useState<CareEvent | null>(null)
  const profile = data.profile!
  const needsEnabled = profile.trackedModules.includes('needs')
  const visibleTypes: CareEventType[] = needsEnabled ? ['walk', 'pee', 'poop'] : ['walk']
  const events = useMemo(() => data.events.filter((event) => !event.deletedAt && visibleTypes.includes(event.type)).sort((a, b) => b.happenedAt.localeCompare(a.happenedAt)), [data.events, needsEnabled])
  const todayEvents = events.filter((event) => dayKey(event.happenedAt) === todayKey())
  const visibleEvents = filter === 'all' ? todayEvents : todayEvents.filter((event) => event.type === filter)
  const walks = todayEvents.filter((event) => event.type === 'walk')
  const duration = walks.reduce((total, event) => total + (event.durationMin ?? 0), 0)
  const latestWalk = events.find((event) => event.type === 'walk')
  const latestCaregiver = profile.caregivers.find((caregiver) => caregiver.id === latestWalk?.caregiverId)
  const filters: OutingFilter[] = needsEnabled ? ['all', 'walk', 'pee', 'poop'] : ['all', 'walk']

  if (editing) return <EventEditor event={editing} onClose={() => setEditing(null)} />

  return (
    <Modal title="Uscite di oggi" onClose={onClose}>
      <div className="needs-panel">
        <div className="needs-latest"><span>Ultima uscita</span><strong>{latestWalk ? relativeAgo(latestWalk.happenedAt) : 'Non registrata'}</strong>{latestWalk && <p>{timeFormatter.format(new Date(latestWalk.happenedAt))}{latestCaregiver ? ` · ${latestCaregiver.name}` : ''}</p>}<p>Oggi: {walks.length} {walks.length === 1 ? 'uscita' : 'uscite'} · {duration} min</p></div>
        {profile.outingIntervalHours && latestWalk && <div className="needs-nudge"><Clock3 size={18} /><p>{profile.name} di solito esce ogni ~{profile.outingIntervalHours} h · ultima {relativeAgo(latestWalk.happenedAt)}. È solo il ritmo impostato da te.</p></div>}

        <div className={`needs-counts ${needsEnabled ? '' : 'single-count'}`}>{filters.filter((item) => item !== 'all').map((type) => <button key={type} className={filter === type ? 'is-active' : ''} onClick={() => setFilter(filter === type ? 'all' : type)}><span>{type === 'walk' ? 'Uscite' : actionLabels[type]}</span><strong>×{todayEvents.filter((event) => event.type === type).length}</strong></button>)}</div>

        <div className={`needs-actions ${needsEnabled ? '' : 'single-action'}`}><button onClick={() => addEvent('walk')}><EventIcon type="walk" size={18} /><span>+ Uscita</span></button>{needsEnabled && <><button onClick={() => addEvent('pee')}><EventIcon type="pee" size={18} /><span>+ Pipì</span></button><button onClick={() => addEvent('poop')}><EventIcon type="poop" size={18} /><span>+ Cacca</span></button></>}</div>

        <div className="needs-rhythm"><div><p className="eyebrow">Fatti, senza obiettivi</p><h3>Orari registrati</h3></div>{visibleEvents.length ? <div>{visibleEvents.map((event) => { const caregiver = profile.caregivers.find((item) => item.id === event.caregiverId); return <button key={event.id} onClick={() => setEditing(event)}><EventIcon type={event.type} size={17} /><span><strong>{timeFormatter.format(new Date(event.happenedAt))}</strong>{actionLabels[event.type]} · {caregiver?.name ?? 'Caregiver'}{event.durationMin ? ` · ${event.durationMin} min` : ''}</span><ChevronRight size={16} /></button> })}</div> : <p className="empty-inline">Ancora nessuna uscita oggi — segnala la prima solo se ti è utile.</p>}</div>
      </div>
    </Modal>
  )
}
