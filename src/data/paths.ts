export interface TrainingPath {
  id: string
  title: string
  description: string
  trickIds: string[]
}

export const trainingPaths: TrainingPath[] = [
  {
    id: 'cucciolo-arrivato',
    title: 'Cucciolo appena arrivato',
    description: 'Tre basi brevi per comunicare e creare una routine serena.',
    trickIds: ['seduto', 'richiamo', 'al-posto'],
  },
  {
    id: 'le-basi',
    title: 'Le basi',
    description: 'Una piccola sequenza utile nella vita quotidiana, senza fretta.',
    trickIds: ['seduto', 'terra', 'resta', 'richiamo', 'lascia'],
  },
  {
    id: 'passeggiata-tranquilla',
    title: 'Passeggiata tranquilla',
    description: 'Collaborazione, richiamo e guinzaglio morbido in luoghi sicuri.',
    trickIds: ['richiamo', 'lascia', 'guinzaglio'],
  },
]
