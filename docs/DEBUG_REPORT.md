# Cuccia — Debug report completo

Data audit: 2026-09-01  
Scope: repository frontend Vite/React/TypeScript, boundary locale/cloud, Supabase Phase 1, routing,
accessibilità e test. Nessuna migration, policy RLS o decisione di prodotto è stata modificata
durante l'analisi.

## 1. Metodo e baseline

Sono stati letti `AGENTS.md`, `docs/QUALITY_STANDARD.md`, `docs/SPEC.md`, `docs/AUDIT.md`,
`docs/PROJECT_BRIEF.md`, i repository locali/cloud, i flussi auth/entry, i componenti CRUD, le
rotte, i calcoli di scadenza e la suite di test. È stata inoltre eseguita una verifica browser a
390 px sulle schermate principali e sulle sottorotte di Scopri.

Baseline prima dei fix:

| Controllo | Esito | Note |
|---|---:|---|
| `npm test` | PASS | 42/42 test |
| `npm run build` | PASS con warning | bundle JS 672,45 kB, oltre la soglia Vite di 500 kB |
| `npm run security` | PASS | env ignorati e nessun segreto riconoscibile nel repository/bundle |
| `npm audit` | PASS | 0 vulnerabilità |
| Browser 390 px | PASS parziale | rotte principali senza crash; overflow nella guida rilevato |
| `npm run test:db` | NON ESEGUITO | Docker Desktop non è attivo; connessione a `127.0.0.1:54322` rifiutata |
| `npm run test:cloud` | NON ESEGUITO | nessuna credenziale test remota nel processo e stack Docker locale spento |

La suite SQL contiene 35 assert pgTAP: 5 schema, 21 RLS e 9 reset account. Il loro contenuto è
stato ispezionato staticamente, ma in questa sessione non è corretto dichiararli PASS.

## 2. Problemi critici

### DBG-001 — I dati dell'account possono diventare dati guest dopo il logout

- **File:riga:** `src/App.tsx:105`, `src/App.tsx:185`.
- **Descrizione:** quando la sessione sparisce, l'app mostra il benvenuto ma lascia nello stato
  React i dati dell'account. Se non esiste ancora una cache guest e si preme “Prova senza account”,
  `enterGuestMode` salva i dati correnti dell'account come cache guest invece di partire vuoto.
- **Riproduzione:** accedere da un browser senza precedente modalità guest, creare/caricare un pet,
  uscire, quindi scegliere “Prova senza account”.
- **Impatto:** dati cloud personali possono essere consultati senza autenticazione sullo stesso
  browser; il confine account/guest non è affidabile.
- **Correzione proposta:** al logout salvare la cache dell'account, sostituire subito lo stato con
  la cache guest o con uno stato vuoto e non usare mai i dati account come fallback guest.
- **Stato iniziale:** da correggere; fix chiaro, locale e a basso rischio.

### DBG-002 — Un orario farmaco non valido può mandare l'app in error boundary

- **File:riga:** `src/screens/HealthRecordDialog.tsx:52`,
  `src/screens/HealthRecordDialog.tsx:100`, `src/screens/HealthRecordDialog.tsx:133`,
  `src/lib/deadlines.ts:12`.
- **Descrizione:** gli orari terapia sono testo libero. Valori come `mattina`, `25:90` o una lista
  vuota arrivano a `Date.setHours(NaN)` e poi a `toISOString()`. Inoltre, in assenza di orari il
  motore inventa una dose alle 09:00.
- **Riproduzione:** Cura → Farmaci → aggiungere una terapia attiva → scrivere `mattina` negli
  orari → salvare. Al ricalcolo scadenze può comparire il fallback globale.
- **Impatto:** crash della schermata e falso promemoria sanitario, contrario ai guardrail di
  inserimento manuale e assenza di allarmi inventati.
- **Correzione proposta:** validare il formato `HH:MM`, rendere il calcolo difensivo, non creare
  scadenze senza orari validi e rispettare inizio/fine terapia.
