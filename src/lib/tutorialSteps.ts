import type { PetSpecies } from '../types'

export interface TutorialStep {
  path: string
  target: string
  eyebrow: string
  title: string
  body: string
}

export const buildTutorialSteps = (name: string, species: PetSpecies): TutorialStep[] => {
  const steps = [
    {
      path: '/', target: 'tutorial-home', section: 'Home',
      title: 'Le date importanti, subito',
      body: 'Qui trovi le scadenze vicine e la Pet Card, senza altre distrazioni.',
    },
    ...(species === 'cane' ? [{
      path: '/', target: 'tutorial-outings', section: 'Home',
      title: 'Le uscite, con calma',
      body: `Imposta gli orari delle uscite: mentre Cuccia è aperta, ti ricordiamo noi quando è il momento di portare fuori ${name}.`,
    }] : []),
    {
      path: '/diario', target: 'tutorial-register', section: 'Diario',
      title: 'Registrare è sempre facoltativo',
      body: 'Quando serve, questo pulsante apre un modulo chiaro con autore, data e ora.',
    },
    {
      path: '/cura?focus=vaccination', target: 'tutorial-care-add', section: 'Cura',
      title: 'Il libretto lo compili tu',
      body: 'Vaccini, visite e terapie entrano solo dopo una tua conferma.',
    },
    {
      path: '/scopri', target: 'tutorial-discover', section: 'Scopri',
      title: 'Idee gentili, senza pressioni',
      body: 'Guide e piccoli giochi restano separati dai dati sanitari.',
    },
  ]

  return steps.map((step, index) => ({
    ...step,
    eyebrow: `${index + 1} di ${steps.length} · ${step.section}`,
  }))
}
