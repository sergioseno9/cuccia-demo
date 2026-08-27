import { ChevronRight, Scale, Stethoscope } from 'lucide-react'
import { formatDate, todayKey } from '../lib/date'
import type { HealthData } from '../types'

export function DogOverview({ health, profileWeight, onOpenHealth }: { health: HealthData; profileWeight: string; onOpenHealth: () => void }) {
  const weights = [...health.weights].sort((a, b) => b.date.localeCompare(a.date))
  const visits = [...health.visits].sort((a, b) => a.date.localeCompare(b.date))
  const lastVisit = [...visits].reverse().find((visit) => visit.date < todayKey())
  const nextVisit = visits.find((visit) => visit.date >= todayKey())

  return (
    <section className="dog-overview" aria-labelledby="overview-title">
      <div className="section-title-row"><div><p className="eyebrow">Il libretto che affiora</p><h2 id="overview-title">A colpo d’occhio</h2></div><button className="text-link" onClick={onOpenHealth}>Apri Salute <ChevronRight size={16} /></button></div>
      <div className="overview-primary"><Scale size={21} /><div><span>Peso attuale</span><strong>{(weights[0]?.value ?? profileWeight) || '—'} <small>kg</small></strong><p>{weights[0] ? `Aggiornato ${formatDate(weights[0].date)}` : 'Dal profilo'}</p></div></div>
      <div className="overview-visits"><article><span><Stethoscope size={16} /> Ultima visita</span><strong>{lastVisit ? formatDate(lastVisit.date) : 'Non inserita'}</strong><p>{lastVisit?.title ?? 'Aggiungila nel libretto'}</p></article><article><span><Stethoscope size={16} /> Prossima visita</span><strong>{nextVisit ? formatDate(nextVisit.date) : 'Da programmare'}</strong><p>{nextVisit?.title ?? 'Nessun appuntamento'}</p></article></div>
    </section>
  )
}