- **Stato iniziale:** da correggere; fix chiaro e a basso rischio con test deterministici.

## 3. Problemi alti

### DBG-003 — Il bootstrap cloud preferisce indefinitamente la cache al server

- **File:riga:** `src/App.tsx:129`, `src/App.tsx:131`, `src/App.tsx:133`,
  `src/cloud/cloudBootstrapRepository.ts:21`.
- **Descrizione:** se Supabase conferma che esiste almeno un pet e la cache account contiene pet,
  l'app non esegue `loadCloudAppData`. Le URL firmate dei media scadono dopo un'ora, ma la cache può
  continuare a riutilizzarle.
- **Riproduzione:** modificare i dati da un secondo browser o attendere la scadenza di una signed
  URL, poi ricaricare il primo browser con cache account popolata.
- **Impatto:** dati stantii, modifiche remote invisibili e foto/documenti che smettono di aprirsi.
- **Correzione proposta:** bootstrap remote-first con cache come fallback offline, riconciliazione
  esplicita e rinnovo URL. È parte del repository/outbox della Phase 2.
- **Stato iniziale:** segnalato, non corretto; richiede scelta architetturale Phase 2.

### DBG-004 — CRUD cloud incompleto per entità esposte dalla UI

- **File:riga:** `src/state/AppState.tsx:69`, `src/state/AppState.tsx:149`,
  `src/state/AppState.tsx:171`, `src/state/AppState.tsx:189`, `src/state/AppState.tsx:200`,
  `src/state/AppState.tsx:207`, `src/state/AppState.tsx:222`.
- **Descrizione:** Diario, aggiunta/rimozione pet, caregiver, quiz e progressi vengono modificati
  solo nello stato/cache locale. Cura e Profilo hanno invece scritture cloud parziali.
- **Riproduzione:** da account cloud aggiungere un pet o un evento, oppure eliminare un pet; aprire
  l'account su un altro browser o forzare un caricamento remoto.
- **Impatto:** le azioni possono sparire o riapparire; il prodotto sembra sincronizzato solo in
  alcune sezioni. La rimozione pet cloud in particolare non è realmente eseguita.
- **Correzione proposta:** completare comandi/repository, outbox idempotente e realtime nella
  Phase 2, mantenendo invariata l'API di `useAppState`.
- **Stato iniziale:** segnalato, non corretto; il fix isolato sarebbe incompleto e rischioso.

### DBG-005 — Le scritture cloud ottimistiche non hanno retry durevole

- **File:riga:** `src/state/AppState.tsx:84`, `src/state/AppState.tsx:88`,
  `src/state/AppState.tsx:106`, `src/cloud/cloudProfileMutations.ts:29`.
- **Descrizione:** la UI salva localmente, lancia una Promise cloud e in caso di errore mostra un
  toast, ma non conserva una mutation pending. Profilo e documenti sono inoltre scritti in più
  passaggi non atomici.
- **Riproduzione:** disattivare la rete durante una modifica Cura/Profilo, poi ricaricare da un
  dispositivo che legge il cloud.
- **Impatto:** divergenza silenziosa locale/cloud e possibile sovrascrittura dell'ultima modifica
  quando il server torna a essere la sorgente.
- **Correzione proposta:** outbox con `client_mutation_id`, retry e stato pending/synced/failed;
  per operazioni multi-tabella valutare RPC transazionali senza allentare RLS.
- **Stato iniziale:** segnalato, non corretto; dipendenza esplicita della Phase 2.

### DBG-006 — Eliminazioni locali Cura/documenti non conservano audit o soft-delete

- **File:riga:** `src/state/healthRecords.ts:16`, `src/state/AppState.tsx:146`,
  `src/state/AppState.tsx:148`.
- **Descrizione:** gli eventi Diario sono soft-deleted, mentre record sanitari e documenti vengono
  rimossi fisicamente dallo stato locale. Il cloud usa invece `deleted_at` per i record Cura.
