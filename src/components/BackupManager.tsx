import { Download, FileDown, FileUp, Printer, ShieldCheck, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { downloadAppDataBackup } from '../lib/backupDownload'
import { formatDate } from '../lib/date'
import { useAppState } from '../state/AppState'

function BackupReport({ onClose }: { onClose: () => void }) {
  const { data, caregivers } = useAppState()
  return <div className="backup-report-layer" role="dialog" aria-modal="true" aria-label="Riepilogo dati">
    <div className="backup-report-actions"><button className="button-secondary" onClick={onClose}><X size={18} /> Chiudi</button><button className="button-primary" onClick={() => window.print()}><Printer size={18} /> Stampa / salva PDF</button></div>
    <main className="print-export-report">
      <header><img src="./dog-icon.svg" alt="" /><div><p className="eyebrow">Cuccia · copia leggibile</p><h1>Riepilogo completo</h1><p>Creato il {new Intl.DateTimeFormat('it-IT', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}</p></div></header>
      <section><h2>Famiglia</h2><p>{caregivers.map((caregiver) => `${caregiver.name} (${caregiver.role})`).join(' · ') || 'Nessuna persona inserita'}</p></section>
      {data.pets.map((pet) => <article key={pet.id} className="backup-pet-report">
        <h2>{pet.profile.name} · {pet.profile.species}</h2>
        <dl><div><dt>Nascita</dt><dd>{pet.profile.birthDate ? formatDate(pet.profile.birthDate) : 'Non inserita'}</dd></div><div><dt>Microchip</dt><dd>{pet.profile.microchip || 'Non inserito'}</dd></div><div><dt>Veterinario</dt><dd>{pet.profile.vetName || 'Non inserito'} {pet.profile.vetPhone}</dd></div><div><dt>Emergenza</dt><dd>{pet.profile.emergencyContact || 'Non inserita'}</dd></div><div><dt>Allergie</dt><dd>{pet.profile.allergies || 'Nessuna inserita'}</dd></div><div><dt>Note sanitarie</dt><dd>{pet.profile.medicalNotes || 'Nessuna inserita'}</dd></div></dl>
        <h3>Cura</h3><p>{pet.health.vaccinations.length} vaccinazioni · {pet.health.preventions.length} prevenzioni · {pet.health.medications.length} terapie · {pet.health.visits.length} visite · {pet.health.weights.length} pesi</p>
        <h3>Diario</h3><p>{pet.events.filter((event) => !event.deletedAt).length} eventi attivi · {pet.events.filter((event) => event.deletedAt).length} eliminati conservati nell’audit</p>
        <h3>Documenti</h3><p>{pet.profile.documents.length + Object.values(pet.health).flat().reduce((count, record) => count + record.documents.length, 0)} allegati locali</p>
      </article>)}
      <footer>Il PDF è una copia leggibile. Per ripristinare i dati usa sempre il backup JSON.</footer>
    </main>
  </div>
}

export function BackupManager() {
  const { data, importBackup } = useAppState()
  const [reportOpen, setReportOpen] = useState(false)
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const exportJson = () => {
    downloadAppDataBackup(data)
    setMessage('Backup JSON scaricato. Conservalo in un posto sicuro.')
  }

  const importFile = async (file?: File) => {
    if (!file) return
    try {
      const json = await file.text()
      if (!window.confirm('Importare questo backup e sostituire i dati presenti nel browser?')) return
      importBackup(json)
      setMessage('Backup importato correttamente.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Non riesco a leggere questo backup.')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return <>
    <section className="profile-section backup-section">
      <div className="section-title-row"><div><p className="eyebrow">Rete di sicurezza</p><h2>Backup ed export</h2></div><ShieldCheck size={23} /></div>
      <p className="section-explainer">Cuccia crea una copia locale a ogni modifica. Scarica anche un JSON re-importabile prima di cambiare browser o dispositivo.</p>
      <div className="backup-actions"><button className="button-primary" onClick={exportJson}><Download size={19} /> Esporta tutto in JSON</button><button className="button-secondary" onClick={() => inputRef.current?.click()}><FileUp size={19} /> Importa JSON</button><button className="button-secondary" onClick={() => setReportOpen(true)}><FileDown size={19} /> Crea PDF leggibile</button><input ref={inputRef} type="file" accept="application/json,.json" onChange={(event) => void importFile(event.target.files?.[0])} /></div>
      {message && <p className="backup-message" role="status">{message}</p>}
    </section>
    {reportOpen && <BackupReport onClose={() => setReportOpen(false)} />}
  </>
}
