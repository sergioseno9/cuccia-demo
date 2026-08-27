export type TrickLevel = 'base' | 'intermedio' | 'avanzato'

export interface Trick {
  id: string
  name: string
  level: TrickLevel
  goal: string
  useful: boolean
  why: string
  steps: string[]
  timePerDay: string
  related?: string[]
  ifNotWorking: string
}

const gentleFallback = 'Fai sessioni più corte, scegli premi più interessanti e fermati mentre è ancora sereno. Se serve, cerca un educatore che lavori senza coercizione.'

export const tricks: Trick[] = [
  { id: 'seduto', name: 'Seduto', level: 'base', goal: 'Sedersi su richiesta con calma.', useful: false, why: 'Crea un gesto semplice per iniziare a comunicare.', steps: ['Porta un premio vicino al naso.', 'Spostalo lentamente verso l’alto e indietro.', 'Quando si siede, pronuncia “seduto” e premia.'], timePerDay: '2–3 minuti', ifNotWorking: gentleFallback },
  { id: 'terra', name: 'Terra', level: 'base', goal: 'Sdraiarsi su richiesta.', useful: false, why: 'Aiuta a proporre una pausa tranquilla.', steps: ['Parti dal seduto.', 'Porta il premio verso il pavimento.', 'Quando segue e si sdraia, premia.'], timePerDay: '2–3 minuti', ifNotWorking: gentleFallback },
  { id: 'resta', name: 'Resta', level: 'base', goal: 'Aspettare per pochi secondi.', useful: false, why: 'Allena attesa e comunicazione chiara.', steps: ['Chiedi seduto.', 'Mostra la mano e fai mezzo passo indietro.', 'Torna subito e premia prima che si muova.'], timePerDay: '2 minuti', ifNotWorking: gentleFallback },
  { id: 'richiamo', name: 'Vieni / Richiamo', level: 'base', goal: 'Tornare volentieri quando viene chiamato.', useful: true, why: 'Un richiamo costruito bene aiuta la sicurezza e la collaborazione. Si prova prima in casa o in spazi protetti, mai mettendo il cane alla prova in situazioni rischiose.', steps: ['Scegli una parola breve, come “vieni”, e usala sempre nello stesso modo.', 'In un luogo tranquillo, allontanati di un passo e pronuncia la parola con tono allegro.', 'Appena si muove verso di te, incoraggialo con calma.', 'Quando arriva, premia vicino alle tue gambe con cibo o gioco gradito.', 'Lascialo tornare a ciò che stava facendo: venire da te non deve significare sempre fine del divertimento.', 'Aumenta distanza e distrazioni molto lentamente, usando una lunghina in spazi aperti sicuri.'], timePerDay: '3–5 minuti', related: ['resta'], ifNotWorking: 'Riduci distanza e distrazioni, usa un premio davvero gradito e non ripetere il comando molte volte. Non rimproverarlo mai quando torna. Per lavorare all’aperto, fatti aiutare da un educatore non coercitivo.' },
  { id: 'zampa', name: 'Dai la zampa', level: 'base', goal: 'Appoggiare la zampa sulla mano.', useful: false, why: 'È un gioco breve che allena attenzione reciproca.', steps: ['Mostra il palmo vicino alla zampa.', 'Premia ogni piccolo movimento verso la mano.', 'Aggiungi la parola quando il gesto è chiaro.'], timePerDay: '2 minuti', ifNotWorking: gentleFallback },

  { id: 'lascia', name: 'Lascia', level: 'intermedio', goal: 'Allontanarsi volontariamente da un oggetto.', useful: true, why: 'Aiuta nella gestione quotidiana di oggetti trovati, senza inseguimenti né scambi forzati.', steps: ['Chiudi un premio poco interessante nel pugno e lascia che lo annusi.', 'Aspetta in silenzio: appena allontana il muso, marca con “sì” e premia dall’altra mano.', 'Ripeti finché si stacca subito, poi aggiungi la parola “lascia” prima di mostrare il pugno.', 'Passa a un premio sul pavimento coperto dalla mano.', 'Quando è fluido, prova con oggetti sicuri e premia sempre la scelta di allontanarsi.', 'Fuori casa usa guinzaglio e distanza: non trasformare l’esercizio in una prova rischiosa.'], timePerDay: '3–4 minuti', related: ['richiamo'], ifNotWorking: 'Usa un oggetto meno interessante e un premio migliore. Evita di tirare via ciò che ha in bocca o di inseguirlo. Se protegge gli oggetti o ringhia, chiedi aiuto a un educatore non coercitivo.' },
  { id: 'al-posto', name: 'Al posto', level: 'intermedio', goal: 'Raggiungere una coperta o cuccia.', useful: false, why: 'Crea un punto prevedibile per rilassarsi.', steps: ['Premia uno sguardo verso la coperta.', 'Poi premia una zampa sopra.', 'Aggiungi la parola quando ci va con facilità.'], timePerDay: '3 minuti', ifNotWorking: gentleFallback },
  { id: 'guinzaglio', name: 'Cammina senza tirare', level: 'intermedio', goal: 'Camminare con il guinzaglio morbido per brevi tratti.', useful: true, why: 'Rende le uscite più comprensibili e confortevoli per entrambi. Non richiede una posizione perfetta: conta che il guinzaglio resti morbido.', steps: ['Inizia in un luogo tranquillo con pettorina comoda e premi piccoli.', 'Premia quando il cane è vicino e il guinzaglio forma una curva morbida.', 'Fai pochi passi, poi premia di nuovo prima che aumenti la tensione.', 'Se tira, fermati con calma o cambia direzione senza strattoni.', 'Riparti quando il guinzaglio torna morbido.', 'Alterna brevi tratti insieme a momenti liberi di annusare: la passeggiata non è un esercizio continuo.'], timePerDay: '5 minuti dentro la passeggiata', related: ['lascia'], ifNotWorking: 'Scegli un luogo con meno stimoli, riduci i tratti e premia più spesso. Verifica che l’attrezzatura sia comoda. Se la passeggiata resta difficile, cerca un educatore non coercitivo.' },
  { id: 'gira', name: 'Gira', level: 'intermedio', goal: 'Compiere un giro su se stesso.', useful: false, why: 'È un gioco dinamico e breve.', steps: ['Guida il naso in un piccolo cerchio.', 'Premia al completamento.', 'Riduci gradualmente il gesto della mano.'], timePerDay: '2 minuti', ifNotWorking: gentleFallback },
  { id: 'rotola', name: 'Rotola', level: 'intermedio', goal: 'Rotolare su un fianco in modo volontario.', useful: false, why: 'Allena fiducia e coordinazione, solo se il cane è comodo.', steps: ['Parti da terra.', 'Guida il premio verso la spalla.', 'Premia piccoli movimenti senza forzare.'], timePerDay: '2 minuti', ifNotWorking: gentleFallback },

  { id: 'resta-distanza', name: 'Resta a distanza', level: 'avanzato', goal: 'Mantenere il resta mentre ti allontani.', useful: false, why: 'Aumenta gradualmente autocontrollo e chiarezza.', steps: ['Consolida pochi secondi vicino.', 'Aggiungi un passo alla volta.', 'Torna sempre a premiare il cane.'], timePerDay: '3 minuti', ifNotWorking: gentleFallback },
  { id: 'porta', name: 'Porta l’oggetto', level: 'avanzato', goal: 'Consegnare un oggetto morbido.', useful: false, why: 'Combina gioco, ricerca e collaborazione.', steps: ['Premia il contatto con l’oggetto.', 'Poi premia quando lo solleva.', 'Allunga gradualmente la distanza.'], timePerDay: '3–5 minuti', ifNotWorking: gentleFallback },
  { id: 'cerca', name: 'Cerca con il fiuto', level: 'avanzato', goal: 'Trovare piccoli premi nascosti.', useful: false, why: 'Il fiuto offre un’attività tranquilla e appagante.', steps: ['Mostra dove lasci un premio.', 'Nascondilo poco lontano.', 'Aumenta la difficoltà lentamente.'], timePerDay: '5 minuti', ifNotWorking: gentleFallback },
  { id: 'visita-serena', name: 'Farsi visitare senza stress', level: 'avanzato', goal: 'Accettare brevi controlli collaborando.', useful: true, why: 'Prepara con gradualità a tocco di zampe, orecchie e bocca. Non sostituisce la visita e non serve a trattenere il cane contro la sua volontà.', steps: ['Scegli un momento tranquillo e tocca per un secondo una zona che tollera bene.', 'Premia subito e interrompi.', 'Introduci un segnale di consenso, per esempio il mento appoggiato sulla tua mano.', 'Tocca solo mentre mantiene volontariamente la posizione; se si sposta, fermati.', 'Aumenta durata e zone molto lentamente, includendo zampe, orecchie e sollevamento del labbro.', 'Simula strumenti semplici, come una garza o uno stetoscopio giocattolo, senza procedure dolorose.', 'Condividi questa routine con il veterinario, che valuterà come adattarla alle visite reali.'], timePerDay: '2–3 minuti', related: ['al-posto'], ifNotWorking: 'Torna a un tocco più breve o a una zona più facile, usa premi migliori e lascia sempre libertà di allontanarsi. In caso di paura intensa, dolore o reazioni improvvise, senti il veterinario e un educatore non coercitivo.' },
]

export const trickLevels: TrickLevel[] = ['base', 'intermedio', 'avanzato']

export const levelLabels: Record<TrickLevel, string> = {
  base: 'Base',
  intermedio: 'Intermedio',
  avanzato: 'Avanzato',
}