- **Riproduzione:** eliminare un vaccino o documento in modalità locale ed esportare il backup.
- **Impatto:** il backup corrente non conserva l'audit trail dichiarato in `AGENTS.md`; locale e
  cloud hanno semantiche diverse.
- **Correzione proposta:** decidere un modello di tombstone/audit comune e migrarlo con test di
  round-trip. Richiede modifica del modello dati.
- **Stato iniziale:** segnalato, non corretto per vincolo su modello/migrazioni.

## 4. Problemi medi

### DBG-007 — Il salvataggio precedente viene scritto ma mai usato nel recupero

- **File:riga:** `src/lib/storage.ts:28`, `src/lib/storage.ts:50`.
- **Descrizione:** `PREVIOUS_STORAGE_KEY` conserva la versione precedente, ma `loadAppData` prova
  solo corrente, backup automatico e legacy.
- **Riproduzione:** eseguire due salvataggi, corrompere sia chiave corrente sia backup automatico,
  quindi ricaricare.
- **Impatto:** l'app torna vuota anche se esiste una copia precedente valida.
- **Correzione proposta:** aggiungere il previous save alla catena di recovery e un test.
- **Stato iniziale:** da correggere; fix locale e a basso rischio.

### DBG-008 — L'import accetta versioni backup future senza avvisare

- **File:riga:** `src/lib/backup.ts:21`.
- **Descrizione:** viene controllato il formato ma non `version`. Un client vecchio può importare
  un backup futuro, ignorare campi sconosciuti e risalvarlo impoverito.
- **Riproduzione:** cambiare `version` a `3` in un backup v2 e importarlo.
- **Impatto:** rischio di perdita dati durante downgrade/import con client non compatibile.
- **Correzione proposta:** rifiutare versioni non supportate con errore chiaro.
- **Stato iniziale:** da correggere; fix locale e a basso rischio.

### DBG-009 — La guida deborda orizzontalmente a 390 px

- **File:riga:** `src/styles/guides.css:36`, `src/styles/guides.css:75`,
  `src/styles/minimal-restyle.css:149`.
- **Descrizione:** la pagina ha padding finale di 18 px, mentre l'header usa margini negativi di
  20 px; a 390 px il documento è 2 px più largo del viewport. Lo stesso scarto esiste sul desktop
  tra padding 24 px e margine 26 px.
- **Riproduzione:** aprire `/scopri/guida/puppy-blues` a 390 px e confrontare `scrollWidth` con
  `clientWidth`.
- **Impatto:** piccolo scroll laterale e disallineamento visivo.
- **Correzione proposta:** allineare i margini full-bleed al padding effettivo e aggiungere test.
- **Stato iniziale:** da correggere; fix CSS isolato e a basso rischio.

### DBG-010 — Diverse dimensioni testo restano sotto lo standard dichiarato

- **File:riga:** `src/styles/minimal-restyle.css:54`, `src/styles/minimal-restyle.css:70`,
  `src/styles/minimal-restyle.css:81`, `src/styles/minimal-restyle.css:88`,
  `src/styles/minimal-restyle.css:93`, `src/styles/minimal-restyle.css:102`,
  `src/styles/minimal-restyle.css:140`.
- **Descrizione:** secondari, empty state, toast e alcuni controlli usano 12–15 px; il documento di
  qualità richiede testo mobile almeno 16 px e target almeno 44 px.
- **Riproduzione:** ispezionare Home, Diario, Cura e Profilo a 390 px.
- **Impatto:** leggibilità ridotta, soprattutto per utenti anziani.
- **Correzione proposta:** passata tipografica visual-regression su tutte le schermate, distinguendo
  soltanto eyebrow/metadata realmente accessorie.
- **Stato iniziale:** segnalato, non corretto; è una modifica visiva ampia, non un fix isolato.
- **Stato attuale:** **corretto** in `8c48e52`; guardrail finale a 16 px/44 px, test statico e
  verifica browser a 390 px su cinque tab e modale senza overflow.

### DBG-011 — I modali non gestiscono focus, Escape e focus return

