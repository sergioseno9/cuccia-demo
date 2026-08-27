# cuccia — Sezione "Guida" (contenuti + modello)

Mini-guide **statiche e curate**, attualmente concentrate sulla fase Cucciolo. Fonte: il PDF
"Cucciolo in casa, niente panico" (in `docs/`). Tono: pratico, caldo, non
giudicante, solo metodi gentili / rinforzo positivo.

> ⚠️ **Regole di sicurezza (non negoziabili)**
> - Contenuto **editoriale statico**. NON è un chatbot, NON dà consigli veterinari
>   personalizzati, NON fa diagnosi né dosaggi.
> - Solo metodi gentili. Vietato: punizioni, "capobranco", muso nella pipì, collari coercitivi.
> - Ogni guida chiude con "Quando chiamare il veterinario" + disclaimer.
> - Prima del lancio vero: **far rivedere i testi da un educatore cinofilo / veterinario.**
> - In Fase 0 le guide sono solo **dati locali** (nessun backend). **Nessun paywall.**

## 0. Ruolo nel prodotto

Il core di Cuccia è il libretto sanitario digitale, lo scadenzario e la Pet Card. La Guida
è un supporto editoriale pertinente alla fase di vita, non il centro dell’app e non sostituisce
mai il veterinario. Il logging quotidiano non sblocca contenuti e non esistono score, target,
paywall o suggerimenti clinici.

La rilevanza usa soltanto `dog.lifePhase`, scelta manualmente dall’utente. La data di nascita
può suggerire la fase, ma `profile.createdAt` non entra mai nella selezione. In Adulto o Senior
non mostrare card forzate se non esiste una guida con fase compatibile.

---

## 1. Dove vive nell'app (placement)

Niente quinto tab. La Guida entra in tre punti:

1. **Hub Guida** — icona "libro" nell'header di *Oggi* → apre la lista delle mini-guide.
2. **"Niente panico"** (feature-firma) — in *Oggi*, in modalità cucciolo, un blocco con
   4 pulsanti-triage: **Notte · Pipì in casa · Morsi · Caos** → apre la guida giusta.
3. **Card contestuale** — in *Oggi*, una "Guida del momento" scelta in automatico (regole al §4).

Schermata **Lettore guida**: titolo problema-first, tempo di lettura, sezioni scrollabili,
guide collegate in fondo. Testo grande, molto respiro, coerente col brand (Fraunces titoli,
Jakarta corpo).

---

## 2. Modello dati (una guida)

```ts
type GuideSection =
  | { type: 'text';      heading?: string; body: string }
  | { type: 'steps';     heading?: string; items: string[] }   // lista numerata
  | { type: 'list';      heading?: string; items: string[] }   // punti elenco
  | { type: 'avoid';     heading?: string; items: string[] }   // "Da evitare"
  | { type: 'vet';       body: string }                        // "Quando chiamare il vet"
  | { type: 'checklist'; heading?: string; items: string[] };  // interattiva (spunte locali)

type Guide = {
  id: string;                 // 'notti-tranquille'
  category: 'cucciolo' | 'strumenti';
  title: string;              // problema-first
  subtitle?: string;
  readingMinutes: number;
  fase: 'cucciolo' | 'adulto' | 'senior' | 'tutte';
  triggers: string[];         // per triage/contesto: 'notte','pipi','morsi','caos','arrivo','routine'
  sections: GuideSection[];
  related?: string[];         // id di altre guide
};
```

Ogni guida termina sempre con una sezione `vet` + il disclaimer globale (§6).

---

## 3. Mappa "Niente panico" (triage → guida)

```
Notte          → 'notti-tranquille'
Pipì in casa   → 'stop-pipi'
Morsi          → 'morsi'
Caos generale  → 'routine'
```

---

## 4. Consegna contestuale (card "Guida del momento" in Oggi)

Prima regola: una guida è candidabile soltanto se `fase` coincide con la `lifePhase` scelta
oppure vale `tutte`. La data di creazione del profilo non conta mai. Il vecchio id
`primo-giorno` non deve essere usato: la guida corretta è `primi-mesi`.

Per la fase Cucciolo, in ordine di priorità:

1. Ora ≥ 20:00 → **'notti-tranquille'**
2. ≥ 3 eventi "incidente/pipì" registrati oggi → **'stop-pipi'**
3. ≥ 3 eventi "morso" registrati oggi → **'morsi'**
4. Default → **'puppy-blues'**

Per Adulto e Senior, in V1, nessuna card viene forzata se manca una guida pertinente.

---

## 5. Guide V1

### 5A · Guide scritte per intero (3)

---

