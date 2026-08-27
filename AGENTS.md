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

Gli eroi sono, in quest’ordine: **libretto sanitario digitale**, **scadenzario in-app** e
**Pet Card condivisibile/stampabile**. La bottom navigation mantiene quattro schermate:

- **Oggi:** scadenze imminenti, colpo d’occhio sanitario, azioni rapide opzionali, accesso
  alla Pet Card, card di stato e infine attività della famiglia.
- **Diario:** storico per categoria e giorno, sempre descrittivo e modificabile.
- **Salute:** libretto manuale con vaccini, antiparassitari, sverminazione, terapie, visite,
  peso, allergie/condizioni, microchip e scadenze.
- **Profilo:** dati cane, alimentazione, contatti, famiglia, fase, moduli, condizioni,
  documenti locali, Pet Card e azzeramento dati.
- **Guida:** non è un quinto tab. Si apre dall’icona libro e mostra solo contenuti compatibili
  con la fase scelta.

## L’app cresce col cane

- `lifePhase` è una scelta manuale: `cucciolo | adulto | senior`; default `adulto`.
- La data di nascita suggerisce la fase nell’onboarding, ma non la decide.
- Cambiare fase rimodella live preset, home e guide; i moduli restano modificabili.
- `trackedModules`: Uscite, Acqua, Peso, Farmaci, Toelettatura/bagno.
- `conditions`: `problemi_urinari`, `terapia_in_corso`, `mobilita_ridotta`,
  `peso_controllato`, `potty_training`. Sono etichette organizzative, mai diagnosi.
- Pipì e cacca sono invisibili di default e compaiono solo con `problemi_urinari` o
  `potty_training`.
- Il nudge uscite usa solo `outingIntervalHours` impostato dall’utente e fatti registrati.

## Dati e interazioni

- Quick log predefinito: Uscita, Pappa, Acqua, Farmaco, Nota; Toelettatura se attiva.
- Tap significa “adesso”; ora, durata, caregiver e nota restano modificabili dopo.
- Le uscite accettano durata 15/30/45/60 minuti o personalizzata.
- Modifiche ed eliminazioni conservano audit locale e soft-delete.
- Lo scadenzario deriva da vaccini/richiami, antiparassitari, sverminazione, terapie,
  visite, controllo annuale, assicurazione e verifica dati microchip.
- La Pet Card funziona offline e include foto, microchip, veterinario, emergenza, farmaci,
  allergie, alimentazione e note del proprietario.

## Onboarding

Passaggi brevi e skippabili: nome/foto → nascita/fase → sesso/razza/taglia → peso →
microchip → veterinario/contatto → caregiver → moduli → condizioni. Tutto resta modificabile.
Usare parole comuni e spiegare in una riga termini come antiparassitari e sverminazione.

## Principi di UX

- Sezioni separate e ordinate; mai ammassare tutto nella stessa schermata.
- Logging leggero e opzionale; mai presentarlo come compito o obiettivo.
- Ogni schermata ha un focus e una gerarchia visiva netta.
- Feed in linguaggio naturale con avatar, autore e orario.
- Card di stato mostrano fatti e aprono dettagli; non sono bottoni anonimi.
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
