# cuccia — Tutto ciò che conta, per ogni pet

Cuccia ordina informazioni, Cura, scadenze e contatti di cani e gatti. Gli eroi sono
**scadenzario in-app**, **Pet Card offline** e **libretto sanitario digitale**. Il
coordinamento familiare è trasversale: ogni evento conserva autore e orario, ma il logging
resta leggero e facoltativo.

Contesto prodotto: `docs/PROJECT_BRIEF.md`. Qualità: `docs/QUALITY_STANDARD.md`.
Identità visiva: `docs/brand/`. Contenuti editoriali: `docs/GUIDE_CONTENT.md`.

## Tech stack

**Stato attuale — web app con Supabase Fase 1:** Vite + React + TypeScript strict,
`react-router-dom`, `lucide-react`. La modalità locale usa `localStorage`; la modalità account
usa Supabase Auth, Postgres, Storage, migration versionate e RLS. Il passaggio locale→cloud è
esplicito e idempotente. Non esistono ancora push, shell nativa o paywall; Capacitor resta la
direzione prevista per le fasi native, senza riscrivere la UI React.

## Comandi

- Installazione: `npm install`
- Avvio: `npm run dev`
- Test dati: `npm test`
- Build: `npm run build`
- Preview build: `npm run preview`
- Audit dipendenze: `npm run audit`
- Test RLS locale: `npm run test:db` (richiede Docker/Supabase locale)
- Acceptance cloud: `npm run test:cloud` (richiede credenziali test server, mai `VITE_*`)

## Architettura prodotto

La bottom navigation ha cinque schermate:

- **Home:** selettore pet, hero fotografico, massimo tre scadenze, orari uscite e Pet Card;
  niente logging.
- **Diario:** CTA unica, caregiver, attività di oggi e giorni precedenti in accordion.
- **Cura:** due dati chiave e indice del libretto; record e inserimento vivono nei dettagli.
- **Scopri:** esattamente tre ingressi — Quiz, Guide, Giochi & trucchi — su pagine separate.
- **Profilo:** identità, animali in famiglia e menu essenziali; “Modifica pet” è una pagina.

## Modello multi-animale

- Struttura versionata: `household → pets[] → profile/events/health/progress`.
- Specie ammesse: soltanto `cane | gatto`. Ogni scheda ha dati, Diario e Cura indipendenti.
- Il selettore animale è globale e permette di aggiungere altre schede.
- Il vecchio profilo cane viene migrato automaticamente nel primo elemento di `pets[]`.
- Ogni modifica importante crea un backup locale automatico.
- L’export JSON comprende tutti i pet ed è re-importabile; il PDF è una copia leggibile.
- Ogni modifica al modello richiede test di migrazione e round-trip export/reset/import.

## L’app cresce col pet

- `lifePhase`: `cucciolo | adulto | senior`, scelta manuale; per il gatto “cucciolo” si
  presenta come “Gattino”. Default `adulto`; la nascita suggerisce ma non decide.
- `trackedModules` resta nel modello soltanto per compatibilità con dati e migrazioni esistenti:
  non ha più UI e non pilota la visibilità.
- Il Diario deriva le azioni dalla specie e dalle condizioni: Uscita per il cane, Lettiera per
  il gatto, Pipì/Cacca soltanto con `problemi_urinari` o `potty_training`.
- `conditions`: `problemi_urinari`, `terapia_in_corso`, `mobilita_ridotta`,
  `peso_controllato`, `potty_training`. Sono etichette organizzative, mai diagnosi.
- Gli orari abituali delle uscite sono dati per pet: Home e Impostazioni usano la stessa fonte;
  ogni orario può avere un promemoria in-app attivo e viene segnato fatto vicino a un’uscita.

## Dati e interazioni

- La registrazione vive nel Diario: Uscita per il cane, Pappa, Nota e Farmaco con terapia.
- Acqua non compare. Ogni azione apre sempre il popup con data, ora, caregiver e nota.
- Le uscite accettano durata 15/30/45/60 minuti o personalizzata.
- Il Diario conserva audit e soft-delete. I record Cura supportano aggiunta, modifica ed
  eliminazione per vaccini, prevenzione/sverminazione, farmaci, visite, peso, grooming e documenti.