#### id: `puppy-blues` · categoria: cucciolo · ~2 min · triggers: arrivo, caos
**Titolo:** Ti senti sopraffatto? È normale.
**Sottotitolo:** Il "puppy blues" spiegato senza giudizio.

- **type: text** — I primi giorni con un cucciolo sono spesso più difficili di quanto ti
  abbiano detto. Stanchezza, frustrazione, un po' di senso di colpa ("ma cosa ho fatto?"):
  è il cosiddetto *puppy blues*. Non è una diagnosi clinica ed è comune. Non significa che
  non ami il cucciolo, né che non sei adatto.
- **type: text** · heading: Perché succede — Poco sonno, una routine nuova, supervisione
  costante, decisioni piccole e continue. Sentirsi sopraffatti qui non è debolezza: è una
  reazione normale a un carico reale. Tende a ridursi man mano che entrate in una routine.
- **type: steps** · heading: Cosa fare ora — 
  1. Scegli **una sola priorità** per le prossime 24 ore (notte, pipì, morsi o caos generale)
     e lavora solo su quella per 2-3 giorni.
  2. Prepara un sacchetto di **premietti piccoli** (crocchette o pollo bollito).
  3. Definisci una **zona sicura** dove il cucciolo possa stare al riparo dagli stimoli.
  4. Scrivi una **routine**, anche semplicissima, anche su un foglio.
- **type: vet** — Se dopo qualche settimana ti senti ancora costantemente sopraffatto, non
  dormi anche quando il cucciolo dorme, o hai pensieri molto negativi, parlane con qualcuno:
  il tuo medico, uno psicologo o persone vicine. È il tuo benessere, e va preso sul serio.
- related: ['primi-mesi', 'routine']

---

#### id: `notti-tranquille` · categoria: cucciolo · ~4 min · triggers: notte
**Titolo:** Piange di notte: come avere notti più tranquille.

- **type: text** · heading: Perché piange — Non lo fa per dispetto né per manipolarti. Ha
  appena perso mamma, fratelli e odori familiari; si sente solo; spesso ha bisogno di fare
  pipì; a volte ha caldo, freddo, fame o è disorientato. Con una routine coerente molti
  cuccioli migliorano gradualmente, ma tempi e risvegli variano molto.
- **type: list** · heading: Dove farlo dormire — 
  - **Cuccia/trasportino in camera tua** (spesso la scelta migliore le prime settimane):
    si sente vicino e piange meno; gestisci tu le uscite notturne.
  - **Zona sicura in un'altra stanza**: diventa autonomo prima, ma spesso piange di più i primi giorni.
  - **Nel tuo letto**: dorme subito, ma è difficile tornare indietro e c'è rischio di schiacciarlo.
    Sconsigliato finché non controlla i bisogni.
  - *Soluzione equilibrata:* cuccia in camera tua i primi giorni, poi sposta gradualmente.
- **type: steps** · heading: La routine pre-nanna (30 min) — 
  1. **2 ore prima:** niente giochi forti. Carezze tranquille, luci più basse.
  2. **30 min prima:** ultima uscita per pipì (anche se "ha già fatto"). Lunga e calma.
  3. **15 min prima:** portalo dove dormirà. Ultima carezza, voce bassa.
  4. Luce spenta. Tu a letto, lui in cuccia.
- **type: text** · heading: E se piange? — Le due risposte estreme ("lascialo piangere" e
  "prendilo subito") sono entrambe sbagliate. Distingui: piccoli guaiti → osserva, spesso si
  riaddormenta. Pianto persistente → controlla (probabile pipì). Se serve gestirlo, fallo in
  **"modalità silenzio"**: fuori senza parole, senza carezze, senza luci → ritorno in cuccia.
  Mai giocare di notte, mai portarlo nel letto. Non correre a ogni rumore, ma non lasciarlo
  nel panico per ore.
- **type: avoid** · heading: Da evitare — 
  - Cedere e portarlo nel letto "solo per stanotte" (diventa per sempre).
  - Trasformare i risvegli in gioco: imparerà che svegliarti è divertente.
- **type: vet** — Se il pianto è intenso, peggiora o si accompagna a respiro affannato,
  tremori, vomito, diarrea con sangue o gengive pallide/bluastre: non aspettare. Chiama il
  veterinario di emergenza.
- **type: checklist** · heading: Prima di stanotte — 
  - Ho deciso dove dorme.
  - Ho preparato una cuccia sicura.
  - Ho pianificato l'ultima uscita prima della nanna.
  - So che tempi e risvegli variano da cucciolo a cucciolo.
- related: ['stop-pipi', 'routine']

---

#### id: `stop-pipi` · categoria: cucciolo · ~5 min · triggers: pipi
**Titolo:** Stop pipì in casa: il piano rapido.

