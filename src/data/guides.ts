import type { PetSpecies } from '../types'

export type GuideSection =
  | { type: 'text'; heading?: string; body: string }
  | { type: 'steps'; heading?: string; items: string[] }
  | { type: 'list'; heading?: string; items: string[] }
  | { type: 'avoid'; heading?: string; items: string[] }
  | { type: 'vet'; body: string }
  | { type: 'checklist'; heading?: string; items: string[] }

export type Guide = {
  id: string
  species: PetSpecies
  category: 'cucciolo' | 'strumenti'
  title: string
  subtitle?: string
  readingMinutes: number
  fase: 'cucciolo' | 'adulto' | 'senior' | 'tutte'
  triggers: string[]
  sections: GuideSection[]
  related?: string[]
}

export const GLOBAL_GUIDE_DISCLAIMER = 'Questa guida è divulgativa e non sostituisce il parere del veterinario. I cuccioli sono tutti diversi: tempi e reazioni variano. Se il tuo cucciolo non sta bene o hai dubbi sulla sua salute, contatta il tuo veterinario.'

const generalVet = 'Se noti un cambiamento improvviso, sintomi fisici, dolore, forte abbattimento o qualcosa che ti preoccupa, contatta il veterinario. Questa guida non può valutare la salute del tuo cucciolo.'

