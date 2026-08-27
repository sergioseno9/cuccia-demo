import { Check, SlidersHorizontal } from 'lucide-react'
import {
  conditionIds,
  conditionLabels,
  lifePhaseIds,
  lifePhaseLabels,
  moduleLabels,
  modulePresets,
  requiredModules,
  trackedModuleIds,
  withRequiredModules,
} from '../lib/profile'
import type { DogCondition, DogProfile, LifePhase, TrackedModule } from '../types'

interface PreferencesProps {
  profile: DogProfile
  onChange: (profile: DogProfile) => void
  resetModulesOnPhase?: boolean
}

const phaseDescriptions: Record<LifePhase, string> = {
  cucciolo: 'Più routine e guide vicine.',
  adulto: 'Scadenze e riepiloghi essenziali.',
  senior: 'Terapie, visite e peso in vista.',
}

export function PhasePicker({ profile, onChange, resetModulesOnPhase = false }: PreferencesProps) {
  const selectPhase = (lifePhase: LifePhase) => onChange({
    ...profile,
    lifePhase,
    trackedModules: resetModulesOnPhase
      ? withRequiredModules(modulePresets[lifePhase], profile.conditions)
      : profile.trackedModules,
  })

  return <div className="phase-picker">{lifePhaseIds.map((phase) => <button type="button" key={phase} className={profile.lifePhase === phase ? 'is-active' : ''} onClick={() => selectPhase(phase)} aria-pressed={profile.lifePhase === phase}><span>{lifePhaseLabels[phase]}</span><small>{phaseDescriptions[phase]}</small></button>)}</div>
}

export function TrackingPreferences({ profile, onChange }: PreferencesProps) {
  const lockedModules = requiredModules(profile.conditions)

  const toggleModule = (module: TrackedModule) => {
    if (lockedModules.includes(module)) return
    const trackedModules = profile.trackedModules.includes(module)
      ? profile.trackedModules.filter((item) => item !== module)
      : [...profile.trackedModules, module]
    onChange({ ...profile, trackedModules })
  }

  return (
    <div className="tracking-preferences">
      <div className="preferences-heading"><SlidersHorizontal size={19} /><div><strong>Cosa seguo per {profile.name || 'il mio cane'}</strong><p>La fase propone un punto di partenza. Puoi cambiare tutto quando vuoi.</p></div></div>
      <div className="toggle-grid">{trackedModuleIds.map((module) => {
        const active = profile.trackedModules.includes(module)
        const locked = lockedModules.includes(module)
        return <button type="button" key={module} className={active ? 'is-active' : ''} onClick={() => toggleModule(module)} aria-pressed={active}><span><Check size={14} /></span><strong>{moduleLabels[module]}</strong>{locked && <small>da condizione</small>}</button>
      })}</div>
      {profile.trackedModules.includes('outings') && <label className="field interval-field"><span>Promemoria morbido per le uscite <small>opzionale</small></span><div className="input-suffix"><input type="number" min="0.5" max="24" step="0.5" value={profile.outingIntervalHours ?? ''} onChange={(event) => onChange({ ...profile, outingIntervalHours: event.target.value ? Number(event.target.value) : undefined })} placeholder="3" /><span>ore</span></div><small>Mostra solo il ritmo impostato da te. Nessun allarme e nessun obbligo.</small></label>}
    </div>
  )
}

export function ConditionPreferences({ profile, onChange }: PreferencesProps) {
  const toggleCondition = (condition: DogCondition) => {
    const conditions = profile.conditions.includes(condition)
      ? profile.conditions.filter((item) => item !== condition)
      : [...profile.conditions, condition]
    const visibleModules = profile.trackedModules.filter((module) => module !== 'needs')
    onChange({ ...profile, conditions, trackedModules: withRequiredModules(visibleModules, conditions) })
  }

  return (
    <div className="tracking-preferences">
      <div className="conditions-picker"><strong>Condizioni particolari <small>opzionali</small></strong><p>Servono solo a mostrare gli strumenti utili. Non sono diagnosi.</p><div>{conditionIds.map((condition) => <label key={condition} className={profile.conditions.includes(condition) ? 'is-active' : ''}><input type="checkbox" checked={profile.conditions.includes(condition)} onChange={() => toggleCondition(condition)} /><span><Check size={13} /></span>{conditionLabels[condition]}</label>)}</div></div>
    </div>
  )
}
