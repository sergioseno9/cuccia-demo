import type { PetSpecies, QuizAxisVector } from '../types'

export type QuizAxis = keyof QuizAxisVector

export interface QuizOption {
  id: string
  label: string
  weights: Partial<QuizAxisVector>
}

export interface QuizQuestion {
  id: string
  prompt: string
  options: QuizOption[]
}

export interface QuizArchetype {
  id: string
  priority: number
  emoji: string
  name: string
  description: string
  signature: QuizAxisVector
  seenFrom: string
  compatibleId: string
}

const commonQuestions: Record<'q1' | 'q3' | 'q5' | 'q6', QuizQuestion> = {
  q1: {
    id: 'q1',
    prompt: 'Il suo momento preferito della giornata?',
    options: [
      { id: 'a', label: 'Spaparanzato al suo posto', weights: { E: -2 } },
      { id: 'b', label: 'Correre e fare il matto', weights: { E: 2, C: 0.5 } },
      { id: 'c', label: 'Starti appiccicato ovunque vai', weights: { S: -2, E: -0.5 } },
      { id: 'd', label: 'Esplorare e annusare ogni angolo', weights: { F: 1, E: 1 } },
    ],
  },
  q3: {
    id: 'q3',
    prompt: 'Lasci il cibo incustodito sul tavolo…',
    options: [
      { id: 'a', label: 'Non lo tocca, un santo', weights: { F: -2 } },
      { id: 'b', label: 'Aspetta che esci dalla stanza e colpisce (premeditato)', weights: { F: 2, C: 0.5 } },
      { id: 'c', label: 'Ti guarda negli occhi e lo prende lo stesso', weights: { F: 1, C: 1 } },
      { id: 'd', label: 'Non ci pensa proprio, testa fra le nuvole', weights: { F: -1, E: -0.5 } },
    ],
  },
  q5: {
    id: 'q5',
    prompt: "L'aspirapolvere (o il phon)…",
    options: [
      { id: 'a', label: 'Nemico giurato: lo attacca', weights: { C: 1, E: 1 } },
      { id: 'b', label: 'Terrore assoluto, sparisce', weights: { C: -2 } },
      { id: 'c', label: 'Totale indifferenza', weights: { E: -1, C: 0.5 } },
      { id: 'd', label: 'Curiosità: lo annusa e indaga', weights: { F: 0.5, C: 0.5, E: 0.5 } },
    ],
  },
  q6: {
    id: 'q6',
    prompt: 'Se avesse un lavoro, sarebbe…',
    options: [
      { id: 'a', label: 'Animatore / influencer', weights: { S: 1, E: 1 } },
      { id: 'b', label: 'Guardia del corpo', weights: { C: 2 } },
      { id: 'c', label: 'Critico gastronomico', weights: { F: 1, E: -0.5 } },
      { id: 'd', label: 'Filosofo in pensione', weights: { E: -2 } },
      { id: 'e', label: 'Ladro gentiluomo', weights: { F: 2 } },
      { id: 'f', label: 'Lupo solitario / libero professionista', weights: { S: -1.5, C: 1 } },
    ],
  },
}

const dogQuestions: Record<'q2' | 'q4', QuizQuestion> = {
  q2: {
    id: 'q2', prompt: 'Suona il citofono. Lui o lei…',
    options: [
      { id: 'a', label: 'Abbaia come se arrivasse un drago', weights: { C: 2 } },
      { id: 'b', label: 'Corre a nascondersi', weights: { C: -2, S: -0.5 } },
      { id: 'c', label: 'Va alla porta scodinzolando: ospiti!', weights: { S: 2, C: 0.5 } },
      { id: 'd', label: 'Alza un orecchio e continua a dormire', weights: { E: -1, C: 0.5 } },
    ],
  },
  q4: {
    id: 'q4', prompt: 'Al parco, con altri animali…',
    options: [
      { id: 'a', label: "Saluta tutti, è l'anima della festa", weights: { S: 2, E: 1 } },
      { id: 'b', label: 'Resta vicino a te e osserva', weights: { S: -1, C: -0.5 } },
      { id: 'c', label: "Sceglie lui con chi degnarsi, un po' snob", weights: { S: -1, F: 1, C: 0.5 } },
      { id: 'd', label: 'Parte in quarta e travolge tutti', weights: { E: 2, C: 1 } },
    ],
  },
}

const catQuestions: Record<'q2' | 'q4', QuizQuestion> = {
  q2: {
    id: 'q2', prompt: 'Un gatto sconosciuto compare in giardino o dalla finestra…',
    options: [
      { id: 'a', label: 'Soffia e difende il territorio', weights: { C: 2 } },
      { id: 'b', label: 'Scappa e si nasconde sotto il letto', weights: { C: -2, S: -0.5 } },
      { id: 'c', label: 'Va al vetro incuriosito, vuole fare amicizia', weights: { S: 2 } },
      { id: 'd', label: 'Lo ignora con aria di superiorità', weights: { E: -1, F: 0.5 } },
    ],
  },
  q4: {
    id: 'q4', prompt: 'Quando arrivano ospiti a casa…',
    options: [
      { id: 'a', label: 'Si presenta subito, giro di coccole per tutti', weights: { S: 2, E: 0.5 } },
      { id: 'b', label: 'Sparisce e ricompare a fine serata', weights: { S: -1, C: -0.5 } },
      { id: 'c', label: "Osserva dall'alto dell'armadio, giudicando", weights: { S: -1, F: 1 } },
      { id: 'd', label: 'Fa il pagliaccio per rubare la scena', weights: { S: 1, E: 1 } },
    ],
  },
}

