import { Cloud, Download, HardDrive, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useEntryMode } from '../entry/EntryContext'
import { downloadAppDataBackup } from '../lib/backupDownload'
import { useAppState } from '../state/AppState'

export function DataResetCard() {
  const { data, resetAll } = useAppState()
  const { guestMode, resetCloudData } = useEntryMode()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const exportBackup = () => {
    downloadAppDataBackup(data)
    setMessage('Backup JSON scaricato. Conservalo prima di continuare.')
  }

  const confirmReset = async () => {
    setBusy(true)
    setMessage('')
    try {
      if (guestMode) resetAll()
      else await resetCloudData()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Azzeramento non riuscito. I dati non sono stati modificati.')
      setBusy(false)
    }
  }

  const title = guestMode ? 'Azzera dati locali' : 'Azzera i dati del mio account'
  const copy = guestMode
    ? 'Cancella da questo browser tutte le schede, Cura e Diario. Non coinvolge alcun account cloud.'
    : 'Cancella dal tuo account cloud pet, Diario, Cura e documenti. L’account resta attivo e ripartirai dall’onboarding.'

  return <section className="settings-card reset-section">
    <div className="settings-card-heading">
      <span className="settings-icon tone-clay">{guestMode ? <HardDrive size={22} /> : <Cloud size={22} />}</span>
      <div><h2>{title}</h2><p>{copy}</p></div>
    </div>

    <button className="button-secondary reset-backup-button" type="button" onClick={exportBackup}><Download size={18} /> Scarica prima un backup JSON</button>

    {confirming ? <div className="reset-confirmation">
      <p><strong>{guestMode ? 'Questa azione cancellerà i dati da questo browser.' : 'Questa azione eliminerà i dati del tuo account cloud.'}</strong> Non si può annullare.</p>
      <div className="reset-actions"><button className="button-secondary" type="button" disabled={busy} onClick={() => setConfirming(false)}>Annulla</button><button className="danger-button" type="button" disabled={busy} onClick={() => void confirmReset()}>{busy ? 'Azzeramento…' : 'Conferma'}</button></div>
    </div> : <button className="text-button danger-text reset-start-button" type="button" onClick={() => setConfirming(true)}><RotateCcw size={18} /> {title}</button>}

    {message && <p className="reset-message" role="status">{message}</p>}
  </section>
}
