import { CheckCircle2, CloudUpload, Download, SearchCheck } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { loadCloudLink } from '../cloud/cloudLink'
import { buildMigrationPlan } from '../cloud/migrationPlan'
import type { MigrationPlan } from '../cloud/migrationPlan'
import { importMigrationPlan } from '../cloud/migrationRepository'
import { downloadVerifiedBackup } from '../cloud/verifiedBackup'
import { useAppState } from '../state/AppState'

const countLabels = {
  pets: 'Animali', activities: 'Attività', healthEvents: 'Voci Cura', medications: 'Farmaci',
  medicationLogs: 'Dosi', weightLogs: 'Pesi', documents: 'Documenti', contentProgress: 'Progressi Scopri',
}

const errorMessage = (error: unknown) => error instanceof Error
  ? error.message
  : 'Importazione non riuscita. La copia locale è rimasta intatta.'

export function CloudMigrationPanel() {
  const { data } = useAppState()
  const { user } = useAuth()
  const [plan, setPlan] = useState<MigrationPlan | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [link, setLink] = useState(loadCloudLink)
  if (!user) return null

  const dryRun = async () => {
    setBusy(true)
    setMessage('')
    try {
      const nextPlan = await buildMigrationPlan(data)
      setPlan(nextPlan)
      setMessage('Controllo completato: nessun dato è stato ancora caricato.')
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const importNow = async () => {
    if (!plan) return
    setBusy(true)
    setMessage('')
    try {
      downloadVerifiedBackup(plan.normalized)
      const result = await importMigrationPlan(plan, user)
      setLink(result.link)
      setMessage(result.reusedBatch
        ? 'Importazione già presente: nessun duplicato creato.'
        : 'Importazione verificata. Il backup locale resta disponibile.')
    } catch (error) {
      setMessage(`${errorMessage(error)} L’eventuale batch incompleto è stato annullato.`)
    } finally {
      setBusy(false)
    }
  }

  return <div className="cloud-migration-panel">
    <div className="cloud-migration-title"><CloudUpload size={21} /><div><strong>Porta i dati nel cloud</strong><p>Solo su tua conferma, dopo un controllo senza scritture.</p></div></div>
    {link?.userId === user.id && <p className="cloud-link-state"><CheckCircle2 size={18} /> Cloud collegato · backup locale conservato</p>}
    <button className="button-secondary" disabled={busy} onClick={() => void dryRun()}><SearchCheck size={18} /> Controlla importazione</button>
    {plan && <><dl className="migration-counts">{Object.entries(plan.counts).map(([key, value]) => <div key={key}><dt>{countLabels[key as keyof typeof countLabels]}</dt><dd>{value}</dd></div>)}</dl><button className="button-primary" disabled={busy} onClick={() => void importNow()}><Download size={18} /> Scarica backup e importa</button></>}
    {message && <p className="cloud-account-message" role="status">{message}</p>}
  </div>
}
