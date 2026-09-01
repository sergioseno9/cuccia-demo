import { Check } from 'lucide-react'
import {
  conditionIds,
  conditionLabels,
  lifePhaseIds,
  lifePhaseLabel,
} from '../lib/profile'
import type { LifePhase, PetCondition, PetProfile } from '../types'

interface PreferencesProps {
  profile: PetProfile
  onChange: (profile: PetProfile) => void
}

const phaseDescriptions: Record<LifePhase, string> = {
  cucciolo: 'Più routine e guide vicine.',
  adulto: 'Scadenze e riepiloghi essenziali.',
  senior: 'Terapie, visite e peso in vista.',
}

export function PhasePicker({ profile, onChange }: PreferencesProps) {
  const selectPhase = (lifePhase: LifePhase) => onChange({ ...profile, lifePhase })

  return <div className="phase-picker">{lifePhaseIds.map((phase) => <button type="button" key={phase} className={profile.lifePhase === phase ? 'is-active' : ''} onClick={() => selectPhase(phase)} aria-pressed={profile.lifePhase === phase}><span>{lifePhaseLabel(phase, profile.species)}</span><small>{phaseDescriptions[phase]}</small></button>)}</div>
}

export function ConditionPreferences({ profile, onChange }: PreferencesProps) {
  const toggleCondition = (condition: PetCondition) => {
    const conditions = profile.conditions.includes(condition)
      ? profile.conditions.filter((item) => item !== condition)
      : [...profile.conditions, condition]
    onChange({ ...profile, conditions })
  }

  return (
    <div className="tracking-preferences">
      <div className="conditions-picker"><strong>Condizioni particolari <small>opzionali</small></strong><p>Servono solo a mostrare gli strumenti utili. Non sono diagnosi.</p><div>{conditionIds.map((condition) => <label key={condition} className={profile.conditions.includes(condition) ? 'is-active' : ''}><input type="checkbox" checked={profile.conditions.includes(condition)} onChange={() => toggleCondition(condition)} /><span><Check size={13} /></span>{conditionLabels[condition]}</label>)}</div></div>
    </div>
  )
}
