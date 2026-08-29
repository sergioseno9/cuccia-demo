import type { MedicationRecord, PetProfile } from '../types'

export type PetCardShareResult = 'shared' | 'copied' | 'downloaded'

const safeFilename = (value: string) => value.toLocaleLowerCase('it-IT')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')

const petCardText = (profile: PetProfile, medications: MedicationRecord[]) => {
  const activeMedications = medications.filter((record) => record.active)
  const feeding = [profile.feeding.food, profile.feeding.portion, profile.feeding.schedule, profile.feeding.notes].filter(Boolean).join(' · ')
  return [
    `Pet Card di ${profile.name}`,
    `Microchip: ${profile.microchip || 'Non inserito'}`,
    `Veterinario: ${profile.vetName || 'Non inserito'} · ${profile.vetPhone || 'Telefono non inserito'}`,
    `Emergenza: ${profile.emergencyContact || 'Non inserita'}`,
    `Farmaci in corso: ${activeMedications.length ? activeMedications.map((record) => `${record.name} · ${record.dose}`).join(', ') : 'Nessuno inserito'}`,
    `Allergie: ${profile.allergies || 'Nessuna inserita'}`,
    `Alimentazione: ${feeding || 'Non inserita'}`,
    ...(profile.notes ? [`Note utili: ${profile.notes}`] : []),
  ].join('\n')
}

export const sharePetCard = async (profile: PetProfile, medications: MedicationRecord[]): Promise<PetCardShareResult> => {
  const text = petCardText(profile, medications)
  if (navigator.share) {
    await navigator.share({ title: `Pet Card di ${profile.name}`, text })
    return 'shared'
  }
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)
    return 'copied'
  }
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${safeFilename(profile.name)}-pet-card.txt`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1_000)
  return 'downloaded'
}