- **File:riga:** `src/components/Modal.tsx:13`.
- **Descrizione:** il body viene bloccato correttamente, ma il dialog non porta il focus al suo
  interno, non lo contiene, non chiude con Escape e non restituisce il focus all'elemento origine.
- **Riproduzione:** aprire un popup e navigare solo con Tab/Shift+Tab/Escape.
- **Impatto:** navigazione tastiera e screen reader non completamente accessibili.
- **Correzione proposta:** focus iniziale, trap, Escape e ripristino focus nel componente base,
  con test DOM reale.
- **Stato iniziale:** segnalato, non corretto; richiede test browser/accessibilità dedicato.
- **Stato attuale:** **corretto** in `7f1f8f3`; verificati Tab, Shift+Tab, Escape e ritorno del
  focus al pulsante di apertura.

### DBG-012 — Calcoli data non completamente timezone-safe

- **File:riga:** `src/lib/date.ts:23`, `src/lib/date.ts:29`, `src/lib/date.ts:52`.
- **Descrizione:** date locali vengono convertite con `toISOString().slice(0, 10)`. Vicino alla
  mezzanotte in timezone positive, `isoDateFromNow` e l'etichetta “Ieri” possono slittare di un
  giorno; `addDays` può farlo nei fusi estremi.
- **Riproduzione:** eseguire i calcoli vicino alle 00:00 con TZ positiva o in UTC+13/UTC+14.
- **Impatto:** date demo, etichette Diario o cadenze possono risultare anticipate.
- **Correzione proposta:** usare sempre chiavi data locali pure e test parametrizzati per TZ.
- **Stato iniziale:** segnalato, non corretto in questa passata perché richiede una revisione
  coordinata di tutte le date.

### DBG-013 — Cache entry silenziosa in caso di quota piena

- **File:riga:** `src/entry/entryCache.ts:20`, `src/entry/entryCache.ts:43`,
  `src/entry/entryCache.ts:57`.
- **Descrizione:** tutti gli errori localStorage vengono ignorati; il repository principale mostra
  un toast, ma cache guest/account e flag import no.
- **Riproduzione:** saturare localStorage e fare login, logout o completare la scelta import.
- **Impatto:** la scelta import può ricomparire e la cache account/guest può non aggiornarsi senza
  spiegazione.
- **Correzione proposta:** ritornare un esito tipizzato e mostrare un messaggio unico dal flusso
  entry, senza duplicare scritture.
- **Stato iniziale:** segnalato, non corretto; coinvolge il contratto di cache/entry.

### DBG-014 — Il reset cloud non è atomico tra Storage e database

- **File:riga:** `src/cloud/accountResetRepository.ts:11`.
- **Descrizione:** i file Storage vengono eliminati prima della RPC database. Se la seconda fase
  fallisce, le righe rimangono ma i file non esistono più.
- **Riproduzione:** far riuscire la rimozione Storage e interrompere la rete prima di
  `reset_my_cloud_data`.
- **Impatto:** reset parziale con allegati persi.
- **Correzione proposta:** workflow server-side/retryable con stato operazione, oppure ordine e
  compensazione documentati. Richiede decisione backend e migration/RPC.
- **Stato iniziale:** segnalato, non corretto per vincolo backend.

## 5. Problemi bassi e drift

### DBG-015 — Copia onboarding errata in modalità cloud

- **File:riga:** `src/onboarding/Onboarding.tsx:130`.
- **Descrizione:** il microchip viene descritto come salvato “solo su questo dispositivo” anche
  durante onboarding cloud.
- **Riproduzione:** creare un nuovo pet dopo login e arrivare al passaggio Microchip.
- **Impatto:** informazione fuorviante sulla destinazione del dato.
- **Correzione proposta:** copia condizionale locale/account dopo decisione prodotto/privacy.
- **Stato iniziale:** segnalato, non corretto perché cambia una promessa all'utente.
- **Stato attuale:** **corretto** in `d29f145`; copy derivata dalla presenza della sessione.

### DBG-016 — Bundle iniziale sopra la soglia Vite

