import { Bell, BellOff, Clock3, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { addOutingSchedule, removeOutingSchedule, toggleOutingSchedule } from '../lib/outingSchedules'
import { useAppState } from '../state/AppState'

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export function OutingScheduleEditor({ autoFocus = false }: { autoFocus?: boolean }) {
  const { profile, updateProfile } = useAppState()
  const [time, setTime] = useState('')
  const [message, setMessage] = useState('')
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!autoFocus) return
    const animationFrame = window.requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ block: 'start' }))
    return () => window.cancelAnimationFrame(animationFrame)
  }, [autoFocus])

  if (!profile || profile.species !== 'cane') return null

  const schedules = [...profile.outingSchedules].sort((first, second) => first.time.localeCompare(second.time))

  const addSchedule = () => {
    if (!time) return
    if (schedules.some((schedule) => schedule.time === time)) {
      setMessage('Questo orario è già presente.')
      return
    }
    updateProfile({
      ...profile,
      outingSchedules: addOutingSchedule(schedules, { id: createId(), time, reminderEnabled: false }),
    })
    setTime('')
    setMessage('Orario aggiunto. Attiva “Avvisami” solo se ti è utile.')
  }

  const toggleReminder = (id: string) => updateProfile({
    ...profile,
    outingSchedules: toggleOutingSchedule(schedules, id),
  })

  const removeSchedule = (id: string) => updateProfile({
    ...profile,
    outingSchedules: removeOutingSchedule(schedules, id),
  })

  return <section ref={sectionRef} id="profile-outing-schedules" className="settings-card outing-schedule-card">
    <div className="settings-card-heading">
      <span className="settings-icon tone-clay"><Clock3 size={22} /></span>
      <div><h2>Orari delle uscite</h2><p>Scegli gli orari abituali e attiva solo gli avvisi che vuoi.</p></div>
    </div>

    <div className="outing-schedule-add">
      <label htmlFor="outing-schedule-time">Nuovo orario</label>
      <div><input id="outing-schedule-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} /><button className="button-secondary" type="button" disabled={!time} onClick={addSchedule}><Plus size={18} /> Aggiungi</button></div>
    </div>

    {schedules.length ? <div className="outing-schedule-list">{schedules.map((schedule) => <div className="outing-schedule-row" key={schedule.id}>
      <strong>{schedule.time}</strong>
      <button
        className={`reminder-switch ${schedule.reminderEnabled ? 'is-active' : ''}`}
        type="button"
        role="switch"
        aria-checked={schedule.reminderEnabled}
        onClick={() => toggleReminder(schedule.id)}
      >
        {schedule.reminderEnabled ? <Bell size={18} /> : <BellOff size={18} />}
        <span>Avvisami</span><i aria-hidden="true" />
      </button>
      <button className="icon-button outing-remove" type="button" onClick={() => removeSchedule(schedule.id)} aria-label={`Rimuovi l’orario ${schedule.time}`}><Trash2 size={18} /></button>
    </div>)}</div> : <p className="settings-empty">Nessun orario impostato. Aggiungili solo se ti sono utili.</p>}

    {message && <p className="outing-schedule-message" role="status">{message}</p>}
    <p className="settings-note">Il promemoria compare solo mentre Cuccia è aperta. Le notifiche ad app chiusa arriveranno con la futura app nativa.</p>
  </section>
}
