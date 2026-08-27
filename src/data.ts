import type { CareEventType } from './types'

export const actionLabels: Record<CareEventType, string> = {
  meal: 'Pappa',
  water: 'Acqua',
  pee: 'Pipì',
  poop: 'Cacca',
  walk: 'Passeggiata',
  sleep: 'Sonno',
  grooming: 'Toelettatura/bagno',
  medication: 'Farmaco',
  note: 'Nota',
}

export const feedCopy: Record<CareEventType, string> = {
  meal: 'ha dato la pappa',
  water: 'ha cambiato l’acqua',
  pee: 'ha segnato pipì',
  poop: 'ha segnato cacca',
  walk: 'ha fatto una passeggiata',
  sleep: 'ha segnato il sonno',
  grooming: 'ha registrato la toelettatura',
  medication: 'ha somministrato il farmaco',
  note: 'ha aggiunto una nota',
}

export const caregiverColors = ['#D9694A', '#F2B24C', '#8FA083', '#B9836B']
