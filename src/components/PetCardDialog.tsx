import { Printer, Share2 } from 'lucide-react'
import { useState } from 'react'
import { sharePetCard } from '../lib/sharePetCard'
import { PetCard } from './PetCard'
import { Modal } from './Modal'
import { useAppState } from '../state/AppState'

export function PetCardDialog({ onClose }: { onClose: () => void }) {
  const { activePet } = useAppState()
  const [shareStatus, setShareStatus] = useState('')
  if (!activePet) return null

  const handleShare = async () => {
    setShareStatus('')
    try {
      const result = await sharePetCard(activePet.profile, activePet.health.medications)
      if (result === 'copied') setShareStatus('Pet Card copiata: puoi incollarla dove preferisci.')
      if (result === 'downloaded') setShareStatus('Pet Card salvata come file di testo.')
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setShareStatus('Non riesco a condividere ora. Puoi usare Stampa / salva PDF.')
    }
  }

  return <Modal
    title={`Pet Card di ${activePet.profile.name}`}
    onClose={onClose}
    footer={<div className="pet-card-actions"><button className="button-primary print-trigger" onClick={() => window.print()}><Printer size={20} /> Stampa / salva PDF</button><button className="button-secondary" onClick={() => void handleShare()}><Share2 size={20} /> Invia / Condividi</button></div>}
  ><div className="pet-card-dialog">
    <p className="form-intro">Pronta da condividere · funziona offline</p>
    <PetCard profile={activePet.profile} medications={activePet.health.medications} />
    {shareStatus && <p className="pet-card-share-status" role="status">{shareStatus}</p>}
  </div></Modal>
}