const guideSource: Array<Omit<Guide, 'species'> & { species?: PetSpecies }> = [
  {
    id: 'puppy-blues', species: 'cane', category: 'cucciolo', title: 'Ti senti sopraffatto? È normale.', subtitle: 'Il “puppy blues” spiegato senza giudizio.', readingMinutes: 2, fase: 'cucciolo', triggers: ['arrivo', 'caos'],
    sections: [
      { type: 'text', body: 'I primi giorni con un cucciolo sono spesso più difficili di quanto ti abbiano detto. Stanchezza, frustrazione, un po’ di senso di colpa (“ma cosa ho fatto?”): è il cosiddetto puppy blues. Non è una diagnosi clinica ed è comune. Non significa che non ami il cucciolo, né che non sei adatto.' },
      { type: 'text', heading: 'Perché succede', body: 'Poco sonno, una routine nuova, supervisione costante, decisioni piccole e continue. Sentirsi sopraffatti qui non è debolezza: è una reazione normale a un carico reale. Tende a ridursi man mano che entrate in una routine.' },
      { type: 'steps', heading: 'Cosa fare ora', items: ['Scegli una sola priorità per le prossime 24 ore — notte, pipì, morsi o caos generale — e lavora solo su quella per 2–3 giorni.', 'Prepara un sacchetto di premietti piccoli, come crocchette o pollo bollito.', 'Definisci una zona sicura dove il cucciolo possa stare al riparo dagli stimoli.', 'Scrivi una routine, anche semplicissima, anche su un foglio.'] },
      { type: 'vet', body: 'Se dopo qualche settimana ti senti ancora costantemente sopraffatto, non dormi anche quando il cucciolo dorme, o hai pensieri molto negativi, parlane con qualcuno: il tuo medico, uno psicologo o persone vicine. È il tuo benessere, e va preso sul serio.' },
    ], related: ['primi-mesi', 'routine'],
  },
  {
    id: 'notti-tranquille', species: 'cane', category: 'cucciolo', title: 'Piange di notte: come avere notti più tranquille.', readingMinutes: 4, fase: 'cucciolo', triggers: ['notte'],
    sections: [
      { type: 'text', heading: 'Perché piange', body: 'Non lo fa per dispetto né per manipolarti. Ha appena perso mamma, fratelli e odori familiari; si sente solo; spesso ha bisogno di fare pipì; a volte ha caldo, freddo, fame o è disorientato. Con una routine coerente molti cuccioli migliorano gradualmente, ma tempi e risvegli variano molto.' },
      { type: 'list', heading: 'Dove farlo dormire', items: ['Cuccia o trasportino in camera tua: spesso è la scelta migliore nelle prime settimane. Si sente vicino e gestisci tu le uscite notturne.', 'Zona sicura in un’altra stanza: può diventare autonomo prima, ma spesso piange di più i primi giorni.', 'Nel tuo letto: può dormire subito, ma è difficile tornare indietro e c’è rischio di schiacciarlo. È sconsigliato finché non controlla i bisogni.', 'Una soluzione equilibrata è tenere la cuccia in camera i primi giorni e poi spostarla gradualmente.'] },
      { type: 'steps', heading: 'La routine pre-nanna — 30 minuti', items: ['Due ore prima: niente giochi forti. Carezze tranquille e luci più basse.', 'Trenta minuti prima: ultima uscita per pipì, anche se “ha già fatto”. Lunga e calma.', 'Quindici minuti prima: portalo dove dormirà. Ultima carezza e voce bassa.', 'Luce spenta. Tu a letto, lui in cuccia.'] },
      { type: 'text', heading: 'E se piange?', body: 'Le due risposte estreme — “lascialo piangere” e “prendilo subito” — sono entrambe sbagliate. Piccoli guaiti: osserva, spesso si riaddormenta. Pianto persistente: controlla, perché potrebbe aver bisogno di fare pipì. Se serve, gestiscilo in modalità silenzio: fuori senza parole, carezze o luci, poi ritorno in cuccia. Mai giocare di notte. Non correre a ogni rumore, ma non lasciarlo nel panico per ore.' },
      { type: 'avoid', heading: 'Da evitare', items: ['Portarlo nel letto “solo per stanotte” se non vuoi che diventi l’abitudine.', 'Trasformare i risvegli in gioco: imparerebbe che svegliarti è divertente.'] },
      { type: 'checklist', heading: 'Prima di stanotte', items: ['Ho deciso dove dorme.', 'Ho preparato una cuccia sicura.', 'Ho pianificato l’ultima uscita prima della nanna.', 'So che tempi e risvegli variano da cucciolo a cucciolo.'] },
      { type: 'vet', body: 'Se il pianto è intenso, peggiora o si accompagna a respiro affannato, tremori, vomito, diarrea con sangue o gengive pallide o bluastre, non aspettare: chiama il veterinario di emergenza.' },
    ], related: ['stop-pipi', 'routine'],
  },
  {
    id: 'stop-pipi', species: 'cane', category: 'cucciolo', title: 'Stop pipì in casa: il piano rapido.', readingMinutes: 5, fase: 'cucciolo', triggers: ['pipi'],
    sections: [
      { type: 'list', heading: 'Tre cose da accettare prima di iniziare', items: ['Gli incidenti sono inevitabili: è fisiologia, non un fallimento.', 'Nei cuccioli giovani il controllo della vescica è immaturo: servono opportunità frequenti.', 'Sgridare a posteriori non funziona: il cucciolo non collega la sgridata alla pipì di poco prima e impara solo a nascondersi.'] },
      { type: 'text', heading: 'Il principio centrale', body: 'Non aspettare che sbagli. Portalo nel posto giusto nei momenti in cui è più probabile che debba farla e premia subito quando la fa lì. Anticipa la pipì giusta così tante volte che il posto giusto diventa il normale.' },
      { type: 'steps', heading: 'I quattro momenti d’oro', items: ['Appena si sveglia, anche da un pisolino breve.', 'Dopo gioco o corsa, soprattutto se si è eccitato.', 'Poco dopo pappa o acqua.', 'Ai segnali pre-pipì: annusa in cerchi, si allontana, gira su se stesso o diventa irrequieto.'] },
      { type: 'text', heading: 'Il premio', body: 'Dai il premietto subito dopo che ha finito nel posto giusto, non durante, sempre con la stessa parola chiave, per esempio “bravo pipì”.' },
      { type: 'text', heading: 'Se l’incidente accade', body: 'Se lo becchi nell’atto, usa un “ehi” calmo, non urlato, per interrompere e accompagnalo nel posto giusto; se finisce lì, premio. Se la pipì è già fatta, non sgridare e non urlare: pulisci con un detergente enzimatico per animali. Mai candeggina e mai mischiare prodotti.' },
      { type: 'avoid', heading: 'Da evitare', items: ['Mettergli il muso nella pipì: è obsoleto, insegna paura e non va mai fatto.', 'Giocare appena si sveglia prima di portarlo fuori.', 'Premiare in ritardo o interromperlo mentre la fa.', 'Cambiare il posto designato ogni pochi giorni: scegline uno e mantienilo per 2–3 settimane.'] },
      { type: 'checklist', heading: 'Il tuo piano', items: ['Ho memorizzato i quattro momenti d’oro.', 'Premio subito dopo che ha finito nel posto giusto.', 'Non sgrido per gli incidenti già fatti.', 'Pulisco con detergente enzimatico.', 'Ho scelto il posto designato e lo mantengo fisso.'] },
      { type: 'vet', body: 'Se urina molto spesso, con sangue, dolore, difficoltà, o ha perdite durante sonno o movimento, non è solo educazione. Contatta il veterinario.' },
    ], related: ['notti-tranquille', 'routine'],
  },
  { id: 'primi-mesi', category: 'cucciolo', title: 'I primi mesi in casa.', readingMinutes: 3, fase: 'cucciolo', triggers: ['arrivo'], sections: [{ type: 'text', heading: 'Contenuto in preparazione', body: 'Nei primi mesi costruisci poche ancore gentili: una zona sicura, ritmi riconoscibili e tempo per conoscervi. Meno stimoli e più prevedibilità aiutano tutta la famiglia.' }, { type: 'vet', body: generalVet }], related: ['puppy-blues', 'casa-prova-cucciolo'] },
  { id: 'morsi', category: 'cucciolo', title: 'Morsi, mani e oggetti.', readingMinutes: 3, fase: 'cucciolo', triggers: ['morsi'], sections: [{ type: 'text', heading: 'Contenuto in preparazione', body: 'I cuccioli mordono per esplorazione e dentizione. Reindirizza con calma verso un masticativo adatto e interrompi brevemente il gioco quando l’eccitazione sale. Mai punizioni e mai usare le mani come giocattolo.' }, { type: 'vet', body: generalVet }], related: ['routine', 'sicurezza'] },
  { id: 'routine', category: 'cucciolo', title: 'La routine che riduce il caos.', readingMinutes: 3, fase: 'cucciolo', triggers: ['caos', 'routine'], sections: [{ type: 'text', heading: 'Contenuto in preparazione', body: 'Un ritmo prevedibile di pasti, pisolini, gioco e uscite aiuta il cucciolo a orientarsi e alleggerisce il carico mentale della famiglia. Parti da poche ancore, non da un programma rigido.' }, { type: 'vet', body: generalVet }], related: ['puppy-blues', 'routine-7-giorni'] },
  { id: 'primi-comandi', category: 'cucciolo', title: 'I primi tre comandi: nome, vieni, seduto.', readingMinutes: 3, fase: 'cucciolo', triggers: [], sections: [{ type: 'text', heading: 'Contenuto in preparazione', body: 'Lavora con sessioni brevissime, un comando alla volta e rinforzo positivo. Interrompi prima che il cucciolo perda interesse.' }, { type: 'vet', body: generalVet }], related: ['10-regole'] },
  { id: 'sicurezza', category: 'cucciolo', title: 'Sicurezza, zoomies e prime uscite.', readingMinutes: 3, fase: 'cucciolo', triggers: [], sections: [{ type: 'text', heading: 'Contenuto in preparazione', body: 'Gli zoomies sono spesso normali. Gestisci gli spazi e programma le prime uscite seguendo le indicazioni del veterinario rispetto alla copertura vaccinale.' }, { type: 'vet', body: generalVet }], related: ['casa-prova-cucciolo', 'primi-mesi'] },
  { id: 'casa-prova-cucciolo', category: 'strumenti', title: 'Casa a prova di cucciolo.', readingMinutes: 2, fase: 'cucciolo', triggers: ['arrivo', 'sicurezza'], sections: [{ type: 'checklist', heading: 'Controllo rapido', items: ['Cavi elettrici protetti o fuori portata.', 'Oggetti piccoli e fragili tolti dal pavimento.', 'Cibi, farmaci e piante potenzialmente tossiche non accessibili.', 'Spazzatura chiusa e detersivi in alto.', 'Zona sicura pronta con acqua, cuccia e masticativi adatti.'] }, { type: 'vet', body: 'Se pensi che il cucciolo abbia ingerito qualcosa di pericoloso, non aspettare sintomi e non provocare il vomito senza indicazioni: chiama subito il veterinario.' }], related: ['primi-mesi', 'sicurezza'] },
  { id: 'routine-7-giorni', category: 'strumenti', title: 'Routine dei primi sette giorni.', readingMinutes: 2, fase: 'cucciolo', triggers: ['arrivo', 'routine'], sections: [{ type: 'checklist', heading: 'Le ancore della giornata', items: ['Uscita tranquilla appena sveglio.', 'Pasti a orari abbastanza regolari.', 'Pochi minuti di gioco gentile e guidato.', 'Pisolini frequenti in una zona calma.', 'Uscita dopo sonno, pappa e gioco.', 'Routine serale lenta e prevedibile.', 'Una sola priorità educativa per volta.'] }, { type: 'vet', body: generalVet }], related: ['routine', 'notti-tranquille'] },
  { id: '10-regole', category: 'strumenti', title: 'Le dieci regole anti-panico.', readingMinutes: 2, fase: 'cucciolo', triggers: ['caos'], sections: [{ type: 'checklist', heading: 'Da tenere a mente', items: ['Una priorità alla volta.', 'Premia ciò che vuoi rivedere.', 'Mai punizioni fisiche o metodi coercitivi.', 'Pisolini e calma sono parte della routine.', 'Gli incidenti non sono dispetti.', 'Le sessioni educative restano brevi.', 'Tutta la famiglia usa le stesse parole.', 'Una zona sicura riduce gli stimoli.', 'Chiedere aiuto non è un fallimento.', 'Per i dubbi di salute si chiama il veterinario.'] }, { type: 'vet', body: generalVet }], related: ['puppy-blues', 'routine'] },
]

export const guides: Guide[] = guideSource.map((guide) => ({ ...guide, species: guide.species ?? 'cane' }))

export const getGuide = (id: string) => guides.find((guide) => guide.id === id)

export const panicGuideMap = {
  Notte: 'notti-tranquille',
  'Pipì in casa': 'stop-pipi',
  Morsi: 'morsi',
  Caos: 'routine',
} as const
