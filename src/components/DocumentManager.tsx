import { ExternalLink, FileText, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { prepareLocalFile } from '../lib/images'
import { useAppState } from '../state/AppState'
import type { PetDocumentKind } from '../types'

const kindLabels: Record<PetDocumentKind, string> = {
  libretto: 'Libretto sanitario',
  pedigree: 'Pedigree',
  esame: 'Esame',
  ricevuta: 'Ricevuta',
  altro: 'Altro',
}

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export function DocumentManager() {
  const { profile, updateProfile } = useAppState()
  const [kind, setKind] = useState<PetDocumentKind>('libretto')
  const [error, setError] = useState('')
  if (!profile) return null

  const addDocument = async (file?: File) => {
    if (!file) return
    try {
      const dataUrl = await prepareLocalFile(file)
      updateProfile({
        ...profile,
        documents: [{ id: createId(), name: file.name, kind, dataUrl, addedAt: new Date().toISOString() }, ...profile.documents],
      })
      setError('')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Impossibile aggiungere il file.')
    }
  }

  const removeDocument = (id: string) => updateProfile({ ...profile, documents: profile.documents.filter((document) => document.id !== id) })

  return (
    <section className="profile-section documents-section">
      <div className="section-title-row"><div><p className="eyebrow">Archivio locale</p><h2>Documenti</h2></div><FileText size={21} /></div>
      <p className="section-explainer">Cuccia non legge né interpreta i documenti. In questa demo pubblica usa solo immagini fittizie o non sensibili.</p>
      <div className="document-add"><select value={kind} onChange={(event) => setKind(event.target.value as PetDocumentKind)}>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><label className="button-secondary"><Plus size={16} /> Aggiungi file<input type="file" accept="image/*,.pdf" onChange={(event) => void addDocument(event.target.files?.[0])} /></label></div>
      {error && <p className="field-error">{error}</p>}
      {profile.documents.length ? <div className="document-list">{profile.documents.map((document) => <article key={document.id}>{document.dataUrl.startsWith('data:image') ? <img src={document.dataUrl} alt="" /> : <span className="document-file-icon"><FileText size={22} /></span>}<div><strong>{kindLabels[document.kind]}</strong><p>{document.name}</p></div><a className="icon-button" href={document.dataUrl} target="_blank" rel="noreferrer" aria-label={`Apri ${document.name}`}><ExternalLink size={15} /></a><button className="icon-button" onClick={() => removeDocument(document.id)} aria-label={`Rimuovi ${document.name}`}><Trash2 size={15} /></button></article>)}</div> : <div className="empty-inline">Ancora nessun documento. Aggiungilo solo se ti è utile averlo qui.</div>}
    </section>
  )
}
