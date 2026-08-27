import { ExternalLink, FileText, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useAppState } from '../state/AppState'
import type { DogDocumentKind } from '../types'

const kindLabels: Record<DogDocumentKind, string> = {
  libretto: 'Libretto sanitario',
  pedigree: 'Pedigree',
  ricevuta: 'Ricevuta',
  altro: 'Altro',
}

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export function DocumentManager() {
  const { data, updateProfile } = useAppState()
  const [kind, setKind] = useState<DogDocumentKind>('libretto')
  const [error, setError] = useState('')
  const profile = data.profile!

  const addDocument = (file?: File) => {
    if (!file) return
    if (file.size > 1_200_000) {
      setError('Scegli una foto sotto 1,2 MB per non riempire la memoria del browser.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      updateProfile({
        ...profile,
        documents: [{ id: createId(), name: file.name, kind, dataUrl: String(reader.result ?? ''), addedAt: new Date().toISOString() }, ...profile.documents],
      })
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const removeDocument = (id: string) => updateProfile({ ...profile, documents: profile.documents.filter((document) => document.id !== id) })

  return (
    <section className="profile-section documents-section">
      <div className="section-title-row"><div><p className="eyebrow">Archivio locale</p><h2>Documenti</h2></div><FileText size={21} /></div>
      <p className="section-explainer">Salva foto di libretto, pedigree o ricevute. Cuccia non legge né interpreta i documenti.</p>
      <div className="document-add"><select value={kind} onChange={(event) => setKind(event.target.value as DogDocumentKind)}>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><label className="button-secondary"><Plus size={16} /> Aggiungi foto<input type="file" accept="image/*" onChange={(event) => addDocument(event.target.files?.[0])} /></label></div>
      {error && <p className="field-error">{error}</p>}
      {profile.documents.length ? <div className="document-list">{profile.documents.map((document) => <article key={document.id}><img src={document.dataUrl} alt="" /><div><strong>{kindLabels[document.kind]}</strong><p>{document.name}</p></div><a className="icon-button" href={document.dataUrl} target="_blank" rel="noreferrer" aria-label={`Apri ${document.name}`}><ExternalLink size={15} /></a><button className="icon-button" onClick={() => removeDocument(document.id)} aria-label={`Rimuovi ${document.name}`}><Trash2 size={15} /></button></article>)}</div> : <div className="empty-inline">Ancora nessun documento. Aggiungilo solo se ti è utile averlo qui.</div>}
    </section>
  )
}
