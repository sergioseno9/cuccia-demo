import type { AppData, CareEvent, DogProfile, HealthData } from '../types'
import { isoDateFromNow } from './date'

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString()

export const createDemoProfile = (): DogProfile => ({
  createdAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
  lifePhase: 'adulto',
  trackedModules: ['outings', 'water', 'weight', 'grooming'],
  conditions: [],
  conditionNotes: '',
  outingIntervalHours: 3,
  name: 'Milo',
  photo: '',
  birthDate: isoDateFromNow(-900),
  sex: 'male',
  breed: 'Meticcio',
  size: 'medium',
  weight: '7.4',
  microchip: '380260101234567',
  vetName: 'Dott.ssa Elena Riva',
  vetPhone: '+39 02 555 0198',
  emergencyContact: 'Clinica Veterinaria Aurora · +39 02 555 0110',
  groomerName: 'Bagno Bau',
  groomerPhone: '+39 02 555 0142',
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
  caregivers: [
    { id: 'giulia', name: 'Giulia', role: 'Genitore', color: '#D9694A' },
    { id: 'marco', name: 'Marco', role: 'Genitore', color: '#F2B24C' },
    { id: 'nonna', name: 'Nonna', role: 'Supporto', color: '#8FA083' },
  ],
})

export const createDemoHealth = (): HealthData => ({
  vaccinations: [
    {
      id: 'vax-1',
      name: 'Vaccino polivalente',
      administeredDate: isoDateFromNow(-24),
      nextDate: isoDateFromNow(17),
      notes: 'Richiamo indicato dal veterinario.',
    },
  ],
  preventions: [
    {
      id: 'prev-1',
      kind: 'Pulci e zecche',
      product: 'Compresse mensili',
      lastDate: isoDateFromNow(-27),
      intervalDays: 30,
    },
    {
      id: 'prev-2',
      kind: 'Sverminazione',
      product: 'Prodotto indicato dal veterinario',
      lastDate: isoDateFromNow(-45),
      intervalDays: 90,
    },
  ],
  medications: [
    {
      id: 'med-1',
      name: 'Integratore cucciolo',
      dose: '1 compressa',
      times: ['08:00', '20:00'],
      startDate: isoDateFromNow(-5),
      endDate: isoDateFromNow(10),
      active: true,
    },
  ],
  visits: [
    {
      id: 'visit-1',
      title: 'Controllo crescita',
      date: isoDateFromNow(2),
      notes: 'Portare il libretto sanitario.',
    },
    {
      id: 'visit-0',
      title: 'Prima visita',
      date: isoDateFromNow(-35),
      notes: 'Controllo generale regolare.',
    },
  ],
  weights: [
    { id: 'weight-1', value: 5.8, date: isoDateFromNow(-42) },
    { id: 'weight-2', value: 6.6, date: isoDateFromNow(-21) },
    { id: 'weight-3', value: 7.4, date: isoDateFromNow(0) },
  ],
})

export const createDemoEvents = (): CareEvent[] => [
  { id: 'event-1', type: 'note', caregiverId: 'giulia', happenedAt: minutesAgo(18), note: 'Tutto tranquillo a casa.' },
  { id: 'event-2', type: 'meal', caregiverId: 'marco', happenedAt: minutesAgo(31) },
  { id: 'event-3', type: 'walk', caregiverId: 'nonna', happenedAt: minutesAgo(76), durationMin: 32 },
  { id: 'event-4', type: 'water', caregiverId: 'giulia', happenedAt: minutesAgo(112) },
  { id: 'event-5', type: 'walk', caregiverId: 'marco', happenedAt: minutesAgo(240), durationMin: 18 },
  { id: 'event-6', type: 'meal', caregiverId: 'giulia', happenedAt: minutesAgo(275) },
  { id: 'event-7', type: 'walk', caregiverId: 'giulia', happenedAt: minutesAgo(410), durationMin: 22 },
  { id: 'event-8', type: 'water', caregiverId: 'marco', happenedAt: minutesAgo(440) },
  { id: 'event-9', type: 'grooming', caregiverId: 'nonna', happenedAt: minutesAgo(1_500), note: 'Spazzolatura' },
  { id: 'event-10', type: 'walk', caregiverId: 'marco', happenedAt: minutesAgo(1_640), durationMin: 27 },
]

export const createDemoData = (): AppData => ({
  profile: createDemoProfile(),
  selectedCaregiverId: 'giulia',
  events: createDemoEvents(),
  health: createDemoHealth(),
})