- **File:riga:** `src/App.tsx:1`, `src/main.tsx:9`.
- **Descrizione:** tutte le schermate sono importate eager; build JS 672,45 kB (193,69 kB gzip).
- **Riproduzione:** `npm run build`.
- **Impatto:** caricamento iniziale più lento su rete mobile.
- **Correzione proposta:** lazy loading per sottopagine Scopri/Profile Editor in un intervento
  performance separato, con loading state e test deep-link.
- **Stato iniziale:** segnalato, non corretto; refactor routing non necessario al debug attuale.

### DBG-017 — Documentazione operativa non rappresenta il codice corrente

- **File:riga:** `AGENTS.md:13`, `AGENTS.md:69`, `AGENTS.md:77`,
  `docs/PROJECT_BRIEF.md:1`, `docs/PROJECT_BRIEF.md:69`, `docs/AUDIT.md:1`,
  `docs/AUDIT.md:44`.
- **Descrizione:** i documenti parlano ancora di Fase 0 senza backend, Consiglio del momento,
  clicker/fischietto, quattro step tutorial e rotta `traucco`; il codice ha Supabase Phase 1,
  Quiz/Guide/Giochi, cinque step cane e la rotta reale `/scopri/trucco/:id`.
- **Riproduzione:** confrontare documenti con `src/App.tsx`, `src/screens/DiscoverScreen.tsx` e
  `src/components/TutorialCoach.tsx`.
- **Impatto:** prossime sessioni possono reintrodurre funzionalità rimosse o seguire vincoli
  superati.
- **Correzione proposta:** riallineamento documentale approvato, senza cambiare prodotto.
- **Stato iniziale:** segnalato, non corretto come richiesto dall'audit.
- **Stato attuale:** **corretto** in `f8edc09`; aggiunto test anti-drift sui riferimenti rimossi e
  sulle feature correnti.

### DBG-018 — Copertura test prevalentemente logica/statica, non browser end-to-end

- **File:riga:** `tests/entry-flow.test.ts:1`, `tests/modal-layout.test.ts:1`,
  `scripts/cloud-acceptance.ts:1`.
- **Descrizione:** i test unitari coprono bene dati e stringhe sorgente, ma non simulano il ciclo
  React completo logout→guest, focus modale, onboarding UI o offline/retry. L'acceptance Supabase
  usa API/repository, non il browser.
- **Riproduzione:** consultare la suite; non esiste un runner E2E browser nel `package.json`.
- **Impatto:** regressioni di wiring e timing possono passare pur con unit test verdi.
- **Correzione proposta:** smoke E2E separato per entry/auth, CRUD e modali, senza sostituire pgTAP.
- **Stato iniziale:** segnalato, non corretto; aggiungere infrastruttura E2E non è un fix minimo.

## 6. Verifiche positive

- Nessuna service-role/secret key è usata dal bundle client; `src/lib/supabase.ts` accetta solo
  variabili `VITE_*` e rifiuta chiavi server riconoscibili.
- `.env.local` non è tracciato e il controllo sicurezza passa.
- Il flusso “con pet → app, senza pet → onboarding” è espresso in una funzione pura e coperto da
  test; l'error boundary globale evita lo schermo bianco.
- CRUD locale Cura, documenti ed eventi è raggiungibile; peso Profilo/Cura usa lo stesso storico.
- Modali: body lock, corpo scrollabile e footer fisso risultano implementati e testati.
- Rotte principali, sottopagine Scopri e fallback per ID non validi non causano crash; la tab
  Scopri resta attiva nelle sottopagine.
- Diario deriva uscite/lettiera/bisogni da specie e condizioni, non da `trackedModules`.
- Giochi/trucchi da cane non vengono renderizzati nella pagina gatti; viene mostrato un empty state.
- Nessun `any`, `@ts-ignore`, `TODO` o `FIXME` è presente nel codice applicativo.

## 7. Limiti reali di verifica

- Nessun test su device fisico è necessario per le funzionalità attuali; push/background non sono
  implementati e non vengono dichiarati verificati.
