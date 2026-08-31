import { Footprints, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { findInAppOutingReminder, outingReminderKey } from '../lib/outingReminders'
import { useAppState } from '../state/AppState'

const wasDismissed = (key: string) => {
  try { return sessionStorage.getItem(`cuccia:outing-reminder:${key}`) === 'dismissed' } catch { return false }
}

const dismiss = (key: string) => {
  try { sessionStorage.setItem(`cuccia:outing-reminder:${key}`, 'dismissed') } catch {}
}

export function InAppOutingReminder() {
  const { activePet } = useAppState()
  const [now, setNow] = useState(() => new Date())
  const [dismissedKey, setDismissedKey] = useState('')

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  if (!activePet) return null
  const reminder = findInAppOutingReminder(activePet.profile, activePet.events, now)
  if (!reminder) return null
  const key = outingReminderKey(activePet.id, reminder, now)
  if (dismissedKey === key || wasDismissed(key)) return null

  return <aside className="outing-reminder" role="status" aria-live="polite">
    <span><Footprints size={22} /></span>
    <div><strong>Promemoria in-app · {reminder.time}</strong><p>È l’ora della passeggiata di {activePet.profile.name}?</p></div>
    <button type="button" className="icon-button" onClick={() => { dismiss(key); setDismissedKey(key) }} aria-label="Chiudi promemoria"><X size={19} /></button>
  </aside>
}
