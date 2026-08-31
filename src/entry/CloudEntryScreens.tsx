import { ArrowLeft, CloudOff, CloudUpload, Download, SearchCheck } from 'lucide-react'
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { buildMigrationPlan } from '../cloud/migrationPlan'
import type { MigrationPlan } from '../cloud/migrationPlan'
import { importMigrationPlan } from '../cloud/migrationRepository'
import { downloadVerifiedBackup } from '../cloud/verifiedBackup'
import type { AppData } from '../types'

const labels = {
  pets: 'Animali', activities: 'Attività', healthEvents: 'Voci Cura', medications: 'Farmaci',
  medicationLogs: 'Dosi', weightLogs: 'Pesi', documents: 'Documenti', contentProgress: 'Progressi',
}

export function LocalDataImportScreen({
  data,
  user,
  onImported,
  onNewPet,
  onSignOut,
}: {
  data: AppData
  user: User
  onImported: () => Promise<void> | void
  onNewPet: () => void
  onSignOut: () => void
}) {
  const [plan, setPlan] = useState<MigrationPlan | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const check = async () => {
    setBusy(true)
    setError('')
    try {
      setPlan(await buildMigrationPlan(data))
      setMessage('Controllo completato: nessun dato è stato ancora caricato.')
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : 'Non riesco a controllare i dati locali.')
    } finally {
      setBusy(false)
    }
  }

  const importNow = async () => {
    if (!plan) return
    setBusy(true)
    setError('')
    try {
      downloadVerifiedBackup(plan.normalized)
      const result = await importMigrationPlan(plan, user)
      setMessage(result.reusedBatch
        ? 'Questi dati erano già presenti: nessun duplicato creato.'
        : 'Importazione verificata. La copia locale resta disponibile.')
      await onImported()
    } catch (importError) {
      setError(`${importError instanceof Error ? importError.message : 'Importazione non riuscita.'} I dati locali sono rimasti intatti.`)
    } finally {
      setBusy(false)
    }
  }

  return <main className="welcome-shell"><section className="welcome-card import-entry-card">
    <div className="welcome-brand"><img src="./dog-icon.svg" alt="" /><span>cuccia</span></div>
    <div className="import-entry-heading"><CloudUpload size={28} /><div><p className="eyebrow">Prima di continuare</p><h1>Portiamo con te i dati locali?</h1></div></div>
    <p>Abbiamo trovato {data.pets.length === 1 ? 'una scheda' : `${data.pets.length} schede`} su questo dispositivo. Puoi importarle senza cancellare la copia locale.</p>
    {!plan ? <button className="button-primary" disabled={busy} onClick={() => void check()}><SearchCheck size={19} /> {busy ? 'Controllo…' : 'Controlla importazione'}</button> : <>
      <dl className="migration-counts">{Object.entries(plan.counts).map(([key, value]) => <div key={key}><dt>{labels[key as keyof typeof labels]}</dt><dd>{value}</dd></div>)}</dl>
      <button className="button-primary" disabled={busy} onClick={() => void importNow()}><Download size={19} /> {busy ? 'Importazione…' : 'Scarica backup e importa'}</button>
    </>}
    <button className="button-secondary" disabled={busy} onClick={onNewPet}>Crea una nuova scheda</button>
    <button className="welcome-back import-signout" disabled={busy} onClick={onSignOut}><ArrowLeft size={18} /> Torna all’accesso</button>
    {message && <p className="welcome-message" role="status">{message}</p>}
    {error && <p className="welcome-error" role="alert">{error}</p>}
  </section></main>
}

export function CloudEntryErrorScreen({ onRetry, onSignOut }: { onRetry: () => void; onSignOut: () => void }) {
  return <main className="welcome-shell"><section className="entry-error-card">
    <CloudOff size={32} />
    <h1>Il cloud non risponde.</h1>
    <p>La copia locale resta al sicuro. Controlla la connessione e riprova.</p>
    <button className="button-primary" onClick={onRetry}>Riprova</button>
    <button className="button-secondary" onClick={onSignOut}>Torna all’accesso</button>
  </section></main>
}
