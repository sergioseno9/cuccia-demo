import type { AppData, CareEvent, HealthData, PetData, PetProfile } from '../types'
import { isoDateFromNow } from './date.ts'

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString()

export const createDemoProfile = (): PetProfile => ({
  id: 'milo',
  createdAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
  species: 'cane',
  lifePhase: 'adulto',
  trackedModules: ['outings', 'weight', 'grooming'],
  conditions: [],
  conditionNotes: '',
  medicalNotes: 'Nessuna condizione aggiunta.',
  outingIntervalHours: 3,
  outingSchedules: [
    { id: 'outing-morning', time: '08:45', reminderEnabled: true },
    { id: 'outing-evening', time: '21:00', reminderEnabled: false },
  ],
  name: 'Milo',
  photo: '',
  birthDate: isoDateFromNow(-900),
  sex: 'male',
  breed: 'Meticcio',
  size: 'medium',
  weight: '7.4',
  microchip: '000000000000000',
  vetName: 'Veterinario demo',
  vetPhone: '+39 000 000 0000',
  emergencyContact: 'Clinica demo · +39 000 000 0000',
  groomerName: 'Toelettatore demo',
  groomerPhone: '+39 000 000 0000',
  feeding: {
    food: 'Crocchette complete',
    portion: '120 g al giorno',
    schedule: 'Mattina e sera',
    notes: 'Acqua fresca sempre disponibile.',
  },
  allergies: 'Nessuna allergia nota',
  notes: 'Socievole, abituato alle uscite in città e ai viaggi brevi.',
  annualCheckDate: isoDateFromNow(45),
  insuranceRenewalDate: isoDateFromNow(110),
  microchipRenewalDate: isoDateFromNow(180),
  documents: [],
})

export const createDemoHealth = (): HealthData => ({
  vaccinations: [{
    id: 'vax-1',
    name: 'Vaccino polivalente',
    administeredDate: isoDateFromNow(-24),
    nextDate: isoDateFromNow(17),
    lotNumber: 'LOTTO-DEMO',
    expiryDate: isoDateFromNow(160),
    notes: 'Richiamo indicato dal veterinario.',
    documents: [],
  }],
  preventions: [
    {
      id: 'prev-1', kind: 'Pulci e zecche', product: 'Compresse mensili',
      lastDate: isoDateFromNow(-27), intervalDays: 30, seasonalPause: false, documents: [],
    },
    {
      id: 'prev-2', kind: 'Sverminazione', product: 'Prodotto indicato dal veterinario',
      lastDate: isoDateFromNow(-45), intervalDays: 90, seasonalPause: false, documents: [],
    },
  ],
  medications: [{
    id: 'med-1', name: 'Integratore demo', dose: '1 compressa', times: ['08:00', '20:00'],
    startDate: isoDateFromNow(-5), endDate: isoDateFromNow(10), active: true, documents: [],
  }],
  visits: [
    { id: 'visit-1', title: 'Controllo', date: isoDateFromNow(2), notes: 'Portare il libretto sanitario.', documents: [] },
    { id: 'visit-0', title: 'Prima visita', date: isoDateFromNow(-35), notes: 'Controllo generale regolare.', documents: [] },
  ],
  weights: [
    { id: 'weight-1', value: 5.8, date: isoDateFromNow(-42), documents: [] },
    { id: 'weight-2', value: 6.6, date: isoDateFromNow(-21), documents: [] },
    { id: 'weight-3', value: 7.4, date: isoDateFromNow(0), documents: [] },
  ],
  grooming: [{
    id: 'grooming-1', title: 'Bagno e spazzolatura', lastDate: isoDateFromNow(-18),
    intervalWeeks: 4, notes: 'Prodotti delicati.', documents: [],
  }],
})

export const createDemoEvents = (): CareEvent[] => [
  { id: 'event-1', type: 'note', caregiverId: 'giulia', happenedAt: minutesAgo(18), note: 'Tutto tranquillo a casa.' },
  { id: 'event-2', type: 'meal', caregiverId: 'marco', happenedAt: minutesAgo(31) },
  { id: 'event-3', type: 'walk', caregiverId: 'nonna', happenedAt: minutesAgo(76), durationMin: 32 },
  { id: 'event-5', type: 'walk', caregiverId: 'marco', happenedAt: minutesAgo(240), durationMin: 18 },
  { id: 'event-6', type: 'meal', caregiverId: 'giulia', happenedAt: minutesAgo(275) },
  { id: 'event-10', type: 'walk', caregiverId: 'marco', happenedAt: minutesAgo(1_640), durationMin: 27 },
]

const createDemoPet = (): PetData => ({
  id: 'milo',
  profile: createDemoProfile(),
  events: createDemoEvents(),
  health: createDemoHealth(),
  trickProgress: {},
  badges: [],
})

export const createDemoData = (): AppData => ({
  schemaVersion: 2,
  household: { caregivers: [
    { id: 'giulia', name: 'Giulia', role: 'Famiglia', color: '#D9694A' },
    { id: 'marco', name: 'Marco', role: 'Famiglia', color: '#F2B24C' },
    { id: 'nonna', name: 'Nonna', role: 'Supporto', color: '#8FA083' },
  ] },
  pets: [createDemoPet()],
  selectedPetId: 'milo',
  selectedCaregiverId: 'giulia',
  tutorialDone: false,
})
