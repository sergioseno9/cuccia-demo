# cuccia — Tutto ciò che conta del cane, in ordine

Cuccia è il posto affidabile dove vivono informazioni, salute, scadenze e contatti del cane.
Avvisa in anticipo sulle date inserite dall’utente e permette di condividere una Pet Card in
pochi secondi. Il coordinamento familiare resta un layer trasversale: ogni evento registra
sempre autore e orario, ma logging e feed non sono il cuore del prodotto.

Contesto prodotto: `docs/PROJECT_BRIEF.md`. Identità visiva: `docs/brand/`.
Contenuti editoriali: `docs/GUIDE_CONTENT.md`.

## Tech stack

**Fase 0 — prototipo web locale:** Vite + React + TypeScript strict, `react-router-dom`,
`lucide-react`, dati in `localStorage`. Nessun backend, account reale, push o paywall.
Expo + Supabase restano nella visione futura ma NON ora.

## Comandi

- Installazione: `npm install`
- Avvio: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`

## Eroi e architettura prodotto

Gli eroi sono, in quest’ordine: **scadenzario in-app**, **Pet Card condivisibile/stampabile**
e **libretto sanitario digitale**. La bottom navigation mantiene cinque schermate:

- **Home:** solo prossime scadenze e accesso alla Pet Card; niente logging o feed.
- **Diario:** registrazione esplicita e opzionale, poi storico completo in accordion per giorno.
- **Cura:** scadenze, libretto manuale e igiene/abitudini con toelettatura fuori dal Diario.
- **Scopri:** consiglio del momento, giochi/trucchi, badge personali e guide filtrate per fase.
- **Profilo:** dati cane, alimentazione, contatti, famiglia, fase, moduli, condizioni,
  documenti locali, tutorial riapribile e azzeramento dati.

## L’app cresce col cane

- `lifePhase` è una scelta manuale: `cucciolo | adulto | senior`; default `adulto`.
- La data di nascita suggerisce la fase nell’onboarding, ma non la decide.
- Cambiare fase rimodella preset, Scopri e guide; i moduli restano modificabili dal Profilo.
- `trackedModules`: Uscite, Peso, Farmaci, Toelettatura/bagno. `water` resta solo legacy.
- `conditions`: `problemi_urinari`, `terapia_in_corso`, `mobilita_ridotta`,
  `peso_controllato`, `potty_training`. Sono etichette organizzative, mai diagnosi.
- Pipì e cacca sono invisibili di default e compaiono solo con `problemi_urinari` o
  `potty_training`.
- Il nudge uscite usa solo `outingIntervalHours` impostato dall’utente e fatti registrati.

## Dati e interazioni

- La registrazione vive solo nel Diario: Uscita, Pappa e Nota; Farmaco solo con terapia attiva.
- Pipì e cacca compaiono solo con `problemi_urinari` o `potty_training`; Acqua non compare.
- Ogni azione apre sempre il popup di conferma con data, ora, caregiver e nota.
- Le uscite accettano durata 15/30/45/60 minuti o personalizzata.
- Modifiche ed eliminazioni conservano audit locale e soft-delete.
- Lo scadenzario deriva da vaccini/richiami, antiparassitari, sverminazione, terapie,
  visite, controllo annuale e verifica dati microchip.
- La toelettatura è un’abitudine morbida in Cura, mai un evento quotidiano o una scadenza dura.
- La Pet Card funziona offline e include foto, microchip, veterinario, emergenza, farmaci,
  allergie, alimentazione e note del proprietario.
- Trucchi e badge sono locali, senza classifiche o streak; la condivisione genera un PNG.

## Onboarding

Passaggi brevi e skippabili: nome/foto → nascita/fase → sesso/razza/taglia → peso →
microchip → veterinario/contatto → caregiver → condizioni. Tutto resta modificabile.
Usare parole comuni e spiegare in una riga termini come antiparassitari e sverminazione.

Dopo l’onboarding parte un tutorial di quattro coach-mark che visita Home, Diario, Cura e
Scopri. È skippabile, viene salvato in `localStorage` e si riapre dal Profilo.

## Principi di UX

- Sezioni separate e ordinate; mai ammassare tutto nella stessa schermata.
- Logging leggero e opzionale; mai presentarlo come compito o obiettivo.
- Ogni schermata ha un focus e una gerarchia visiva netta.
- Feed in linguaggio naturale con avatar, autore e orario.
- Card di stato mostrano fatti e aprono dettagli; non sono bottoni anonimi.
- Mobile-first: testo base almeno 16px, etichette almeno 14px e target touch almeno 44px.
- Verificare sempre l’esperienza a 390px e mantenerla semplice anche per utenti poco tecnologici.
- Icone solo `lucide-react`; niente emoji nell’interfaccia.
- Raggi 12–16px, ritmo 8px, ombre minime, focus visibile, responsive e reduced motion.

## Guardrail di prodotto — NON violare

- Farmaci, dosi, vaccini, visite, scadenze e documenti sono inseriti e confermati a mano.
- Nessun OCR, import o salvataggio automatico di dati sanitari.
- Nessun health score, diagnosi, consiglio clinico, target attività o percentuale di felicità.
- Uscite e attività mostrano fatti descrittivi. Mai allarmi, correzioni o “deve uscire”.
- Le passeggiate non rappresentano tutta l’attività; mai usare passi generici del telefono.
- Ogni evento conserva autore + timestamp; modifiche future mantengono l’audit trail.
- Reminder solo in-app in Fase 0. Push e sincronizzazione arrivano in Fase 1 con backend.
- Niente abbonamenti, paywall o advertising nel prototipo.
- Le guide sono editoriali statiche: niente chatbot, diagnosi, dosaggi o consigli veterinari
  personalizzati; solo metodi gentili e rinforzo positivo.
- Ogni guida termina con “Quando chiamare il veterinario” e disclaimer globale. Prima del
  lancio reale i testi devono essere revisionati da educatore o veterinario.
- La rilevanza delle guide dipende da `lifePhase`, mai da `profile.createdAt`.

## Design tokens

- Clay `#D9694A`, Honey `#F2B24C`, Sage `#8FA083`, Ink `#2B2320`,
  Cream `#FBF6EE`, Sand `#EFE3D1`.
- Fraunces per titoli e numeri chiave; Plus Jakarta Sans per UI e testo.
- Tono caldo, calmo, essenziale: fatti e date, mai ansia o colpa.

## Convenzioni

- TypeScript strict; vietato il tipo `any`.
- File sotto 300 righe: dividere componenti, schermate, stato e logica dominio.
- Riutilizzare il codice esistente; niente riscritture parallele o codice morto.
- Prima della consegna eseguire `npm run build` e controllare il diff.