- **type: list** · heading: 3 cose da accettare prima di iniziare — 
  - Gli **incidenti sono inevitabili**: è fisiologia, non un fallimento.
  - Nei cuccioli giovani il controllo della vescica è **immaturo**: servono opportunità frequenti.
  - **Sgridare a posteriori non funziona**: il cucciolo non collega la sgridata alla pipì di
    30 secondi prima; impara solo a nascondersi per farla.
- **type: text** · heading: Il principio centrale — Non aspettare che sbagli. **Portalo nel
  posto giusto nei momenti in cui è più probabile che debba farla, e premia subito quando la
  fa lì.** Anticipa la pipì giusta così tante volte che il posto giusto diventa il normale.
- **type: steps** · heading: I 4 momenti d'oro (portalo fuori sempre, anche se "ha già fatto") — 
  1. Appena si sveglia (anche da un pisolino di 20 min).
  2. Dopo gioco o corsa, soprattutto se si è eccitato.
  3. Poco dopo pappa o acqua.
  4. Ai segnali pre-pipì: annusa in cerchi, si allontana, gira su se stesso, diventa irrequieto.
- **type: text** · heading: Il premio — Dai il premietto **subito dopo** che ha finito nel
  posto giusto (non durante), sempre con la stessa parola chiave, es. "bravo pipì".
- **type: text** · heading: Se l'incidente accade — Se lo becchi nell'atto: un "ehi" calmo
  (non urlato) per interrompere, poi accompagnalo nel posto giusto; se finisce lì, premio.
  Se la pipì è già fatta: **non sgridare, non urlare, pulisci e basta** con un detergente
  enzimatico per animali (mai candeggina, mai mischiare prodotti).
- **type: avoid** · heading: Da evitare — 
  - Mettergli il muso nella pipì: obsoleto, insegna paura, mai.
  - Giocare appena si sveglia prima di portarlo fuori.
  - Premiare in ritardo o interromperlo mentre la fa.
  - Cambiare il posto designato ogni 2-3 giorni (scegline uno e tienilo 2-3 settimane).
- **type: vet** — Se urina molto spesso, con sangue, dolore, difficoltà, o ha perdite durante
  sonno/movimento: non è (solo) educazione. Contatta il veterinario.
- **type: checklist** · heading: Il tuo piano — 
  - Ho memorizzato i 4 momenti d'oro.
  - Premio subito dopo che ha finito nel posto giusto.
  - Non sgrido per gli incidenti già fatti.
  - Pulisco con detergente enzimatico.
  - Ho scelto il posto designato e lo mantengo fisso.
- related: ['notti-tranquille', 'routine']

---

### 5B · Guide come outline (stub, da riempire dopo)

Stessa struttura, `sections` da completare. Fonte: capitoli 01/04/05/06/07 del PDF.

- **id: `primi-mesi`** · fase: cucciolo · ~3 min · triggers: arrivo — *I primi mesi in casa.*
  Poche ancore gentili, zona sicura, ritmi riconoscibili e tempo per conoscersi.
- **id: `morsi`** · ~3 min · triggers: morsi — *Morsi, mani e oggetti.* Perché mordono
  (esplorano, dentizione), redirezione su masticativi, stop al gioco quando esagera, mai le mani.
- **id: `routine`** · ~3 min · triggers: caos, routine — *La routine che riduce il caos.*
  Ritmo di pasti, pisolini, uscite; la prevedibilità calma il cucciolo (e te).
- **id: `primi-comandi`** · ~3 min · triggers: — *I primi 3 comandi: nome, vieni, seduto.*
  Sessioni brevissime, rinforzo positivo, un comando alla volta.
- **id: `sicurezza`** · ~3 min · triggers: — *Sicurezza, zoomies e prime uscite.* Zoomies
  normali, gestione degli spazi, prime uscite in base alle indicazioni del veterinario.

### 5C · Strumenti (categoria: strumenti — checklist interattive, non guide)

- **id: `casa-prova-cucciolo`** — *Casa a prova di cucciolo.* Checklist spuntabile (cavi,
  oggetti a terra, cibi/piante tossiche, spazzatura, zona sicura).
- **id: `routine-7-giorni`** — *Routine dei primi 7 giorni.* Modello di giornata tipo.
- **id: `10-regole`** — *Le 10 regole anti-panico.* Lista di principi da tenere a mente.

---

## 6. Disclaimer globale (in fondo a ogni guida)

> Questa guida è divulgativa e non sostituisce il parere del veterinario. I cuccioli sono
> tutti diversi: tempi e reazioni variano. Se il tuo cucciolo non sta bene o hai dubbi sulla
> sua salute, contatta il tuo veterinario.
