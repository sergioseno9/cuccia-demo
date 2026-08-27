import { PetCard } from './PetCard'
import { Modal } from './Modal'
import { useAppState } from '../state/AppState'

export function PetCardDialog({ onClose }: { onClose: () => void }) {
  const { data } = useAppState()
  return <Modal title="Pet Card pronta da condividere" onClose={onClose}><div className="pet-card-dialog"><p className="form-intro">Apri la stampa e scegli “Salva come PDF”, anche senza connessione.</p><PetCard profile={data.profile!} medications={data.health.medications} /></div></Modal>
}