export const getQuizQuestions = (species: PetSpecies): QuizQuestion[] => {
  const speciesQuestions = species === 'gatto' ? catQuestions : dogQuestions
  return [commonQuestions.q1, speciesQuestions.q2, commonQuestions.q3, speciesQuestions.q4, commonQuestions.q5, commonQuestions.q6]
}

export const quizArchetypes: QuizArchetype[] = [
  { id: 'filosofo-pigro', priority: 12, emoji: '🛋️', name: 'Il Filosofo Pigro', signature: { E: -2, C: 0, S: 0, F: -0.5 }, description: 'Vive per il divano e le sieste infinite. Medita sul senso della vita, o forse solo su quando è la prossima pappa.', seenFrom: 'Come occupa il posto più comodo prima ancora che tu ti sieda.', compatibleId: 'mammone' },
  { id: 'turbina', priority: 5, emoji: '⚡', name: 'La Turbina Impazzita', signature: { E: 2, C: 0.5, S: 0.5, F: 0 }, description: "Motore acceso dall'alba agli zoomies delle 23. Riposo? Non pervenuto.", seenFrom: 'Quel secondo giro di casa fatto senza un motivo apparente.', compatibleId: 'pagliaccio' },
  { id: 'guardiano', priority: 2, emoji: '🦸', name: 'Il Guardiano Coraggioso', signature: { E: 0.5, C: 2, S: -0.5, F: 0 }, description: "Difende casa dal corriere, dal citofono e dalle foglie sospette. Il tuo eroe (un po' esagerato).", seenFrom: 'Come controlla ogni rumore, anche quando era solo una foglia.', compatibleId: 'fifone' },
  { id: 'fifone', priority: 3, emoji: '🫣', name: 'Il Fifone Adorabile', signature: { E: -0.5, C: -2, S: -0.5, F: -0.5 }, description: "Aspirapolvere, buste di plastica, temporali: nemici mortali. Ma con te è al sicuro.", seenFrom: "Come affronta il phon restando prudentemente in un'altra stanza.", compatibleId: 'guardiano' },
  { id: 'sindaco', priority: 4, emoji: '🎉', name: 'Il Sindaco del Parco', signature: { E: 1, C: 0.5, S: 2, F: 0 }, description: 'Conosce tutti, ama tutti, tutti amano lui. Vince ogni elezione a zampe alzate.', seenFrom: 'Quanti saluti raccoglie in cinque minuti.', compatibleId: 'cuore-oro' },
  { id: 'mammone', priority: 6, emoji: '🥰', name: 'Il Mammone', signature: { E: -0.5, C: -0.5, S: -2, F: -0.5 }, description: "La tua ombra ufficiale, ti segue perfino in bagno. L'amore fatto pelo.", seenFrom: 'Come ti accompagna anche nei tragitti di tre passi.', compatibleId: 'filosofo-pigro' },
  { id: 'pagliaccio', priority: 8, emoji: '🤡', name: 'Il Pagliaccio', signature: { E: 1, C: 0, S: 1, F: 0.5 }, description: 'Vive per farti ridere e ci riesce sempre. Cade apposta, giuriamo.', seenFrom: "Quella faccia innocente subito dopo l'ennesima scenetta.", compatibleId: 'turbina' },
  { id: 'criminale', priority: 1, emoji: '😈', name: 'Il Piccolo Criminale', signature: { E: 0.5, C: 0.5, S: 0, F: 2 }, description: 'Ti ruba il cibo guardandoti negli occhi. Furbo, spudorato, irresistibile.', seenFrom: 'Come finge di non aver mangiato la ciabatta.', compatibleId: 'buongustaio' },
  { id: 'buongustaio', priority: 11, emoji: '🐷', name: 'Il Buongustaio', signature: { E: -0.5, C: 0, S: 0, F: 1 }, description: "La vita ruota attorno alla ciotola. Sa l'ora dei pasti meglio di un orologio svizzero.", seenFrom: 'Come compare in cucina un minuto prima della pappa.', compatibleId: 'criminale' },
  { id: 'signore-distinto', priority: 9, emoji: '🧐', name: 'Il Signore Distinto', signature: { E: -1, C: 0.5, S: -1, F: 1 }, description: 'Elegante, selettivo, un filo snob. Sceglie lui gli amici, e non sei sempre invitato.', seenFrom: 'Quello sguardo che valuta se sei degno della sua compagnia.', compatibleId: 'piccolo-lupo' },
  { id: 'piccolo-lupo', priority: 10, emoji: '🐺', name: 'Il Piccolo Lupo', signature: { E: 0.5, C: 1, S: -1.5, F: 0.5 }, description: 'Indipendente e sicuro di sé. Ti vuole bene, ma a modo suo e con i suoi tempi.', seenFrom: 'Come sceglie lui quando iniziano e finiscono le coccole.', compatibleId: 'signore-distinto' },
  { id: 'cuore-oro', priority: 7, emoji: '💛', name: "Il Cuore d'Oro", signature: { E: 0, C: 0, S: 0.5, F: -2 }, description: 'Dolce con tutti, incapace di fare male a una mosca (anzi, ci gioca insieme).', seenFrom: 'Come accoglie tutti con una gentilezza disarmante.', compatibleId: 'sindaco' },
]