- RLS e reset account non sono stati rieseguiti perché Docker Desktop non è avviato.
- Il test remoto non è stato eseguito: nel processo non sono presenti
  `SUPABASE_TEST_URL`, `SUPABASE_TEST_ANON_KEY` e `SUPABASE_TEST_SERVICE_ROLE_KEY`. La service role
  non deve essere aggiunta alle variabili `VITE_*` né committata.
- La verifica browser è stata eseguita in modalità guest con dati dimostrativi/cache locale; auth
  email, conferma e rete offline non sono stati pilotati dalla UI contro il progetto remoto.

## 8. Fix minimi autorizzabili dopo il report

In ordine di gravità e con un test di regressione per commit:

1. separazione sicura account → guest (`DBG-001`);
2. calcolo/validazione orari farmaci (`DBG-002`);
3. recovery dal previous save (`DBG-007`);
4. rifiuto backup di versione futura (`DBG-008`);
5. overflow guida a 390 px e desktop (`DBG-009`).

Tutti gli altri punti restano aperti perché richiedono Phase 2, backend/migration, una decisione
di prodotto o un intervento visivo/architetturale non isolato.

## 9. Esito dopo i fix minimi

### Problemi corretti

| Issue | Esito | Commit | Regressione coperta |
| --- | --- | --- | --- |
| `DBG-001` | **CORRETTO** | `531eacf` | logout/account non alimenta più la modalità guest; guest senza cache parte vuoto |
| `DBG-002` | **CORRETTO** | `5c2e1f6` | orari malformati rifiutati; nessun promemoria fittizio alle 09:00; intervallo terapia rispettato |
| `DBG-007` | **CORRETTO** | `ae646bf` | recupero dal salvataggio precedente quando stato corrente e backup automatico sono corrotti |
| `DBG-008` | **CORRETTO** | `de70e63` | backup con versione futura non supportata rifiutato esplicitamente |
| `DBG-009` | **CORRETTO** | `77b9d64` | lettore guide senza overflow orizzontale a 390 px |
| `DBG-010` | **CORRETTO** | `8c48e52` | corpo ≥16 px, target ≥44 px e nessun overflow sulle cinque tab e un modale a 390 px |
| `DBG-011` | **CORRETTO** | `7f1f8f3` | focus iniziale/trap, Escape e ritorno focus verificati da tastiera |
| `DBG-015` | **CORRETTO** | `d29f145` | copy microchip distinta tra account cloud e dispositivo locale |
| `DBG-017` | **CORRETTO** | `f8edc09` | documenti riallineati e test anti-drift |

### Problemi ancora aperti

- **Alti:** `DBG-003`–`DBG-006`; richiedono Phase 2, affidabilità cloud o una modifica del modello.
- **Medi:** `DBG-012`–`DBG-014`; richiedono revisione date, cache entry o reset cloud.
- **Bassi:** `DBG-016` e `DBG-018`; performance bundle ed E2E browser completo.

### Matrice finale

- **PASS — unit/integration:** `npm test`, 56 test su 56.
- **PASS — build produzione:** `npm run build`; resta il warning noto `DBG-016` sul chunk iniziale
  da 674,62 kB (194,44 kB gzip).
- **PASS — sicurezza repository:** `npm run security`.
- **PASS — dipendenze:** `npm audit`, 0 vulnerabilità note.
- **PASS — verifica browser guest:** Home, Diario, Cura, Scopri, Profilo e un modale a 390 px;
  nessun corpo sotto 16 px, target sotto 44 px o overflow orizzontale. Focus trap/Escape/return
  verificati da tastiera.
- **BLOCCATO — DB locale/RLS:** `npm run test:db` non può partire perché Docker Desktop non è in
  esecuzione; non è un fallimento dei test SQL. La suite contiene attualmente 35 assert pgTAP.
- **BLOCCATO — cloud acceptance:** `npm run test:cloud` richiede Docker e credenziali test server
  non presenti nel processo. Nessun test remoto o su device viene dichiarato come eseguito.
