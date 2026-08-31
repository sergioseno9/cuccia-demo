import { CircleHelp, PawPrint, SlidersHorizontal, Trash2 } from 'lucide-react'
import { conditionLabels, lifePhaseLabel, moduleLabels, trackedModuleIds } from '../lib/profile'
import { useAppState } from '../state/AppState'
import { BackupManager } from './BackupManager'
import { CloudAccountPanel } from './CloudAccountPanel'
import { DataResetCard } from './DataResetCard'
import { DocumentManager } from './DocumentManager'
import { OutingScheduleEditor } from './OutingScheduleEditor'

export function ProfileSettingsPanel({ onEdit }: { onEdit: () => void }) {
  const { data, profile, removePet, restartTutorial } = useAppState()
  if (!profile) return null
  const visibleModules = trackedModuleIds(profile.species).filter((module) => profile.trackedModules.includes(module))

  return <div className="settings-panel">
    <CloudAccountPanel />

    <section className="settings-card tracking-summary">
      <div className="settings-card-heading"><span className="settings-icon tone-sage"><SlidersHorizontal size={22} /></span><div><h2>Cosa seguo per {profile.name}</h2><p>{lifePhaseLabel(profile.lifePhase, profile.species)} · preferenze attive</p></div></div>
      <div className="tracking-chip-list">{visibleModules.map((module) => <span key={module}>{moduleLabels[module]}</span>)}</div>
      {profile.conditions.length > 0 && <p className="settings-summary-copy">{profile.conditions.map((condition) => conditionLabels[condition]).join(' · ')}</p>}
      <button className="button-secondary" onClick={onEdit}>Modifica preferenze</button>
    </section>

    <OutingScheduleEditor />
    <DocumentManager />
    <BackupManager />

    <section className="settings-card tutorial-replay-section">
      <div className="settings-card-heading"><span className="settings-icon tone-honey"><CircleHelp size={22} /></span><div><h2>Tutorial</h2><p>Rivedi i passaggi iniziali quando vuoi.</p></div></div>
      <button className="button-secondary" onClick={restartTutorial}>Rivedi tutorial</button>
    </section>

    <section className="settings-card pet-removal-section">
      <div className="settings-card-heading"><span className="settings-icon tone-blue"><PawPrint size={22} /></span><div><h2>Schede animali</h2><p>Gestisci le schede presenti su questo dispositivo.</p></div></div>
      <div className="settings-pet-list">{data.pets.map((pet) => <div key={pet.id}><strong>{pet.profile.name}</strong><span>{pet.profile.species}</span>{data.pets.length > 1 && <button className="text-button danger-text" onClick={() => window.confirm(`Rimuovere la scheda di ${pet.profile.name}?`) && removePet(pet.id)}><Trash2 size={18} /> Rimuovi</button>}</div>)}</div>
    </section>

    <DataResetCard />

    <p className="profile-footnote">Prima di modifiche importanti, conserva sempre un backup JSON.</p>
  </div>
}
