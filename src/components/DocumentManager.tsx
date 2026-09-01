import { ExternalLink, FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { prepareLocalFile } from '../lib/images'
import { useAppState } from '../state/AppState'
import type { PetDocument, PetDocumentKind } from '../types'

const kindLabels: Record<PetDocumentKind, string> = {
  libretto: 'Libretto sanitario',
  pedigree: 'Pedigree',
  esame: 'Esame',
  ricevuta: 'Ricevuta',
  altro: 'Altro',
}

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export function DocumentManager({ hideTitle = false }: { hideTitle?: boolean }) {
  const { profile, addDocument: saveDocument, updateDocument, deleteDocument } = useAppState()
  const [kind, setKind] = useState<PetDocumentKind>('libretto')
  const [editing, setEditing] = useState<PetDocument | null>(null)
  const [error, setError] = useState('')
  if (!profile) return null

  const addDocumentFile = async (file?: File) => {
    if (!file) return
    try {
      const dataUrl = await prepareLocalFile(file)
      saveDocument({ id: createId(), name: file.name, kind, dataUrl, addedAt: new Date().toISOString() })
      setError('')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Impossibile aggiungere il file.')
    }
  }

  const removeDocument = (document: PetDocument) => {
    if (window.confirm(`Eliminare “${document.name}”? L’azione non si può annullare.`)) deleteDocument(document.id)
  }

  const saveEdit = () => {
    if (!editing?.name.trim()) return
    updateDocument({ ...editing, name: editing.name.trim() })
    setEditing(null)
  }

  return (
    <section className="profile-section documents-section">
      {!hideTitle && <div className="section-title-row"><div><p className="eyebrow">Archivio locale</p><h2>Documenti</h2></div><FileText size={21} /></div>}
      <p className="section-explainer">Cuccia non legge né interpreta i documenti. In questa demo pubblica usa solo immagini fittizie o non sensibili.</p>
      <div className="document-add"><select value={kind} onChange={(event) => setKind(event.target.value as PetDocumentKind)}>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><label className="button-secondary"><Plus size={16} /> Aggiungi file<input type="file" accept="image/*,.pdf" onChange={(event) => void addDocumentFile(event.target.files?.[0])} /></label></div>
      {error && <p className="field-error">{error}</p>}
      {editing && <div className="document-edit-row"><label className="field"><span>Nome file</span><input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></label><label className="field"><span>Tipo</span><select value={editing.kind} onChange={(event) => setEditing({ ...editing, kind: event.target.value as PetDocumentKind })}>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div><button className="button-secondary" onClick={() => setEditing(null)}>Annulla</button><button className="button-primary" onClick={saveEdit}>Salva</button></div></div>}
      {profile.documents.length ? <div className="document-list">{profile.documents.map((document) => <article key={document.id}>{document.dataUrl.startsWith('data:image') ? <img src={document.dataUrl} alt="" /> : <span className="document-file-icon"><FileText size={22} /></span>}<div><strong>{kindLabels[document.kind]}</strong><p>{document.name}</p></div><a className="icon-button" href={document.dataUrl} target="_blank" rel="noreferrer" aria-label={`Apri ${document.name}`}><ExternalLink size={17} /></a><button className="icon-button" onClick={() => setEditing(document)} aria-label={`Modifica ${document.name}`}><Pencil size={17} /></button><button className="icon-button" onClick={() => removeDocument(document)} aria-label={`Elimina ${document.name}`}><Trash2 size={17} /></button></article>)}</div> : <div className="empty-inline">Ancora nessun documento. Aggiungilo solo se ti è utile averlo qui.</div>}
    </section>
  )
}