- Lo scadenzario deriva da richiami, antiparassitari con pausa stagionale, sverminazione,
  terapie, visite, controllo annuale, assicurazione e verifica dati microchip.
- Cura include lotto e scadenza vaccino, documenti sulle voci, peso, condizioni/malattie,
  microchip e toelettatura come memoria morbida, fuori dal Diario.
- La Pet Card ridisegnata funziona offline, è stampabile/PDF e condivisibile. Badge e progressi
  non usano streak, classifiche o penalità. L’addestramento usa solo rinforzo positivo.

## Onboarding e tutorial

Onboarding in nove passaggi: specie → nome/foto → nascita/fase → sesso/razza/taglia → peso →
microchip → veterinario/contatto → caregiver → condizioni. Non esiste uno step di selezione
moduli; l’interfaccia deriva le azioni da specie e condizioni.

Dopo l’onboarding parte un tutorial skippabile: cinque coach-mark per il cane (incluso il blocco
Uscite in Home), quattro per il gatto. Naviga alle sezioni e resta riapribile dal Profilo.

## Principi di UX

- Sezioni separate e ordinate; ogni schermata ha un solo focus chiaro.
- Logging facoltativo, mai presentato come obiettivo o compito.
- Mobile-first: testo base almeno 16px, etichette almeno 14px, target touch almeno 44px.
- Verificare sempre a 390px, con contrasto alto, focus visibile e `prefers-reduced-motion`.
- Italiano umano, tono caldo e fattuale; usare sempre il nome del pet.
- Icone solo `lucide-react`; niente emoji nell’interfaccia.
- Canvas bianco caldo `#FDFCFA`; card bianche, raggi 20–22px e ombra quasi impercettibile.
- Controlli con raggi 12–16px, ritmo 8px e molto spazio bianco; niente muri di card o testo.
- Fraunces soltanto per titoli di schermata e nomi/numeri chiave; Jakarta per tutto il resto.
- Avatar sempre perfettamente tondi; foto utente o fallback illustrato caldo per specie.

## Guardrail di prodotto — NON violare

- Farmaci, dosi, vaccini, visite, scadenze e documenti sono inseriti e confermati a mano.
- Nessun OCR, import automatico o salvataggio automatico di dati sanitari.
- Nessun health score, diagnosi, consiglio clinico, target attività o percentuale di felicità.
- Uscite e attività mostrano fatti descrittivi. Mai allarmi, correzioni o “deve uscire”.
- Le passeggiate non rappresentano tutta l’attività; mai usare passi generici del telefono.
- Ogni evento conserva autore e timestamp; le modifiche mantengono l’audit trail.
- I promemoria uscite sono solo in-app e funzionano ad app aperta. Le push affidabili richiedono
  una fase nativa successiva e test su device; non dichiararle disponibili prima di allora.
- Niente abbonamenti, paywall, advertising, social interno o dark pattern.
- Le guide sono statiche: niente chatbot, diagnosi, dosaggi o consigli personalizzati; solo
  metodi gentili. Ogni guida chiude con “Quando chiamare il veterinario” e disclaimer.
- La rilevanza delle guide dipende da `species` e `lifePhase`, mai da `profile.createdAt`.
- Prima del lancio reale i testi vanno revisionati da educatore o veterinario.

## Design token

- Clay `#D9694A`, Honey `#F2B24C`, Sage `#8FA083`, Ink `#2B2320`,
  Cream `#FBF6EE`, Sand `#EFE3D1`.
- Canvas `#FDFCFA`; blu funzionale `#5E7C8B` per farmaci e contatti.
- Fraunces per titoli di schermata e numeri chiave; Plus Jakarta Sans per UI e testo.

## Convenzioni

- TypeScript strict; vietato `any`.
- File sotto 300 righe; dividere componenti, schermate, stato e logica dominio.
- Riutilizzare il codice esistente; niente riscritture parallele, codice morto o regressioni.
- Prima della consegna eseguire `npm test`, `npm run build`, `npm run audit` e controllare il diff.
