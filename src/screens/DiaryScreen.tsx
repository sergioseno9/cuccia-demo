import { CalendarDays, ChevronDown, ChevronUp, Clock3, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EventFormDialog } from '../components/EventFormDialog'
import { CaregiverSwitch } from '../components/CaregiverSwitch'
import { EventIcon } from '../components/EventIcon'
import { Modal } from '../components/Modal'
import { actionLabels } from '../data'
import { accordionDayLabel, dayKey, relativeAgo, timeFormatter, todayKey } from '../lib/date'
import { useAppState } from '../state/AppState'
import type { CareEvent, CareEventType } from '../types'

function RegisterPicker({ actions, onSelect, onClose }: { actions: CareEventType[]; onSelect: (type: CareEventType) => void; onClose: () => void }) {
  return <Modal title="Cosa vuoi registrare?" onClose={onClose}><p className="form-intro">Scegli un’attività. Prima di salvarla potrai controllare data, ora, durata e persona.</p><div className="register-action-grid">{actions.map((type) => <button key={type} onClick={() => onSelect(type)}><EventIcon type={type} size={24} /><span>{type === 'walk' ? 'Uscita / passeggiata' : actionLabels[type]}</span></button>)}</div></Modal>
}

export function DiaryScreen() {
  const { activePet, caregivers, profile } = useAppState()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [formType, setFormType] = useState<CareEventType | null>(null)
  const [editing, setEditing] = useState<CareEvent | null>(null)
  const [openDays, setOpenDays] = useState<Set<string>>(() => new Set([todayKey()]))
  if (!activePet || !profile) return null
  const needsEnabled = profile.trackedModules.includes('needs')
  const litterboxEnabled = profile.trackedModules.includes('litterbox')
  const outingsEnabled = profile.species === 'cane' && profile.trackedModules.includes('outings')
  const hasActiveMedication = activePet.health.medications.some((record) => record.active)
  const actions: CareEventType[] = [
    ...(outingsEnabled ? ['walk' as const] : []), 'meal', 'note',
    ...(hasActiveMedication ? ['medication' as const] : []),
    ...(needsEnabled ? ['pee' as const, 'poop' as const] : []),
    ...(litterboxEnabled ? ['litterbox' as const] : []),
  ]
  const dailyTypes: CareEventType[] = [...actions]
  const visibleEvents = useMemo(() => activePet.events.filter((event) => !event.deletedAt && dailyTypes.includes(event.type)).sort((a, b) => b.happenedAt.localeCompare(a.happenedAt)), [activePet.events, dailyTypes])
  const groups = useMemo(() => visibleEvents.reduce<Record<string, CareEvent[]>>((result, event) => {
    const key = dayKey(event.happenedAt)
    result[key] = [...(result[key] ?? []), event]
    return result
  }, { [todayKey()]: [] }), [visibleEvents])
  const latestWalk = visibleEvents.find((event) => event.type === 'walk')

  const toggleDay = (date: string) => setOpenDays((current) => {
    const next = new Set(current)
    next.has(date) ? next.delete(date) : next.add(date)
    return next
  })

  const selectAction = (type: CareEventType) => {
    setPickerOpen(false)
    setFormType(type)
  }

  return (
    <div className="screen diary-screen">
      <header className="minimal-screen-header diary-header"><p className="eyebrow">Attività di oggi</p><h1>Diario</h1></header>
      <button id="tutorial-register" className="button-primary register-main-button" onClick={() => setPickerOpen(true)}><Plus size={24} /> Registra attività</button>
      <CaregiverSwitch />

      {outingsEnabled && profile.outingIntervalHours && latestWalk && <div className="diary-soft-nudge"><Clock3 size={21} /><p>{profile.name} di solito esce ogni ~{profile.outingIntervalHours} h · ultima {relativeAgo(latestWalk.happenedAt)}. È solo il ritmo impostato da te.</p></div>}

      <div className="day-accordion">{Object.entries(groups).map(([date, events]) => {
        const isOpen = openDays.has(date)
        return <section className="day-group" key={date}><button className="day-group-toggle" onClick={() => toggleDay(date)} aria-expanded={isOpen}><span><CalendarDays size={21} />{accordionDayLabel(date)}</span><span>{events.length} {events.length === 1 ? 'voce' : 'voci'}{isOpen ? <ChevronUp size={21} /> : <ChevronDown size={21} />}</span></button>{isOpen && <div className="day-group-content">{events.length ? events.map((event) => {
          const author = caregivers.find((caregiver) => caregiver.id === event.caregiverId) ?? caregivers[0]
          const editor = caregivers.find((caregiver) => caregiver.id === event.editedBy)
          const title = event.durationMin ? `${actionLabels[event.type]} · ${event.durationMin} min` : actionLabels[event.type]
          return <button className="diary-entry" key={event.id} onClick={() => setEditing(event)}><span className="diary-entry-icon"><EventIcon type={event.type} size={22} /></span><div className="diary-entry-copy"><strong>{title}</strong>{event.note && <small>{event.note}</small>}{event.editedAt && <small>Modificato{editor ? ` da ${editor.name}` : ''}</small>}</div><span className="diary-entry-author"><span className="avatar" style={{ background: author.color }}>{author.name[0]}</span><span>{timeFormatter.format(new Date(event.happenedAt))}</span></span></button>
        }) : <div className="empty-state"><CalendarDays size={24} /><div><strong>Ancora nessuna voce oggi</strong><p>Usa “Registra” solo quando ti serve.</p></div></div>}</div>}</section>
      })}</div>

      {pickerOpen && <RegisterPicker actions={actions} onSelect={selectAction} onClose={() => setPickerOpen(false)} />}
      {formType && <EventFormDialog type={formType} onClose={() => setFormType(null)} />}
      {editing && <EventFormDialog type={editing.type} event={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
