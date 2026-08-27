import { ChevronRight, Footprints, Plus, Scale, Utensils } from 'lucide-react'
import { dayKey, relativeAgo, timeFormatter, todayKey } from '../lib/date'
import type { CareEvent, CareEventType, DogProfile, HealthData } from '../types'

interface StateCardsProps {
  events: CareEvent[]
  health: HealthData
  profile: DogProfile
  onOpenOutings: () => void
  onOpenWeight: () => void
  onQuickLog: (type: CareEventType) => void
}

export function TodayStateCards({ events, health, profile, onOpenOutings, onOpenWeight, onQuickLog }: StateCardsProps) {
  const sorted = [...events].filter((event) => !event.deletedAt).sort((a, b) => b.happenedAt.localeCompare(a.happenedAt))
  const today = sorted.filter((event) => dayKey(event.happenedAt) === todayKey())
  const latestMeal = sorted.find((event) => event.type === 'meal')
  const latestWalk = sorted.find((event) => event.type === 'walk')
  const latestWalkAuthor = profile.caregivers.find((caregiver) => caregiver.id === latestWalk?.caregiverId)
  const mealsToday = today.filter((event) => event.type === 'meal').length
  const walksToday = today.filter((event) => event.type === 'walk')
  const walkMinutes = walksToday.reduce((total, event) => total + (event.durationMin ?? 0), 0)
  const latestWeight = [...health.weights].sort((a, b) => b.date.localeCompare(a.date))[0]

  return (
    <section className="state-section" aria-labelledby="state-title">
      <div className="section-title-row"><div><p className="eyebrow">Quotidianità, se serve</p><h2 id="state-title">Stato di oggi</h2></div></div>
      <div className="state-card-grid">
        {profile.trackedModules.includes('outings') && <article className="state-card state-outings"><button className="state-card-main" onClick={onOpenOutings}><span className="state-card-icon"><Footprints size={20} /></span><div><small>Uscite</small><strong>{latestWalk ? `Ultima ${relativeAgo(latestWalk.happenedAt)}` : 'Nessuna uscita registrata'}</strong><p>{latestWalk ? `${timeFormatter.format(new Date(latestWalk.happenedAt))} · ${latestWalkAuthor?.name ?? 'Caregiver'}` : 'Apri per registrare quando vuoi'}</p><p>Oggi: {walksToday.length} {walksToday.length === 1 ? 'uscita' : 'uscite'} · {walkMinutes} min</p>{walksToday.length > 0 && <p className="outing-times">{walksToday.slice(0, 4).map((event) => timeFormatter.format(new Date(event.happenedAt))).reverse().join(' · ')}</p>}</div><ChevronRight size={18} /></button>{profile.outingIntervalHours && latestWalk && <p className="soft-nudge">{profile.name} di solito esce ogni ~{profile.outingIntervalHours} h · ultima {relativeAgo(latestWalk.happenedAt)}.</p>}</article>}

        <article className="state-card"><div className="state-card-main"><span className="state-card-icon state-icon-honey"><Utensils size={20} /></span><div><small>Pasti</small><strong>{latestMeal ? `Ultimo alle ${timeFormatter.format(new Date(latestMeal.happenedAt))}` : 'Ancora nessun pasto'}</strong><p>{mealsToday} {mealsToday === 1 ? 'pasto' : 'pasti'} oggi</p></div><button className="state-add" onClick={() => onQuickLog('meal')} aria-label="Registra pappa adesso"><Plus size={18} /></button></div></article>

        {profile.trackedModules.includes('weight') && <article className="state-card"><button className="state-card-main" onClick={onOpenWeight}><span className="state-card-icon state-icon-sage"><Scale size={20} /></span><div><small>Peso</small><strong>{(latestWeight?.value ?? profile.weight) || '—'} kg</strong><p>{latestWeight ? `Aggiornato il ${new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(new Date(`${latestWeight.date}T12:00:00`))}` : 'Valore dal profilo'}</p></div><ChevronRight size={18} /></button></article>}
      </div>
    </section>
  )
}
