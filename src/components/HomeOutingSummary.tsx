import { Bell, Check, ChevronRight, Footprints } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildTodayOutingSchedules } from '../lib/outingReminders'
import { useAppState } from '../state/AppState'

export function HomeOutingSummary() {
  const { activePet } = useAppState()
  const [now, setNow] = useState(() => new Date())
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const outings = useMemo(() => activePet
    ? buildTodayOutingSchedules(activePet.profile, activePet.events, now)
    : [], [activePet, now])
  if (!activePet || activePet.profile.species !== 'cane') return null

  const profile = activePet.profile
  const hasSchedules = profile.outingSchedules.length > 0
  const visibleOutings = outings.filter((outing) => outing.completed || !outing.isPast).slice(0, 4)
  const openEditor = () => navigate('/profilo?section=settings&focus=outings')

  return <section className="home-outings" aria-labelledby="home-outings-title">
    <div className="minimal-section-heading"><h2 id="home-outings-title">Uscite</h2></div>
    <button id="tutorial-outings" className="home-outings-card" type="button" onClick={openEditor}>
      <Footprints className="home-outings-main-icon" size={25} aria-hidden="true" />
      <div className="home-outings-copy">
        <strong>{hasSchedules ? 'Prossime uscite' : 'Orari delle uscite'}</strong>
        {hasSchedules && visibleOutings.length > 0 ? <div className="home-outing-times" role="list">
          {visibleOutings.map(({ schedule, completed, isNext, isPast }) => <span
            aria-label={`${schedule.time}${completed ? ', fatto' : isNext ? ', prossimo orario' : ''}${schedule.reminderEnabled ? ', promemoria attivo' : ''}`}
            className={`home-outing-time ${completed ? 'is-completed' : ''} ${isNext ? 'is-next' : ''} ${isPast ? 'is-past' : ''}`}
            key={schedule.id}
            role="listitem"
          >
            <b>{schedule.time}</b>
            {schedule.reminderEnabled && <Bell size={13} aria-hidden="true" />}
            {completed && <Check size={15} aria-hidden="true" />}
          </span>)}
        </div> : <p>{hasSchedules
          ? 'Nessun altro orario oggi. Puoi modificare la routine quando vuoi.'
          : `Imposta gli orari delle uscite di ${profile.name} per ricevere un promemoria.`}</p>}
      </div>
      <ChevronRight size={21} aria-hidden="true" />
    </button>
  </section>
}
