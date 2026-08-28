import { useAppState } from '../state/AppState'

export function CaregiverSwitch() {
  const { caregivers, data, selectCaregiver } = useAppState()
  return <div className="caregiver-switch"><span>Tu sei:</span><div>{caregivers.map((caregiver) => <button key={caregiver.id} className={caregiver.id === data.selectedCaregiverId ? 'is-active' : ''} onClick={() => selectCaregiver(caregiver.id)} aria-pressed={caregiver.id === data.selectedCaregiverId}><span style={{ background: caregiver.color }}>{caregiver.name[0]}</span>{caregiver.name}</button>)}</div></div>
}
